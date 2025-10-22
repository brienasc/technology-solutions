<?php

namespace App\Services;

use App\Models\Item;
use App\Models\Alternativa;
use App\Models\MatrizSubfuncaoConhecimento;
use Illuminate\Support\Facades\DB;
use Exception;

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

    // Métodos privados auxiliares

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
            2 => 'Arquivado'
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
