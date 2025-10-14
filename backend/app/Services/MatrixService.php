<?php

namespace App\Services;

use App\Models\Matriz;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;
use PhpOffice\PhpSpreadsheet\Cell\Coordinate;
use PhpOffice\PhpSpreadsheet\IOFactory;
use PhpOffice\PhpSpreadsheet\Reader\Xlsx;
use PhpOffice\PhpSpreadsheet\Settings;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use PhpOffice\PhpSpreadsheet\Collection\Cells\MemoryGZip;

use function Laravel\Prompts\select;

class MatrixService
{
    private static ?bool $hasIdCC  = null;
    private static ?bool $hasIdMSC = null;

    private const CHUNK_SIZE = 1000;

    public function indexFiltered(int $perPage = 15, ?string $q = null): LengthAwarePaginator
    {
        $paginator = Matriz::query()
            ->select(['id', 'curso_id', 'nome', 'versao', 'vigente_de', 'vigente_ate'])
            ->with(['curso:id,nome'])
            ->when($q, function ($qb) use ($q) {
                $term = "%{$q}%";
                $qb->where(function ($w) use ($term) {
                    $w->where('nome', 'ilike', $term)
                      ->orWhere('versao', 'ilike', $term);
                });
            })
            ->paginate($perPage);

        $paginator->getCollection()->transform(function (Matriz $m) {
            return [
                'id' => (string) $m->id,
                'nome' => $m->nome,
                'versao' => $m->versao,
                'vigencia' => [
                    'de'  => $m->vigente_de,
                    'ate' => $m->vigente_ate,
                ],
                'curso' => [
                    'nome' => optional($m->curso)->nome,
                ],
            ];
        });

        return $paginator;
    }

    public function delete(string $matrizId): bool
    {
        if (!DB::table('matrizes')->where('id', $matrizId)->exists()) {
            $ex = new ModelNotFoundException('Matriz não encontrada.');
            $ex->setModel(Matriz::class, [$matrizId]);
            throw $ex;
        }

        try {
            DB::connection()->disableQueryLog();
        } catch (\Throwable $e) {
        }

        return DB::transaction(function () use ($matrizId) {
            $deleted = [
                'matriz_subfuncao_conhecimento' => 0,
                'competencia_conhecimento'      => 0,
                'subfuncoes'                    => 0,
                'funcoes'                       => 0,
                'competencias'                  => 0,
                'categorias'                    => 0,
                'conhecimentos'                 => 0,
                'matrizes'                      => 0,
            ];

            $deleted['matriz_subfuncao_conhecimento'] =
                DB::table('matriz_subfuncao_conhecimento')
                    ->where('matriz_id', $matrizId)
                    ->delete();

            $categoriaIds    = DB::table('categorias')->where('matriz_id', $matrizId)->pluck('id');
            $funcaoIds       = DB::table('funcoes')->where('matriz_id', $matrizId)->pluck('id');

            $competenciaIds  = $categoriaIds->isNotEmpty()
                ? DB::table('competencias')->whereIn('categoria_id', $categoriaIds)->pluck('id') : collect();

            $subfuncaoIds    = $funcaoIds->isNotEmpty()
                ? DB::table('subfuncoes')->whereIn('funcao_id', $funcaoIds)->pluck('id') : collect();

            $conhecimentoIds = DB::table('conhecimentos')->where('matriz_id', $matrizId)->pluck('id');

            if ($competenciaIds->isNotEmpty()) {
                foreach (array_chunk($competenciaIds->all(), self::CHUNK_SIZE) as $chunk) {
                    $deleted['competencia_conhecimento'] += DB::table('competencia_conhecimento')
                        ->whereIn('competencia_id', $chunk)
                        ->delete();
                }
            }

            if ($conhecimentoIds->isNotEmpty()) {
                foreach (array_chunk($conhecimentoIds->all(), self::CHUNK_SIZE) as $chunk) {
                    $deleted['competencia_conhecimento'] += DB::table('competencia_conhecimento')
                        ->whereIn('conhecimento_id', $chunk)
                        ->delete();
                }
            }

            if ($subfuncaoIds->isNotEmpty()) {
                foreach (array_chunk($subfuncaoIds->all(), self::CHUNK_SIZE) as $chunk) {
                    $deleted['subfuncoes'] += DB::table('subfuncoes')->whereIn('id', $chunk)->delete();
                }
            }

            if ($funcaoIds->isNotEmpty()) {
                foreach (array_chunk($funcaoIds->all(), self::CHUNK_SIZE) as $chunk) {
                    $deleted['funcoes'] += DB::table('funcoes')->whereIn('id', $chunk)->delete();
                }
            }

            if ($competenciaIds->isNotEmpty()) {
                foreach (array_chunk($competenciaIds->all(), self::CHUNK_SIZE) as $chunk) {
                    $deleted['competencias'] += DB::table('competencias')->whereIn('id', $chunk)->delete();
                }
            }

            if ($categoriaIds->isNotEmpty()) {
                foreach (array_chunk($categoriaIds->all(), self::CHUNK_SIZE) as $chunk) {
                    $deleted['categorias'] += DB::table('categorias')->whereIn('id', $chunk)->delete();
                }
            }

            if ($conhecimentoIds->isNotEmpty()) {
                foreach (array_chunk($conhecimentoIds->all(), self::CHUNK_SIZE) as $chunk) {
                    $deleted['conhecimentos'] += DB::table('conhecimentos')->whereIn('id', $chunk)->delete();
                }
            }

            $deleted['matrizes'] = DB::table('matrizes')->where('id', $matrizId)->delete();

            return true;
        });
    }

    public function importMatrix(array $data): array
    {
        $t0 = microtime(true);
        $file = $data['file'] ?? null;
        if (!$file instanceof UploadedFile) {
            throw new \InvalidArgumentException('Arquivo inválido para importação.');
        }

        try {
            DB::connection()->disableQueryLog();
        } catch (\Throwable $_) {
        }

        $payload = [
            'curso_id'   => $data['curso_id'],
            'nome'       => $data['nome'],
            'versao'     => $data['versao'],
            'vigente_de' => $data['vigente_de'] ?? null,
            'vigente_ate' => $data['vigente_ate'] ?? null,
        ];

        $mapped = $this->parseFile($file);

        return $this->persistMappedMatrix($mapped, $payload);
    }

    public function parseFile(UploadedFile $file): array
    {
        [$sheetUC, $sheetOC] = $this->loadSheetsSelective(
            $file,
            [
                'UC',
                'Unid. Curriculares', 'Unid Curriculares',
                'Unidades Curriculares', 'Unidade Curricular',
            ],
            [
                'Obj_Conhec (OC)', 'Obj Conhec (OC)', 'Obj Conhec(OC)',
                'Obj_Conhec', 'Obj Conhec', 'OC',
                'Objetos de Conhecimento', 'Objeto de Conhecimento',
            ],
        );

        $ucCategorias    = $sheetUC ? $this->extractCategoriesAndCompetencies($sheetUC) : [];
        $ucFuncoes       = $sheetUC ? $this->extractFuncoesSubfuncoes($sheetUC)        : [];
        $ocConhecimentos = $sheetOC ? $this->extractConhecimentos($sheetOC)          : [];

        return [
            'uc_categorias'    => $ucCategorias,
            'uc_funcoes'       => $ucFuncoes,
            'uc_cruzamentos'   => $sheetUC ? $this->extractCruzamentos($sheetUC, $ucFuncoes, $ucCategorias) : [],
            'oc_conhecimentos' => $ocConhecimentos,
        ];
    }

    private function loadSheetsSelective(UploadedFile $file, array $ucCandidates, array $ocCandidates): array
    {
        $reader = new Xlsx();
        $names  = $reader->listWorksheetNames($file->getPathname());

        $norm = fn($s) => preg_replace('/[^a-z0-9]/', '', mb_strtolower($s));
        $map  = [];
        foreach ($names as $n) {
            $map[$norm($n)] = $n;
        }

        $pick = function (array $cands) use ($map, $norm) {
            foreach ($cands as $c) {
                $k = $norm($c);
                if (isset($map[$k])) {
                    return $map[$k];
                }
            }
            foreach ($map as $k => $orig) {
                foreach ($cands as $c2) {
                    if (str_contains($k, $norm($c2))) {
                        return $orig;
                    }
                }
            }
            return null;
        };

        $ucName = $pick($ucCandidates);
        $ocName = $pick($ocCandidates);

        $toLoad = array_values(array_filter([$ucName, $ocName]));
        if (!$toLoad) {
            return [null, null];
        }

        $reader->setReadDataOnly(true);
        $reader->setLoadSheetsOnly($toLoad);
        $spreadsheet = $reader->load($file->getPathname());

        return [
            $ucName ? $spreadsheet->getSheetByName($ucName) : null,
            $ocName ? $spreadsheet->getSheetByName($ocName) : null,
        ];
    }

    private function findSheet($spreadsheet, array $candidates)
    {
        foreach ($candidates as $name) {
            $s = $spreadsheet->getSheetByName($name);
            if ($s) {
                return $s;
            }
        }
        $norm = fn($s) => preg_replace('/[^a-z0-9]/', '', mb_strtolower($s));
        $cand = array_map($norm, $candidates);

        foreach ($spreadsheet->getWorksheetIterator() as $sheet) {
            if (in_array($norm($sheet->getTitle()), $cand, true)) {
                return $sheet;
            }
        }
        return null;
    }

    private function extractCategoriesAndCompetencies(Worksheet $sheet): array
    {
        $rowCat    = 2;
        $rowNome1  = 3;
        $rowNome2  = 4;
        $rowCodigo = 5;

        $maxColLetter = $sheet->getHighestColumn();
        $maxCol       = Coordinate::columnIndexFromString($maxColLetter);

        [$catRow]   = $sheet->rangeToArray("A{$rowCat}:{$maxColLetter}{$rowCat}", null, true, true, false);
        [$nome1Row] = $sheet->rangeToArray("A{$rowNome1}:{$maxColLetter}{$rowNome1}", null, true, true, false);
        [$nome2Row] = $sheet->rangeToArray("A{$rowNome2}:{$maxColLetter}{$rowNome2}", null, true, true, false);
        [$codeRow]  = $sheet->rangeToArray("A{$rowCodigo}:{$maxColLetter}{$rowCodigo}", null, true, true, false);

        $categories = [];

        $inCat             = false;
        $catStartIdx       = null;
        $catName           = '';
        $catLastNonEmptyIx = null;
        $competencias      = [];

        for ($ci = 0; $ci < $maxCol; $ci++) {
            $cat     = trim((string)($catRow[$ci]   ?? ''));
            $nome1   = trim((string)($nome1Row[$ci] ?? ''));
            $nome2   = trim((string)($nome2Row[$ci] ?? ''));
            $codeRaw = trim((string)($codeRow[$ci]  ?? ''));
            $has345  = ($nome1 !== '' || $nome2 !== '' || $codeRaw !== '');

            if ($cat !== '') {
                if ($inCat) {
                    $endIx = $catLastNonEmptyIx !== null ? $catLastNonEmptyIx : $catStartIdx;
                    $categories[] = [
                        'nome'         => $catName,
                        'coord'        => Coordinate::stringFromColumnIndex($catStartIdx + 1) . $rowCat,
                        'start_col'    => $catStartIdx + 1,
                        'end_col'      => $endIx + 1,
                        'competencias' => $competencias,
                    ];
                }

                $inCat             = true;
                $catStartIdx       = $ci;
                $catName           = $cat;
                $catLastNonEmptyIx = $has345 ? $ci : null;
                $competencias      = [];
            } elseif ($inCat && $has345) {
                $catLastNonEmptyIx = $ci;
            }

            if ($inCat && $codeRaw !== '' && preg_match('/\b[cC]\s*[-_\.]*\s*(\d+)\b/u', $codeRaw, $m)) {
                $code = 'c' . strtolower($m[1]);
                $nome = trim(preg_replace('/\s+/', ' ', trim($nome1 . ' ' . $nome2)));
                $competencias[] = [
                    'col'            => $ci + 1,
                    'categoria_addr' => Coordinate::stringFromColumnIndex($catStartIdx + 1) . $rowCat,
                    'nome'           => $nome,
                    'nome_l1'        => $nome1,
                    'nome_l2'        => $nome2,
                    'codigo_raw'     => $codeRaw,
                    'codigo'         => $code,
                ];
            }
        }

        if ($inCat) {
            $endIx = $catLastNonEmptyIx !== null ? $catLastNonEmptyIx : $catStartIdx;

            $categories[] = [
                'nome'         => $catName,
                'coord'        => Coordinate::stringFromColumnIndex($catStartIdx + 1) . $rowCat,
                'start_col'    => $catStartIdx + 1,
                'end_col'      => $endIx + 1,
                'competencias' => $competencias,
            ];
        }

        return $categories;
    }

    private function extractFuncoesSubfuncoes(Worksheet $sheet): array
    {
        $headerRow = 5;
        $startRow  = $headerRow + 1;
        $maxRow    = (int) $sheet->getHighestRow();

        $rows = $sheet->rangeToArray("A{$startRow}:B{$maxRow}", null, true, true, false);

        $funcoesIndex = [];
        $ordem        = [];
        $currentKey   = null;

        foreach ($rows as $i => $row) {
            $r = $startRow + $i;
            $funcName = trim((string)($row[0] ?? ''));
            $subName  = trim((string)($row[1] ?? ''));

            if ($funcName !== '') {
                $currentKey = $funcName . '|A' . $r;
                if (!isset($funcoesIndex[$currentKey])) {
                    $funcoesIndex[$currentKey] = [
                        'nome'       => $funcName,
                        'coord'      => "A{$r}",
                        'row_start'  => $r,
                        'row_end'    => $r,
                        'subfuncoes' => [],
                    ];
                    $ordem[] = $currentKey;
                }
            }

            if ($currentKey === null) {
                continue;
            }
            $funcoesIndex[$currentKey]['row_end'] = $r;

            if ($subName !== '') {
                $funcoesIndex[$currentKey]['subfuncoes'][] = [
                    'nome'    => $subName,
                    'coord'   => "B{$r}",
                    'row_idx' => $r,
                    'col_idx' => 2,
                ];
            }
        }

        $funcoes = [];
        foreach ($ordem as $key) {
            $funcoes[] = $funcoesIndex[$key];
        }
        return $funcoes;
    }

    private function extractCruzamentos(Worksheet $sheet, array $ucFuncoes, array $ucCategorias): array
    {
        $gridStartRow = 6;
        $gridStartCol = 3;

        $rowMap = [];
        $minRow = PHP_INT_MAX;
        $maxRow = 0;
        foreach ($ucFuncoes as $f) {
            $funcName = $f['nome'] ?? '';
            foreach ($f['subfuncoes'] as $sf) {
                $r = (int)($sf['row_idx'] ?? 0);
                if ($r <= 0) {
                    continue;
                }

                $rowMap[$r] = [
                    'nome'   => $sf['nome'] ?? '',
                    'funcao' => $funcName,
                    'coord'  => $sf['coord'] ?? ("B{$r}"),
                    'row'    => $r,
                ];
                if ($r >= $gridStartRow) {
                    $minRow = min($minRow, $r);
                    $maxRow = max($maxRow, $r);
                }
            }
        }
        if (empty($rowMap)) {
            return [];
        }

        $colMap = [];
        $minCol = PHP_INT_MAX;
        $maxCol = 0;
        foreach ($ucCategorias as $cat) {
            $catName = $cat['nome'] ?? '';
            foreach ($cat['competencias'] as $cp) {
                $c = (int)($cp['col'] ?? 0);
                if ($c <= 0) {
                    continue;
                }

                $colMap[$c] = [
                    'codigo'    => $cp['codigo']     ?? null,
                    'codigoRaw' => $cp['codigo_raw'] ?? null,
                    'nome'      => $cp['nome']       ?? '',
                    'categoria' => $catName,
                    'col'       => $c,
                    'coord'     => Coordinate::stringFromColumnIndex($c) . '5',
                ];
                if ($c >= $gridStartCol) {
                    $minCol = min($minCol, $c);
                    $maxCol = max($maxCol, $c);
                }
            }
        }
        if (empty($colMap)) {
            return [];
        }

        $startRow = max($gridStartRow, $minRow);
        $startCol = max($gridStartCol, $minCol);
        $endRow   = $maxRow;
        $endCol   = $maxCol;

        $startColL = Coordinate::stringFromColumnIndex($startCol);
        $endColL   = Coordinate::stringFromColumnIndex($endCol);
        $range     = "{$startColL}{$startRow}:{$endColL}{$endRow}";

        $matrix = $sheet->rangeToArray($range, null, true, true, false);

        $cruzamentos = [];
        $rowsCount = count($matrix);
        for ($ri = 0; $ri < $rowsCount; $ri++) {
            $rowReal = $startRow + $ri;
            if (!isset($rowMap[$rowReal])) {
                continue;
            }

            $rowArr = $matrix[$ri];
            $colsCount = count($rowArr);

            for ($ci = 0; $ci < $colsCount; $ci++) {
                $colReal = $startCol + $ci;
                if (!isset($colMap[$colReal])) {
                    continue;
                }

                $raw = trim((string)($rowArr[$ci] ?? ''));
                if ($raw === '') {
                    continue;
                }

                if (!preg_match_all('/\d+/', $raw, $m) || empty($m[0])) {
                    continue;
                }
                $nums = array_values(array_unique(array_map('intval', $m[0])));

                $addr = Coordinate::stringFromColumnIndex($colReal) . $rowReal;

                $cruzamentos[] = [
                    'coord_cell' => $addr,
                    'valor_bruto' => $raw,
                    'valores'    => $nums,
                    'competencia' => $colMap[$colReal],
                    'subfuncao'  => $rowMap[$rowReal],
                ];
            }
        }

        return $cruzamentos;
    }

    private function extractConhecimentos(Worksheet $sheet): array
    {
        $startRow = 3;
        $maxRow   = (int) $sheet->getHighestRow();

        $rows = $sheet->rangeToArray("A{$startRow}:C{$maxRow}", null, true, true, false);

        while (!empty($rows)) {
            $last = end($rows);
            if (
                trim((string)($last[0] ?? '')) === '' &&
                trim((string)($last[1] ?? '')) === '' &&
                trim((string)($last[2] ?? '')) === ''
            ) {
                array_pop($rows);
            } else {
                break;
            }
        }

        $conhecimentos = [];
        $currentCap = null;

        $count = count($rows);
        for ($i = 0; $i < $count; $i++) {
            $r = $startRow + $i;

            $cap = trim((string)($rows[$i][0] ?? ''));
            if ($cap !== '') {
                $currentCap = $cap;
            }

            $codeRaw = trim((string)($rows[$i][1] ?? ''));
            $nome    = trim((string)($rows[$i][2] ?? ''));

            if ($codeRaw === '' && $nome === '' && $currentCap === null) {
                continue;
            }

            $codeNum = null;
            if ($codeRaw !== '' && preg_match('/\d+/', $codeRaw, $m)) {
                $codeNum = (int) $m[0];
            } else {
                continue;
            }

            $conhecimentos[$codeNum] = [
                'codigo'     => $codeNum,
                'nome'       => $nome,
                'capacidade' => $currentCap,
                'coord'      => [
                    'capacidade' => "A{$r}",
                    'codigo'     => "B{$r}",
                    'nome'       => "C{$r}",
                ],
            ];
        }

        ksort($conhecimentos);
        return $conhecimentos;
    }

    public function persistMappedMatrix(array $mapped, array $payload): array
    {
        $cats   = $mapped['uc_categorias']    ?? [];
        $funcs  = $mapped['uc_funcoes']       ?? [];
        $knows  = $mapped['oc_conhecimentos'] ?? [];
        $cross  = $mapped['uc_cruzamentos']   ?? [];

        return DB::transaction(function () use ($payload, $cats, $funcs, $knows, $cross) {

            try {
                DB::statement('SET LOCAL synchronous_commit = OFF');
            } catch (\Throwable $_) {
            }

            $now = now();

            $matrizId = $this->upsertAndGetMatrizId($payload, $now);

            $catRows = [];
            foreach ($cats as $i => $c) {
                $catRows[] = [
                    'matriz_id'  => $matrizId,
                    'nome'       => $c['nome'],
                    'codigo'     => $i,
                    'created_at' => $now,
                    'updated_at' => $now,
                ];
            }
            if ($catRows) {
                $this->chunkedUpsert('categorias', $catRows, ['matriz_id','nome'], ['codigo', 'updated_at']);
            }

            $catIdsByName = $catRows
                ? DB::table('categorias')->where('matriz_id', $matrizId)->pluck('id', 'nome')->all()
                : [];

            $cmpRows = [];
            foreach ($cats as $c) {
                $catId = $catIdsByName[$c['nome']] ?? null;
                if (!$catId) {
                    continue;
                }

                foreach ($c['competencias'] as $cp) {
                    $cmpRows[] = [
                        'categoria_id' => $catId,
                        'nome'         => $cp['nome'] ?? ($cp['codigo'] ?? 'Sem nome'),
                        'descricao'    => $cp['descricao'] ?? null,
                        'created_at'   => $now,
                        'updated_at'   => $now,
                    ];
                }
            }
            if ($cmpRows) {
                $this->chunkedUpsert('competencias', $cmpRows, ['categoria_id','nome'], ['descricao','updated_at']);
            }

            $cmpAll = !empty($catIdsByName)
                ? DB::table('competencias')->whereIn('categoria_id', array_values($catIdsByName))->get(['id','categoria_id','nome'])
                : collect();

            $cmpKey2Id = [];
            foreach ($cmpAll as $row) {
                $cmpKey2Id[$row->categoria_id . '|' . $row->nome] = (string)$row->id;
            }

            $cmpIdByCode = [];
            $cmpIdByCol  = [];
            foreach ($cats as $c) {
                $catId = $catIdsByName[$c['nome']] ?? null;
                if (!$catId) {
                    continue;
                }

                foreach ($c['competencias'] as $cp) {
                    $key = $catId . '|' . ($cp['nome'] ?? ($cp['codigo'] ?? 'Sem nome'));
                    $cid = $cmpKey2Id[$key] ?? null;
                    if (!$cid) {
                        continue;
                    }

                    if (!empty($cp['codigo'])) {
                        $cmpIdByCode[strtolower($cp['codigo'])] = $cid;
                    }
                    if (!empty($cp['col'])) {
                        $cmpIdByCol[(int)$cp['col']] = $cid;
                    }
                }
            }

            $fnRows = [];
            foreach ($funcs as $i => $f) {
                $fnRows[] = [
                    'matriz_id'  => $matrizId,
                    'nome'       => $f['nome'],
                    'codigo'     => $i,
                    'created_at' => $now,
                    'updated_at' => $now,
                ];
            }
            if ($fnRows) {
                $this->chunkedUpsert('funcoes', $fnRows, ['matriz_id','nome'], ['codigo', 'updated_at']);
            }

            $fnIdsByName = $fnRows
                ? DB::table('funcoes')->where('matriz_id', $matrizId)->pluck('id', 'nome')->all()
                : [];

            $subRows = [];
            foreach ($funcs as $f) {
                $fid = $fnIdsByName[$f['nome']] ?? null;
                if (!$fid) {
                    continue;
                }

                foreach ($f['subfuncoes'] as $sf) {
                    $subRows[] = [
                        'funcao_id'   => $fid,
                        'nome'        => $sf['nome'],
                        'created_at'  => $now,
                        'updated_at'  => $now,
                    ];
                }
            }
            if ($subRows) {
                $this->chunkedUpsert('subfuncoes', $subRows, ['funcao_id','nome'], ['updated_at']);
            }

            $subAll = !empty($fnIdsByName)
                ? DB::table('subfuncoes')->whereIn('funcao_id', array_values($fnIdsByName))->get(['id','funcao_id','nome'])
                : collect();

            $subKey2Id = [];
            foreach ($subAll as $row) {
                $subKey2Id[$row->funcao_id . '|' . $row->nome] = (string)$row->id;
            }

            $subIdByRow = [];
            foreach ($funcs as $f) {
                $fid = $fnIdsByName[$f['nome']] ?? null;
                if (!$fid) {
                    continue;
                }

                foreach ($f['subfuncoes'] as $sf) {
                    $sid = $subKey2Id[$fid . '|' . $sf['nome']] ?? null;
                    if ($sid && !empty($sf['row_idx'])) {
                        $subIdByRow[(int)$sf['row_idx']] = $sid;
                    }
                }
            }

            $knRows = [];
            foreach ($knows as $codeInt => $k) {
                $knRows[] = [
                    'matriz_id'  => $matrizId,
                    'codigo'     => (int)$codeInt,
                    'nome'       => $k['nome'] ?? "Conhecimento {$codeInt}",
                    'descricao'  => $k['capacidade'] ?? null,
                    'created_at' => $now,
                    'updated_at' => $now,
                ];
            }
            if ($knRows) {
                $this->chunkedUpsert('conhecimentos', $knRows, ['matriz_id','codigo'], ['nome','descricao','updated_at']);
            }

            $knowIdsByCode = $knRows
                ? DB::table('conhecimentos')->where('matriz_id', $matrizId)->pluck('id', 'codigo')->all()
                : [];

            [$hasIdCC, $hasIdMSC] = $this->pivotsHaveId();

            $setCC  = [];
            $setMSC = [];

            foreach ($cross as $x) {
                $rowIdx = (int)($x['subfuncao']['row'] ?? 0);

                $subId  = $subIdByRow[$rowIdx] ?? null;
                if (!$subId) {
                    continue;
                }

                $compId = null;

                $codeKey = isset($x['competencia']['codigo']) ? strtolower((string)$x['competencia']['codigo']) : null;
                if ($codeKey) {
                    $compId = $cmpIdByCode[$codeKey] ?? null;
                }

                if (!$compId && !empty($x['competencia']['col'])) {
                    $compId = $cmpIdByCol[(int)$x['competencia']['col']] ?? null;
                }

                if (!$compId) {
                    continue;
                }

                $nums = $x['valores'] ?? [];
                foreach ($nums as $n) {
                    $knowId = $knowIdsByCode[(int)$n] ?? null;
                    if (!$knowId) {
                        continue;
                    }

                    $setCC["$compId|$knowId"] = [$compId,$knowId];
                    $setMSC["{$matrizId}|{$subId}|{$compId}|{$knowId}"] = [$matrizId,$subId,$compId,$knowId];
                }
            }

            if ($setCC) {
                $rows = [];

                foreach ($setCC as [$compId,$knowId]) {
                    $row = ['competencia_id' => $compId, 'conhecimento_id' => $knowId];
                    $rows[] = $row;
                }

                $this->chunkedInsertIgnore('competencia_conhecimento', $rows);
            }

            if ($setMSC) {
                $rows = [];
                foreach ($setMSC as [$mid,$subId,$compId,$knowId]) {
                    $rows[] = [
                        'matriz_id'      => $mid,
                        'subfuncao_id'   => $subId,
                        'competencia_id' => $compId,
                        'conhecimento_id' => $knowId,
                    ];
                }
                $this->chunkedInsertIgnore('matriz_subfuncao_conhecimento', $rows);
            }

            return [
                'matriz_id'     => (string) $matrizId,
                'categorias'    => count($catIdsByName),
                'competencias'  => count($cmpKey2Id),
                'funcoes'       => count($fnIdsByName),
                'subfuncoes'    => count($subIdByRow),
                'conhecimentos' => count($knowIdsByCode),
                'cruzamentos'   => count($setMSC),
            ];
        });
    }

    private function pivotsHaveId(): array
    {
        if (self::$hasIdCC === null) {
            self::$hasIdCC  = Schema::hasColumn('competencia_conhecimento', 'id');
        }
        if (self::$hasIdMSC === null) {
            self::$hasIdMSC = Schema::hasColumn('matriz_subfuncao_conhecimento', 'id');
        }
        return [self::$hasIdCC, self::$hasIdMSC];
    }

    private function chunkedUpsert(
        string $table,
        array $rows,
        array $uniqueBy,
        array $updateCols,
        int $size = self::CHUNK_SIZE
    ): void {
        foreach (array_chunk($rows, $size) as $chunk) {
            DB::table($table)->upsert($chunk, $uniqueBy, $updateCols);
        }
    }

    private function chunkedInsertIgnore(string $table, array $rows, int $size = self::CHUNK_SIZE): void
    {
        foreach (array_chunk($rows, $size) as $chunk) {
            DB::table($table)->insertOrIgnore($chunk);
        }
    }

    private function upsertAndGetMatrizId(array $payload, $now): string
    {
        $row = DB::table('matrizes')
            ->select('id')
            ->where([
                'curso_id' => $payload['curso_id'],
                'nome'     => $payload['nome'],
                'versao'   => $payload['versao'],
            ])->first();

        if (!$row) {
            DB::table('matrizes')->insertOrIgnore([
                'curso_id'   => $payload['curso_id'],
                'nome'       => $payload['nome'],
                'versao'     => $payload['versao'],
                'vigente_de' => $payload['vigente_de'] ?? null,
                'vigente_ate' => $payload['vigente_ate'] ?? null,
                'created_at' => $now,
                'updated_at' => $now,
            ]);

            $row = DB::table('matrizes')
                ->select('id')
                ->where([
                    'curso_id' => $payload['curso_id'],
                    'nome'     => $payload['nome'],
                    'versao'   => $payload['versao'],
                ])->first();
        }

        return (string)$row->id;
    }

    private function lastNonEmptyColInRows(Worksheet $sheet, array $rows, int $maxCol): int
    {
        for ($col = $maxCol; $col >= 1; $col--) {
            foreach ($rows as $r) {
                $v = trim((string) $sheet->getCell(Coordinate::stringFromColumnIndex($col) . $r)->getFormattedValue());
                if ($v !== '') {
                    return $col;
                }
            }
        }
        return 1;
    }

    private function isTripleEmpty(Worksheet $sheet, int $col, array $rows): bool
    {
        foreach ($rows as $r) {
            $v = trim((string) $sheet->getCell(Coordinate::stringFromColumnIndex($col) . $r)->getFormattedValue());
            if ($v !== '') {
                return false;
            }
        }
        return true;
    }

    public function getMatrix(string $matrizId)
    {
        $matriz = Matriz::query()
            ->with([
                'curso:id,nome',
                'categorias' => fn($q) => $q
                    ->select('id', 'matriz_id', 'nome')
                    ->orderBy('codigo'),
                'categorias.competencias:id,categoria_id,nome,descricao',
                'funcoes' => fn($q) => $q
                    ->select('id', 'matriz_id', 'nome')
                    ->orderBy('codigo'),
                'funcoes:id,codigo,matriz_id,nome',
                'funcoes.subfuncoes:id,funcao_id,nome',
                'funcoes.subfuncoes.conhecimentosPivot' => fn ($q) => $q
                    ->wherePivot('matriz_id', $matrizId)
                    ->select(
                        'conhecimentos.id',
                        'conhecimentos.codigo',
                        'conhecimentos.nome',
                        'conhecimentos.descricao'
                    ),
                'conhecimentos:id,matriz_id,codigo,nome,descricao',
                'conhecimentos.competencias:id',
            ])
            ->findOrFail($matrizId);

        $categorias = $matriz->categorias->map(function ($cat) {
            return [
                'id'           => (string) $cat->id,
                'nome'         => $cat->nome,
                'codigo'       => $cat->codigo,
                'competencias' => $cat->competencias->map(fn ($c) => [
                    'id'        => (string) $c->id,
                    'nome'      => $c->nome,
                    'descricao' => $c->descricao,
                ])->values()->all(),
            ];
        })->values()->all();

        $funcoes = $matriz->funcoes->map(function ($f) {
            return [
                'id'         => (string) $f->id,
                'nome'       => $f->nome,
                'subfuncoes' => $f->subfuncoes->map(fn ($s) => [
                    'id'   => (string) $s->id,
                    'nome' => $s->nome,
                ])->values()->all(),
            ];
        })->values()->all();

        $conhecimentos = $matriz->conhecimentos->map(function ($k) {
            return [
                'id'                => (string) $k->id,
                'codigo'            => $k->codigo,
                'nome'              => $k->nome,
                'descricao'         => $k->descricao,
                'competencias_ids'  => $k->competencias->pluck('id')->map(fn ($id) => (string) $id)->values()->all(),
            ];
        })->values()->all();

        $cruzamentos = collect($matriz->funcoes)
            ->flatMap(fn ($f) => $f->subfuncoes)
            ->flatMap(function ($sub) {
                return $sub->conhecimentosPivot->map(fn ($k) => [
                    'subfuncao_id'    => (string) $sub->id,
                    'competencia_id'  => (string) $k->pivot->competencia_id,
                    'conhecimento_id' => (string) $k->id,
                    'conhecimento'    => [
                        'id'     => (string) $k->id,
                        'codigo' => $k->codigo,
                        'nome'   => $k->nome,
                    ],
                ]);
            })
            ->values()
            ->all();

        return [
            'id'        => (string) $matriz->id,
            'nome'      => $matriz->nome,
            'versao'    => $matriz->versao,
            'vigencia'  => [
                'de'  => $matriz->vigente_de,
                'ate' => $matriz->vigente_ate,
            ],
            'curso'      => [
                'id'   => (string) $matriz->curso->id,
                'nome' => $matriz->curso->nome,
            ],
            'categorias'    => $categorias,
            'funcoes'       => $funcoes,
            'conhecimentos' => $conhecimentos,
            'cruzamentos'   => $cruzamentos,
        ];
    }
}
