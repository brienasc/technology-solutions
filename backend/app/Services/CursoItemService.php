<?php

namespace App\Services;

use App\Enums\ItemDificuldade;
use App\Enums\ItemStatus;
use App\Models\Item;
use App\Models\Alternativa;
use App\Models\MatrizSubfuncaoConhecimento;
use DOMXPath;
use Illuminate\Support\Facades\DB;
use DOMDocument;
use Exception;
use Illuminate\Support\Str;

class CursoItemService
{
    public function getItensByCourse(string $id)
    {
        $itens = Item::query()
            ->leftJoin('matrizes', 'matrizes.id', '=', 'itens.matriz_id')
            ->where('itens.curso_id', $id)
            ->orderByDesc('itens.created_at')
            ->get([
                'itens.id',
                'itens.code',
                'itens.status',
                'itens.dificuldade',
                'itens.created_at',
                'itens.updated_at',
                'itens.curso_id',
                'itens.matriz_id',
                'itens.comando',
                'itens.contexto',
                'matrizes.nome as matriz_nome',
            ]);

        // Mapear os dados para incluir os textos legíveis
        return $itens->map(function ($item) {
            return $this->mapItemForList($item);
        });
    }

    public function getItemById(string $itemId): array
    {
        $item = Item::with(['alternativas', 'matriz:id,nome'])
            ->select([
                'itens.*',
                'matrizes.nome as matriz_nome'
            ])
            ->leftJoin('matrizes', 'itens.matriz_id', '=', 'matrizes.id')
            ->where('itens.id', $itemId)
            ->first();

        if (!$item) {
            throw new Exception('Item não encontrado');
        }

        return $this->mapItemForDetail($item);
    }

    public function createItem(array $data): Item
    {
        // Validar regras de negócio
        $this->validateItemData($data, true);

        DB::beginTransaction();

        try {
            // Encontrar ou criar o cruzamento
            $cruzamento = $this->findOrCreateCruzamento($data);

            // Criar o item
            $item = Item::create([
                'curso_id' => $data['curso_id'],
                'matriz_id' => $data['matriz_id'],
                'cruzamento_id' => $cruzamento?->id,
                'comando' => $data['comando'],
                'contexto' => $data['contexto'] ?? null,
                'dificuldade' => $data['dificuldade'],
                'status' => 1 // Finalizado
            ]);

            // Criar as alternativas
            $this->createAlternativas($item->id, $data['alternativas']);

            DB::commit();

            // Carregar relacionamentos para retorno
            $item->load(['alternativas', 'matriz', 'cruzamento']);

            return $item;

        } catch (Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    public function saveDraft(array $data): Item
    {
        // Validação mais flexível para rascunho
        $this->validateDraftData($data);

        DB::beginTransaction();

        try {
            // Encontrar o cruzamento se os dados estiverem completos
            $cruzamento = $this->findOrCreateCruzamento($data);

            // Criar o item como rascunho
            $item = Item::create([
                'curso_id' => $data['curso_id'],
                'matriz_id' => $data['matriz_id'] ?? null,
                'cruzamento_id' => $cruzamento?->id,
                'comando' => $data['comando'] ?? 'Rascunho',
                'contexto' => $data['contexto'] ?? null,
                'dificuldade' => $data['dificuldade'] ?? 3,
                'status' => 0 // Rascunho
            ]);

            // Criar alternativas se fornecidas
            if (isset($data['alternativas']) && is_array($data['alternativas'])) {
                $this->createAlternativas($item->id, $data['alternativas']);
            }

            DB::commit();

            // Carregar relacionamentos para retorno
            $item->load(['alternativas', 'matriz', 'cruzamento']);

            return $item;

        } catch (Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    public function updateItem(string $itemId, array $data): Item
    {
        $item = Item::findOrFail($itemId);

        // Verificar se é rascunho (só rascunhos podem ser editados)
        if ($item->status !== 0) {
            throw new Exception('Apenas itens em rascunho podem ser editados');
        }

        // Validar dados
        $this->validateItemData($data, true);

        DB::beginTransaction();

        try {
            // Atualizar o item
            $item->update([
                'comando' => $data['comando'],
                'contexto' => $data['contexto'] ?? null,
                'dificuldade' => $data['dificuldade'],
                'status' => $data['finalizar'] ?? false ? 1 : 0
            ]);

            // Deletar alternativas antigas e criar novas
            $item->alternativas()->delete();
            $this->createAlternativas($item->id, $data['alternativas']);

            DB::commit();

            // Carregar dados atualizados
            $item->load(['alternativas', 'matriz']);

            return $item;

        } catch (Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    public function deleteItem(string $itemId): bool
    {
        $item = Item::findOrFail($itemId);
        return $item->delete(); // As alternativas serão deletadas automaticamente (CASCADE)
    }

    public function calibrateItem(string $itemId): array
    {
        $item = Item::findOrFail($itemId);

        // Verificar se é finalizado (só finalizados podem ser calibrados)
        if ($item->status !== 1) {
            throw new Exception('Apenas itens finalizados podem ser calibrados');
        }

        $item->update(['status' => 2]); // 2 = Calibrado

        // Retornar item atualizado com relacionamentos
        $item->load(['alternativas', 'matriz']);

        return $this->mapItemForList($item);
    }

    public function exportXML(string $itemId): string
    {
        $row = DB::table('itens as i')
            ->join('cursos as crs', 'crs.id', '=', 'i.curso_id')
            ->join('matrizes as m', 'm.id', '=', 'i.matriz_id')
            ->join('matriz_subfuncao_conhecimento as msc', 'msc.id', '=', 'i.cruzamento_id')
            ->join('subfuncoes as sf', 'sf.id', '=', 'msc.subfuncao_id')
            ->join('funcoes as f', 'f.id', '=', 'sf.funcao_id')
            ->join('competencias as c', 'c.id', '=', 'msc.competencia_id')
            ->join('categorias as cat', 'cat.id', '=', 'c.categoria_id')
            ->join('conhecimentos as k', 'k.id', '=', 'msc.conhecimento_id')
            ->where('i.id', $itemId)
            ->first([
                'i.id as item_id',
                'i.code as item_code',
                'crs.nome as curso_name',
                'i.matriz_id',
                'i.comando',
                'i.contexto',
                'i.status',
                'i.dificuldade',
                'm.nome as matriz_name',
                'f.nome as funcao',
                'sf.nome as subfuncao',
                'c.nome as competencia',
                'cat.nome as categoria',
                'k.codigo as conhecimento_codigo',
                'k.nome as conhecimento_nome',
            ]);

        if (!$row) {
            $ex = new ModelNotFoundException('Item não encontrado.');
            $ex->setModel('itens', [$itemId]);
            throw $ex;
        }

        $alternativas = DB::table('alternativas')
            ->where('item_id', $row->item_id)
            ->orderBy('ordem')
            ->get(['ordem','texto','justificativa','is_correct']);

        $dif = ItemDificuldade::from((int)$row->dificuldade)->description();
        $sts = ItemStatus::from((int)$row->status)->description();

        $xml = new DOMDocument('1.0', 'UTF-8');
        $xml->preserveWhiteSpace = false;
        $xml->formatOutput = true;

        $root = $xml->createElement('ConteudoItem');
        $xml->appendChild($root);

        $matriz = $xml->createElement('Matriz');
        $matriz->setAttribute('id', (string)$row->matriz_id);
        $matriz->appendChild($xml->createTextNode((string)$row->matriz_name));
        $root->appendChild($matriz);

        $curso = $xml->createElement("Curso");
        $curso->appendChild($xml->createTextNode((string)$row->curso_name));
        $root->appendChild($curso);

        $funcao = $xml->createElement('Funcao');
        $funcao->appendChild($xml->createTextNode((string)$row->funcao));
        $root->appendChild($funcao);

        $subfuncao = $xml->createElement('Subfuncao');
        $subfuncao->appendChild($xml->createTextNode((string)$row->subfuncao));
        $root->appendChild($subfuncao);

        $categoria = $xml->createElement('CategoriaCompetencia');
        $categoria->appendChild($xml->createTextNode((string)$row->categoria));
        $root->appendChild($categoria);

        $competencia = $xml->createElement('Competencia');
        $competencia->appendChild($xml->createTextNode((string)$row->competencia));
        $root->appendChild($competencia);

        $obj = $xml->createElement('ObjetoConhecimento');
        if (!is_null($row->conhecimento_codigo)) {
            $obj->setAttribute('codigo', (string)$row->conhecimento_codigo);
        }
        $obj->appendChild($xml->createTextNode((string)$row->conhecimento_nome));
        $root->appendChild($obj);

        $status = $xml->createElement('Status');
        $status->appendChild($xml->createTextNode($sts));
        $root->appendChild($status);

        $dificuldade = $xml->createElement('DificuldadeEstimada');
        $dificuldade->appendChild($xml->createTextNode($dif));
        $root->appendChild($dificuldade);

        $contexto = $xml->createElement('SituacaoEstimulo');
        $contexto->appendChild($xml->createCDATASection($this->normalizeHtmlText((string)$row->contexto)));
        $root->appendChild($contexto);

        $comando = $xml->createElement('Comando');
        $comando->appendChild($xml->createCDATASection($this->normalizeHtmlText((string)$row->comando)));
        $root->appendChild($comando);

        $opts = $xml->createElement('Opcoes');
        $gabarito = $alternativas->firstWhere('is_correct', true);
        if ($gabarito) {
            $opts->setAttribute('IdOpcaoGabarito', $this->mapOpcaoId((int)$gabarito->ordem));
        }

        foreach ($alternativas as $alt) {
            $a = $xml->createElement('Opcao');
            $a->setAttribute('IdOpcao', $this->mapOpcaoId((int)$alt->ordem));

            $p = $xml->createElement('p');
            $p->appendChild($xml->createCDATASection($this->normalizeHtmlText((string)$alt->texto)));
            $a->appendChild($p);

            $j = $xml->createElement('justificativa');
            $j->appendChild($xml->createCDATASection($this->normalizeHtmlText((string)$alt->justificativa)));
            $a->appendChild($j);

            $c = $xml->createElement('correto');
            $c->appendChild($xml->createTextNode((string)((int)$alt->is_correct)));
            $a->appendChild($c);

            $opts->appendChild($a);
        }

        $root->appendChild($opts);

        return $xml->saveXML();
    }

    public function importXML(string $xmlString): array
    {
        $doc = new DOMDocument('1.0', 'UTF-8');
        if (@$doc->loadXML($xmlString, LIBXML_NOERROR | LIBXML_NOWARNING) === false) {
            return ['erro' => true, 'faltando' => ['XML inválido']];
        }

        $xp = new DOMXPath($doc);

        $matrizNode = $xp->query('/ConteudoItem/Matriz')->item(0);
        $funcao = $this->nodeText($xp, '/ConteudoItem/Funcao');
        $subfuncao = $this->nodeText($xp, '/ConteudoItem/Subfuncao');
        $categoria = $this->nodeText($xp, '/ConteudoItem/CategoriaCompetencia');
        $competencia = $this->nodeText($xp, '/ConteudoItem/Competencia');
        $objNode = $xp->query('/ConteudoItem/ObjetoConhecimento')->item(0);
        $statusStr = $this->nodeText($xp, '/ConteudoItem/Status');
        $difStr = $this->nodeText($xp, '/ConteudoItem/DificuldadeEstimada');
        $contexto = $this->innerCdata($xp, '/ConteudoItem/SituacaoEstimulo');
        $comando = $this->innerCdata($xp, '/ConteudoItem/Comando');
        $opcoes = $xp->query('/ConteudoItem/Opcoes/Opcao');
        $gabaritoAttr = $xp->query('/ConteudoItem/Opcoes')
            ->item(0)
            ?->attributes
            ?->getNamedItem('IdOpcaoGabarito')
            ?->nodeValue;

        $faltando = [];
        if (!$matrizNode) {
            $faltando[] = 'Matriz';
        }

        if ($matrizNode && !$matrizNode->attributes?->getNamedItem('id')) {
            $faltando[] = 'Matriz/@id';
        }

        if ($matrizNode && !$matrizNode->attributes?->getNamedItem('nome')) {
            $faltando[] = 'Matriz/@nome';
        }

        if ($funcao === null || $funcao === '') {
            $faltando[] = 'Funcao';
        }

        if ($subfuncao === null || $subfuncao === '') {
            $faltando[] = 'Subfuncao';
        }

        if ($categoria === null || $categoria === '') {
            $faltando[] = 'CategoriaCompetencia';
        }

        if ($competencia === null || $competencia === '') {
            $faltando[] = 'Competencia';
        }

        if (!$objNode) {
            $faltando[] = 'ObjetoConhecimento';
        }

        if ($statusStr === null || $statusStr === '') {
            $faltando[] = 'Status';
        }

        if ($difStr === null || $difStr === '') {
            $faltando[] = 'DificuldadeEstimada';
        }

        if ($contexto === null || $contexto === '') {
            $faltando[] = 'SituacaoEstimulo';
        }

        if ($comando === null || $comando === '') {
            $faltando[] = 'Comando';
        }

        if (!$xp->query('/ConteudoItem/Opcoes')->item(0)) {
            $faltando[] = 'Opcoes';
        }

        if ($xp->query('/ConteudoItem/Opcoes')->item(0) && !$gabaritoAttr) {
            $faltando[] = 'Opcoes/@IdOpcaoGabarito';
        }

        if ($opcoes->length === 0) {
            $faltando[] = 'Opcoes/Opcao';
        }

        if (!empty($faltando)) {
            return [
                'erro' => true,
                'faltando' => $faltando
            ];
        }

        $matrizId = (string)$matrizNode->attributes->getNamedItem('id')->nodeValue;
        $matrizNome = (string)$matrizNode->attributes->getNamedItem('nome')->nodeValue;

        $contexto = $this->decodeHtml($contexto);
        $comando = $this->decodeHtml($comando);

        $matrizRow = DB::table('matrizes')->select('id', 'curso_id', 'nome')->where('id', $matrizId)->first();
        if (!$matrizRow) {
            return ['erro' => true, 'faltando' => ["Matriz inexistente: {$matrizId}"]];
        }

        $funcRow = DB::table('funcoes')->where(['matriz_id' => $matrizId, 'nome' => $funcao])->first(['id']);
        if (!$funcRow) {
            return ['erro' => true, 'faltando' => ["Função não encontrada na matriz: {$funcao}"]];
        }

        $subRow = DB::table('subfuncoes')->where(['funcao_id' => $funcRow->id, 'nome' => $subfuncao])->first(['id']);
        if (!$subRow) {
            return ['erro' => true, 'faltando' => ["Subfunção não encontrada: {$subfuncao}"]];
        }

        $catRow = DB::table('categorias')->where(['matriz_id' => $matrizId, 'nome' => $categoria])->first(['id']);
        if (!$catRow) {
            return ['erro' => true, 'faltando' => ["Categoria não encontrada: {$categoria}"]];
        }

        $cmpRow = DB::table('competencias')->where(['categoria_id' => $catRow->id, 'nome' => $competencia])->first(['id']);
        if (!$cmpRow) {
            return ['erro' => true, 'faltando' => ["Competência não encontrada: {$competencia}"]];
        }

        $objCodigo = $objNode->attributes?->getNamedItem('codigo')?->nodeValue;
        $objNome = trim($objNode->textContent ?? '');
        $conhecimentoRow = null;
        if ($objCodigo !== null && $objCodigo !== '') {
            $conhecimentoRow = DB::table('conhecimentos')->where(['matriz_id' => $matrizId, 'codigo' => (int)$objCodigo])->first(['id']);
        }
        if (!$conhecimentoRow) {
            $conhecimentoRow = DB::table('conhecimentos')->where(['matriz_id' => $matrizId, 'nome' => $objNome])->first(['id']);
        }
        if (!$conhecimentoRow) {
            return ['erro' => true, 'faltando' => ["ObjetoConhecimento não encontrado: ".(($objCodigo !== null && $objCodigo !== '') ? ("codigo ".$objCodigo) : $objNome)]];
        }

        $msc = DB::table('matriz_subfuncao_conhecimento')->where([
            'matriz_id' => $matrizId,
            'subfuncao_id' => $subRow->id,
            'competencia_id' => $cmpRow->id,
            'conhecimento_id' => $conhecimentoRow->id,
        ])->first(['id']);
        if (!$msc) {
            return ['erro' => true, 'faltando' => ['Cruzamento inexistente para Função/Subfunção/Competência/ObjetoConhecimento na matriz']];
        }

        $dif = $this->mapDificuldade($difStr);
        if ($dif === null) {
            return ['erro' => true, 'faltando' => ["DificuldadeEstimada inválida: {$difStr}"]];
        }

        $sts = $this->mapStatus($statusStr);
        if ($sts === null) {
            return ['erro' => true, 'faltando' => ["Status inválido: {$statusStr}"]];
        }

        $parsedOpcoes = [];
        $hasCorrect = false;
        $gab = strtolower(trim($gabaritoAttr));
        $ordem = 0;
        foreach ($opcoes as $opt) {
            $ordem++;
            $idOpc = strtolower((string)$opt->attributes?->getNamedItem('IdOpcao')?->nodeValue);
            $texto = $this->firstHtmlOrText($opt);
            $justNode = null;
            foreach ($opt->childNodes as $n) {
                if ($n->nodeType === XML_ELEMENT_NODE && strtolower($n->nodeName) === 'justificativa') {
                    $justNode = $n;
                    break;
                }
            }

            $just = $this->innerRaw($justNode);
            if (!$idOpc) {
                return ['erro' => true, 'faltando' => ["Opcao sem IdOpcao na posição {$ordem}"]];
            }
            if ($texto === null || $texto === '') {
                return ['erro' => true, 'faltando' => ["Opcao {$idOpc} sem texto"]];
            }
            if ($just === null || $just === '') {
                return ['erro' => true, 'faltando' => ["Opcao {$idOpc} sem justificativa"]];
            }

            $texto = $this->decodeHtml($texto);
            $just = $this->decodeHtml($just);

            $isCorrect = $idOpc === $gab;
            $hasCorrect = $hasCorrect || $isCorrect;
            $parsedOpcoes[] = [
                'ordem' => $this->mapLetraToOrdem($idOpc) ?? $ordem,
                'letra' => $idOpc,
                'texto' => $texto,
                'justificativa' => $just,
                'is_correct' => $isCorrect
            ];
        }

        if (!$hasCorrect) {
            return [
                'erro' => true,
                'faltando' => [
                    'Nenhuma alternativa correta correspondente ao IdOpcaoGabarito'
                ]
            ];
        }

        $itemId = (string) Str::uuid();
        $code = $this->generateUniqueCode();

        DB::transaction(function () use ($itemId, $code, $matrizRow, $matrizId, $msc, $comando, $contexto, $sts, $dif, $parsedOpcoes) {
            DB::table('itens')->insert([
                'id' => $itemId,
                'code' => $code,
                'curso_id' => $matrizRow->curso_id,
                'matriz_id' => $matrizId,
                'cruzamento_id' => $msc->id,
                'comando' => $comando,
                'contexto' => $contexto,
                'status' => $sts,
                'dificuldade' => $dif,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            usort($parsedOpcoes, fn ($a, $b) => $a['ordem'] <=> $b['ordem']);
            foreach ($parsedOpcoes as $idx => $alt) {
                DB::table('alternativas')->insert([
                    'id' => (string) Str::uuid(),
                    'item_id' => $itemId,
                    'ordem' => $idx + 1,
                    'texto' => $alt['texto'],
                    'justificativa' => $alt['justificativa'],
                    'is_correct' => $alt['is_correct'],
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        });

        return [
            'erro' => false,
            'item_id' => $itemId,
            'code' => $code,
            'matriz' => ['id' => (string)$matrizId, 'nome' => (string)$matrizNome],
            'cruzamento_id' => (string)$msc->id,
            'alternativas' => count($parsedOpcoes),
        ];
    }

    // Métodos privados auxiliares

    private function decodeHtml(string $s): string
    {
        return $this->unwrapHTML(html_entity_decode($s, ENT_QUOTES | ENT_HTML5, 'UTF-8'));
    }

    private function unwrapHTML(?string $html): ?string
    {
        if ($html === null) {
            return null;
        }

        $t = trim($html);
        if ($t === '') {
            return $t;
        }

        if (preg_match('/^<p[^>]*>(.*)<\/p>$/si', $t, $m)) {
            $inner = trim($m[1]);
            if (stripos($inner, '<p') === false) {
                return $inner;
            }
        }

        return $t;
    }

    private function normalizeHtmlText(string $text): string
    {
        $t = trim($text);

        if ($t === '') {
            return '';
        }

        if (preg_match('/<\s*p[\s>]/i', $t)) {
            return $t;
        }

        $escaped = htmlentities($t, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');

        return '<p>' . $escaped . '</p>';
    }

    private function nodeText(DOMXPath $xp, string $query): ?string
    {
        $n = $xp->query($query)->item(0);
        return $n ? trim($n->textContent ?? '') : null;
    }

    private function innerCdata(DOMXPath $xp, string $query): ?string
    {
        $n = $xp->query($query)->item(0);
        if (!$n) {
            return null;
        }

        $s = '';
        foreach ($n->childNodes as $c) {
            if ($c->nodeType === XML_CDATA_SECTION_NODE) {
                $s .= (string)$c->data;
            }
            if ($c->nodeType === XML_TEXT_NODE) {
                $s .= (string)$c->nodeValue;
            }
            if ($c->nodeType === XML_ELEMENT_NODE) {
                $s .= $c->C14N();
            }
        }

        $s = trim($s);

        return $s !== '' ? $s : null;
    }

    private function innerRaw(?\DOMNode $n): ?string
    {
        if (!$n) {
            return null;
        }

        $s = '';
        foreach ($n->childNodes as $c) {
            if ($c->nodeType === XML_CDATA_SECTION_NODE) {
                $s .= (string)$c->data;
            }
            if ($c->nodeType === XML_TEXT_NODE) {
                $s .= (string)$c->nodeValue;
            }
            if ($c->nodeType === XML_ELEMENT_NODE) {
                $s .= $c->C14N();
            }
        }

        $s = trim($s);

        return $s !== '' ? $s : null;
    }

    private function firstHtmlOrText(\DOMElement $opt): ?string
    {
        foreach ($opt->childNodes as $c) {
            if ($c->nodeType === XML_ELEMENT_NODE && in_array(strtolower($c->nodeName), ['p','texto'], true)) {
                return $this->innerRaw($c);
            }
        }
        return trim($opt->textContent ?? '') ?: null;
    }

    private function mapDificuldade(string $s): ?int
    {
        $n = $this->norm($s);
        foreach (ItemDificuldade::cases() as $c) {
            if ($this->norm($c->description()) === $n) {
                return $c->value;
            }
        }
        return null;
    }

    private function mapStatus(string $s): ?int
    {
        $n = $this->norm($s);
        foreach (ItemStatus::cases() as $c) {
            if ($this->norm($c->description()) === $n) {
                return $c->value;
            }
        }
        return null;
    }

    private function norm(string $s): string
    {
        $s = mb_strtolower($s);
        $t = @iconv('UTF-8', 'ASCII//TRANSLIT', $s);
        $s = $t !== false ? $t : $s;
        $s = preg_replace('/[^a-z0-9]+/u', ' ', $s);
        return trim(preg_replace('/\s+/', ' ', $s));
    }

    private function mapLetraToOrdem(string $id): ?int
    {
        $id = strtolower(trim($id));
        return match ($id) {
            'a' => 1,
            'b' => 2,
            'c' => 3,
            'd' => 4,
            'e' => 5,
            default => null,
        };
    }

    private function generateUniqueCode(): string
    {
        do {
            $code = 'ITM-' . strtoupper(Str::random(8));
        } while (DB::table('itens')->where('code', $code)->exists());

        return $code;
    }

    private function mapOpcaoId(int $ordem): string
    {
        return match ($ordem) {
            1 => 'a',
            2 => 'b',
            3 => 'c',
            4 => 'd',
            5 => 'e',
            default => (string)$ordem,
        };
    }

    private function validateItemData(array $data, bool $requireAlternativas = false): void
    {
        if ($requireAlternativas && isset($data['alternativas'])) {
            // Verificar se pelo menos uma alternativa está correta
            $alternativasCorretas = collect($data['alternativas'])->where('correta', true)->count();
            if ($alternativasCorretas !== 1) {
                throw new Exception('Deve haver exatamente uma alternativa correta');
            }
        }
    }

    private function validateDraftData(array $data): void
    {
        // Validação básica para rascunho - apenas curso_id é obrigatório
        if (empty($data['curso_id'])) {
            throw new Exception('Curso é obrigatório');
        }
    }

    private function findOrCreateCruzamento(array $data): ?MatrizSubfuncaoConhecimento
    {
        if (empty($data['matriz_id']) || empty($data['subfuncao_id']) || empty($data['conhecimento_id'])) {
            return null;
        }

        return MatrizSubfuncaoConhecimento::where([
            'matriz_id' => $data['matriz_id'],
            'subfuncao_id' => $data['subfuncao_id'],
            'conhecimento_id' => $data['conhecimento_id']
        ])->first();
    }

    private function createAlternativas(string $itemId, array $alternativas): void
    {
        foreach ($alternativas as $index => $alternativaData) {
            if (!empty($alternativaData['texto'])) {
                Alternativa::create([
                    'item_id' => $itemId,
                    'ordem' => $index + 1,
                    'texto' => $alternativaData['texto'],
                    'justificativa' => $alternativaData['explicacao'] ?? '',
                    'is_correct' => $alternativaData['correta'] ?? false
                ]);
            }
        }
    }

    private function mapItemForList($item): array
    {
        // Mapear status para texto
        $statusMap = [
            0 => 'Rascunho',
            1 => 'Finalizado',
            2 => 'Calibrado'
        ];

        // Mapear dificuldade para texto
        $dificuldadeMap = [
            1 => 'Muito Fácil',
            2 => 'Fácil',
            3 => 'Média',
            4 => 'Difícil',
            5 => 'Muito Difícil'
        ];

        return [
            'id' => $item->id,
            'code' => $item->code,
            'curso_id' => $item->curso_id,
            'matriz_id' => $item->matriz_id,
            'matriz_nome' => $item->matriz_nome ?? '—',
            'comando' => $item->comando,
            'contexto' => $item->contexto,
            'status' => $item->status,
            'status_nome' => $statusMap[$item->status] ?? 'Desconhecido',
            'dificuldade' => $item->dificuldade,
            'dificuldade_nome' => $dificuldadeMap[$item->dificuldade] ?? 'Não definido',
            'created_at' => $item->created_at,
            'updated_at' => $item->updated_at
        ];
    }

    private function mapItemForDetail($item): array
    {
        // Mapear alternativas
        $alternativas = $item->alternativas->map(function ($alt) {
            return [
                'texto' => $alt->texto,
                'correta' => $alt->is_correct,
                'explicacao' => $alt->justificativa ?? ''
            ];
        })->toArray();

        // Garantir 5 alternativas
        while (count($alternativas) < 5) {
            $alternativas[] = [
                'texto' => '',
                'correta' => false,
                'explicacao' => ''
            ];
        }

        return [
            'id' => $item->id,
            'code' => $item->code,
            'curso_id' => $item->curso_id,
            'matriz_id' => $item->matriz_id,
            'matriz_nome' => $item->matriz_nome ?? '—',
            'comando' => $item->comando,
            'contexto' => $item->contexto,
            'status' => $item->status,
            'dificuldade' => $item->dificuldade,
            'alternativas' => $alternativas,
            'created_at' => $item->created_at,
            'updated_at' => $item->updated_at
        ];
    }
}
