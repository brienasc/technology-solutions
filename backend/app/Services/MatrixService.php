<?php

namespace App\Services;

use App\Models\Matriz;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;
use PhpOffice\PhpSpreadsheet\Cell\Coordinate;
use PhpOffice\PhpSpreadsheet\IOFactory;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use Symfony\Component\HttpFoundation\File\UploadedFile;

class MatrixService
{
    public function importMatrix(array $data)
    {
        $file = $data['file'];

        $payload = [
            'curso_id' => $data['curso_id'],
            'nome'     => $data['nome'],
            'versao'   => $data['versao'],
            'vigente_de' => $data['vigente_de'] ?? null,
            'vigente_ate' => $data['vigente_ate'] ?? null,
        ];

        $mapped = $this->parseFile($file);
        $matrix = $this->persistMappedMatrix($mapped, $payload);

        return $matrix;
    }

    public function paginate(int $perPage = 15, ?string $q = null): LengthAwarePaginator
    {
        $paginator = Matriz::query()
            ->select(['id', 'curso_id', 'nome', 'versao', 'vigente_de', 'vigente_ate'])
            ->with(['curso:id,nome']) ->when($q, function ($qb) use ($q) {
                $term = "%{$q}%";
                $qb->where(function ($w) use ($term) {
                    $w->where('nome', 'ilike', $term) ->orWhere('versao', 'ilike', $term);
                });
            })
            ->paginate($perPage);

        $paginator ->getCollection()->transform(function (Matriz $m) {
            return [
                'id' => (string) $m->id,
                'nome' => $m->nome, 'versao' => $m->versao,
                'vigencia' => [
                    'de' => $m->vigente_de,
                    'ate' => $m->vigente_ate,
                ],
                'curso' => [
                    'nome' => optional($m->curso)->nome,
                ],
            ];
        });

        return $paginator;
    }

    public function parseFile(UploadedFile $file): array
    {
        $reader = IOFactory::createReader('Xlsx');
        $reader->setReadDataOnly(true);
        $spreadsheet = $reader->load($file->getPathname());

        $sheetUC = $this->findSheet($spreadsheet, [
            'UC',
            'Unid. Curriculares', 'Unid Curriculares',
            'Unidades Curriculares', 'Unidade Curricular',
        ]);


        $sheetOC = $this->findSheet($spreadsheet, [
            'Obj_Conhec (OC)', 'Obj Conhec (OC)', 'Obj Conhec(OC)',
            'Obj_Conhec', 'Obj Conhec', 'OC',
            'Objetos de Conhecimento', 'Objeto de Conhecimento',
        ]);


        $ucCategorias = $sheetUC ? $this->extractCategoriesAndCompetencies($sheetUC) : [];
        $ucFuncoes    = $sheetUC ? $this->extractFuncoesSubfuncoes($sheetUC)        : [];

        $ocConhecimentos = $sheetOC ? $this->extractConhecimentos($sheetOC) : [];

        return [
            'uc_categorias'  => $ucCategorias,
            'uc_funcoes'     => $ucFuncoes,
            'uc_cruzamentos' => $sheetUC ? $this->extractCruzamentos($sheetUC, $ucFuncoes, $ucCategorias) : [],
            'oc_conhecimentos' => $ocConhecimentos,
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
            $cat    = trim((string)($catRow[$ci]   ?? ''));
            $nome1  = trim((string)($nome1Row[$ci] ?? ''));
            $nome2  = trim((string)($nome2Row[$ci] ?? ''));
            $codeRaw = trim((string)($codeRow[$ci]  ?? ''));
            $has345 = ($nome1 !== '' || $nome2 !== '' || $codeRaw !== '');

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
            } else {
                if ($inCat && $has345) {
                    $catLastNonEmptyIx = $ci;
                }
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

        $funcoesIndex = [];
        $ordem        = [];
        $currentKey   = null;

        for ($r = $startRow; $r <= $maxRow; $r++) {
            $addrFunc = "A{$r}";
            $addrSub  = "B{$r}";

            $funcName = trim((string) $sheet->getCell($addrFunc)->getFormattedValue());
            if ($funcName !== '') {
                $currentKey = $funcName . '|' . $addrFunc;

                if (!isset($funcoesIndex[$currentKey])) {
                    $funcoesIndex[$currentKey] = [
                    'nome'       => $funcName,
                    'coord'      => $addrFunc,
                    'row_start'  => $r,
                    'row_end'    => $r,
                    'subfuncoes' => [],
                    ];
                    $ordem[] = $currentKey;
                } else {
                    $funcoesIndex[$currentKey]['row_end'] = $r;
                }
            }

            if ($currentKey === null) {
                continue;
            }

            $funcoesIndex[$currentKey]['row_end'] = $r;

            $subName = trim((string) $sheet->getCell($addrSub)->getFormattedValue());
            if ($subName !== '') {
                $funcoesIndex[$currentKey]['subfuncoes'][] = [
                'nome'    => $subName,
                'coord'   => $addrSub,
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
                    'subfuncao'   => $rowMap[$rowReal],
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

            $matriz = Matriz::firstOrCreate(
                ['curso_id' => $payload['curso_id'], 'nome' => $payload['nome'], 'versao' => $payload['versao']],
                ['vigente_de' => $payload['vigente_de'] ?? null, 'vigente_ate' => $payload['vigente_ate'] ?? null]
            );
            $now = now();

            $catRows = [];
            foreach ($cats as $c) {
                $catRows[] = ['id' => (string) Str::uuid(), 'matriz_id' => $matriz->id, 'nome' => $c['nome'], 'created_at' => $now, 'updated_at' => $now];
            }
            if ($catRows) {
                DB::table('categorias')->upsert($catRows, ['matriz_id','nome'], ['updated_at']);
            }
            $catIdsByName = $catRows
            ? DB::table('categorias')->where('matriz_id', $matriz->id)->pluck('id', 'nome')->all()
            : [];

            $cmpRows = [];
            foreach ($cats as $c) {
                $catId = $catIdsByName[$c['nome']] ?? null;
                if (!$catId) {
                    continue;
                }
                foreach ($c['competencias'] as $cp) {
                    $cmpRows[] = [
                    'id' => (string) Str::uuid(),
                    'categoria_id' => $catId,
                    'nome' => $cp['nome'] ?? ($cp['codigo'] ?? 'Sem nome'),
                    'descricao' => $cp['descricao'] ?? null,
                    'created_at' => $now, 'updated_at' => $now
                    ];
                }
            }
            if ($cmpRows) {
                DB::table('competencias')->upsert($cmpRows, ['categoria_id','nome'], ['descricao','updated_at']);
            }

            $cmpAll = !empty($catIdsByName)
            ? DB::table('competencias')->whereIn('categoria_id', array_values($catIdsByName))->get(['id','categoria_id','nome'])
            : collect();

            $cmpKey2Id = [];
            foreach ($cmpAll as $row) {
                $cmpKey2Id[$row->categoria_id . '|' . $row->nome] = (string) $row->id;
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
                        $cmpIdByCol[(int)$cp['col']]          = $cid;
                    }
                }
            }

            $fnRows = [];
            foreach ($funcs as $f) {
                $fnRows[] = ['id' => (string) Str::uuid(), 'matriz_id' => $matriz->id, 'nome' => $f['nome'], 'created_at' => $now,'updated_at' => $now];
            }
            if ($fnRows) {
                DB::table('funcoes')->upsert($fnRows, ['matriz_id','nome'], ['updated_at']);
            }

            $fnIdsByName = $fnRows
            ? DB::table('funcoes')->where('matriz_id', $matriz->id)->pluck('id', 'nome')->all()
            : [];

            $subRows = [];
            foreach ($funcs as $f) {
                $fid = $fnIdsByName[$f['nome']] ?? null;
                if (!$fid) {
                    continue;
                }
                foreach ($f['subfuncoes'] as $sf) {
                    $subRows[] = ['id' => (string)Str::uuid(),'funcao_id' => $fid,'nome' => $sf['nome'],'created_at' => $now,'updated_at' => $now];
                }
            }
            if ($subRows) {
                DB::table('subfuncoes')->upsert($subRows, ['funcao_id','nome'], ['updated_at']);
            }

            $subAll = !empty($fnIdsByName)
            ? DB::table('subfuncoes')->whereIn('funcao_id', array_values($fnIdsByName))->get(['id','funcao_id','nome'])
            : collect();

            $subKey2Id = [];
            foreach ($subAll as $row) {
                $subKey2Id[$row->funcao_id . '|' . $row->nome] = (string) $row->id;
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
                'id' => (string)Str::uuid(),'matriz_id' => $matriz->id,'codigo' => (int)$codeInt,
                'nome' => $k['nome'] ?? "Conhecimento {$codeInt}",
                'descricao' => $k['capacidade'] ?? null,
                'created_at' => $now,'updated_at' => $now
                ];
            }
            if ($knRows) {
                DB::table('conhecimentos')->upsert($knRows, ['matriz_id','codigo'], ['nome','descricao','updated_at']);
            }
            $knowIdsByCode = $knRows
            ? DB::table('conhecimentos')->where('matriz_id', $matriz->id)->pluck('id', 'codigo')->all()
            : [];

            $hasIdCC  = Schema::hasColumn('competencia_conhecimento', 'id');
            $hasIdMSC = Schema::hasColumn('matriz_subfuncao_conhecimento', 'id');

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
                    $setMSC["{$matriz->id}|$subId|$compId|$knowId"] = [$matriz->id,$subId,$compId,$knowId];
                }
            }

            if ($setCC) {
                $rows = [];
                foreach ($setCC as [$compId,$knowId]) {
                    $row = ['competencia_id' => $compId,'conhecimento_id' => $knowId];
                    if ($hasIdCC) {
                        $row['id'] = (string) Str::uuid();
                    }
                    $rows[] = $row;
                }
                DB::table('competencia_conhecimento')->insertOrIgnore($rows);
            }

            if ($setMSC) {
                $rows = [];
                foreach ($setMSC as [$mid,$subId,$compId,$knowId]) {
                    $row = ['matriz_id' => $mid,'subfuncao_id' => $subId,'competencia_id' => $compId,'conhecimento_id' => $knowId];
                    if ($hasIdMSC) {
                        $row['id'] = (string) Str::uuid();
                    }
                    $rows[] = $row;
                }
                DB::table('matriz_subfuncao_conhecimento')->insertOrIgnore($rows);
            }

            return [
                'matriz_id'     => (string) $matriz->id,
                'categorias'    => count($catIdsByName),
                'competencias'  => count($cmpKey2Id),
                'funcoes'       => count($fnIdsByName),
                'subfuncoes'    => count($subIdByRow),
                'conhecimentos' => count($knowIdsByCode),
                'cruzamentos'   => count($setMSC),
            ];
        });
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
        $matriz = \App\Models\Matriz::query()
        ->with([
            'curso:id,nome',
            'categorias:id,matriz_id,nome',
            'categorias.competencias:id,categoria_id,nome,descricao',
            'funcoes:id,matriz_id,nome',
            'funcoes.subfuncoes:id,funcao_id,nome',
            'funcoes.subfuncoes.conhecimentosPivot' => fn ($q) => $q
                ->wherePivot('matriz_id', $matrizId)
                ->select('conhecimentos.id', 'conhecimentos.codigo', 'conhecimentos.nome', 'conhecimentos.descricao'),
            'conhecimentos:id,matriz_id,codigo,nome,descricao',
            'conhecimentos.competencias:id',
        ])
        ->findOrFail($matrizId);

        $categorias = $matriz->categorias->map(function ($cat) {
            return [
            'id'           => (string) $cat->id,
            'nome'         => $cat->nome,
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
