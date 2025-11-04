<?php

namespace App\Services;

use App\Models\Avaliacao;
use App\Models\AvaliacaoItem;
use App\Models\Curso;
use App\Models\Matriz;
use App\Models\Item;
use Exception;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Illuminate\Pagination\LengthAwarePaginator;

class AvaliacaoService
{
    public function create(array $data): Avaliacao
    {
        try {
            $this->validarCursoEMatriz($data['curso_id'], $data['matriz_id']);

            $distribuicaoSolicitada = [
                'facil_muito_facil_qtd' => $data['facil_muito_facil_qtd'],
                'media_qtd' => $data['media_qtd'],
                'dificil_muito_dificil_qtd' => $data['dificil_muito_dificil_qtd'],
            ];

            $this->validarSuficienciaItens($data['matriz_id'], $distribuicaoSolicitada);
            
            DB::beginTransaction();

            // 1. CRIAR A AVALIAÇÃO
            $avaliacaoData = [
                'nome' => $data['nome'],
                'curso_id' => $data['curso_id'],
                'matriz_id' => $data['matriz_id'],
                'quantidade_itens' => $data['quantidade_itens'],
                'status' => 'agendada',
                'tipo' => 'prova',
                'facil_muito_facil_qtd' => $data['facil_muito_facil_qtd'],
                'media_qtd' => $data['media_qtd'],
                'dificil_muito_dificil_qtd' => $data['dificil_muito_dificil_qtd'],
                'facil_muito_facil_percent' => 30.00,
                'media_percent' => 40.00,
                'dificil_muito_dificil_percent' => 30.00,
            ];
 
            $avaliacao = Avaliacao::create($avaliacaoData);

            // 2. SELECIONAR E INSERIR OS ITENS ESPECÍFICOS
            $this->selecionarEInserirItens($avaliacao->id, $data['matriz_id'], $distribuicaoSolicitada);

            DB::commit();

            return $avaliacao->load(['curso', 'matriz']);

        } catch (\Exception $e) {
            DB::rollBack();
            
            if (strpos($e->getMessage(), 'itens suficientes') !== false) {
                throw $e;
            }
            
            Log::error('Erro ao criar avaliação:', [
                'erro' => $e->getMessage(),
                'arquivo' => $e->getFile(),
                'linha' => $e->getLine(),
                'curso_id' => $data['curso_id'] ?? null,
                'matriz_id' => $data['matriz_id'] ?? null
            ]);
            throw $e;
        }
    }

    public function getByIdComItensDetalhados(string $id): ?Avaliacao
    {
        return Avaliacao::with([
            'curso',
            'matriz',
            'itens.alternativas', // Carrega os itens com suas alternativas
            'itens.curso',
            'itens.matriz'
        ])->find($id);
    }

    /**
     * Método específico para buscar apenas os itens da avaliação com todos os detalhes
     * NOVO FORMATO: igual ao usado na página de cursos itens
     */
    public function getItensDetalhados(string $avaliacaoId): array
    {
        try {
            Log::info('🔍 Buscando itens detalhados para avaliação:', ['avaliacao_id' => $avaliacaoId]);

            $itens = AvaliacaoItem::where('avaliacao_id', $avaliacaoId)
                ->with([
                    'item.alternativas', // Alternativas do item
                    'item.curso',        // Curso do item
                    'item.matriz'        // Matriz do item
                ])
                ->orderBy('ordem')
                ->get()
                ->map(function ($avaliacaoItem) {
                    $item = $avaliacaoItem->item;
                    
                    if (!$item) {
                        Log::warning('Item não encontrado para AvaliacaoItem:', [
                            'avaliacao_item_id' => $avaliacaoItem->id,
                            'item_id' => $avaliacaoItem->item_id
                        ]);
                        return null;
                    }

                    // FORMATO COMPATÍVEL COM A PÁGINA DE CURSOS ITENS
                    return [
                        'id' => $item->id,
                        'code' => $item->code,
                        'comando' => $item->comando,
                        'contexto' => $item->contexto,
                        'status' => $item->status,
                        'status_nome' => $this->getStatusNome($item->status), // Adiciona nome do status
                        'dificuldade' => $item->dificuldade,
                        'dificuldade_nome' => $this->getDificuldadeNome($item->dificuldade), // Adiciona nome da dificuldade
                        'curso_id' => $item->curso_id,
                        'curso_nome' => $item->curso->nome ?? 'N/A',
                        'matriz_id' => $item->matriz_id,
                        'matriz_nome' => $item->matriz->nome ?? 'N/A',
                        'ordem_na_avaliacao' => $avaliacaoItem->ordem,
                        'alternativas' => $item->alternativas->map(function ($alternativa) {
                            return [
                                'id' => $alternativa->id,
                                'texto' => $alternativa->texto,
                                'ordem' => $alternativa->ordem,
                                'is_correct' => (bool)$alternativa->is_correct,
                                'justificativa' => $alternativa->justificativa
                            ];
                        })->sortBy('ordem')->values()->toArray(),
                        'created_at' => $item->created_at,
                        'updated_at' => $item->updated_at
                    ];
                })
                ->filter() // Remove itens nulos
                ->values() // Reindexa o array
                ->toArray();

            Log::info('✅ Itens detalhados processados:', [
                'avaliacao_id' => $avaliacaoId,
                'quantidade_itens' => count($itens)
            ]);

            return $itens;

        } catch (Exception $e) {
            Log::error('❌ Erro ao buscar itens detalhados:', [
                'avaliacao_id' => $avaliacaoId,
                'erro' => $e->getMessage(),
                'arquivo' => $e->getFile(),
                'linha' => $e->getLine()
            ]);
            throw $e;
        }
    }

    /**
     * Converter código de status para nome
     */
    private function getStatusNome(int $status): string
    {
        $statusMap = [
            0 => 'Rascunho',
            1 => 'Finalizado',
            2 => 'Calibrado'
        ];
        
        return $statusMap[$status] ?? 'Desconhecido';
    }

    /**
     * Converter código de dificuldade para nome
     */
    private function getDificuldadeNome(int $dificuldade): string
    {
        $dificuldadeMap = [
            1 => 'Muito Fácil',
            2 => 'Fácil',
            3 => 'Médio',
            4 => 'Difícil',
            5 => 'Muito Difícil'
        ];
        
        return $dificuldadeMap[$dificuldade] ?? 'Não definida';
    }

    // Selecionar itens aleatórios e inserir na avaliação
    private function selecionarEInserirItens(string $avaliacaoId, string $matrizId, array $distribuicao): void
    {
        $ordem = 1;

        // SELECIONAR ITENS FÁCEIS (dificuldade 1 e 2)
        if ($distribuicao['facil_muito_facil_qtd'] > 0) {
            $itensFaceis = Item::where('matriz_id', $matrizId)
                ->whereIn('status', [1, 2])
                ->whereIn('dificuldade', [1, 2])
                ->inRandomOrder()
                ->limit($distribuicao['facil_muito_facil_qtd'])
                ->get();

            foreach ($itensFaceis as $item) {
                AvaliacaoItem::create([
                    'avaliacao_id' => $avaliacaoId,
                    'item_id' => $item->id,
                    'ordem' => $ordem++,
                ]);
            }
        }

        // SELECIONAR ITENS MÉDIOS (dificuldade 3)
        if ($distribuicao['media_qtd'] > 0) {
            $itensMedios = Item::where('matriz_id', $matrizId)
                ->whereIn('status', [1, 2])
                ->where('dificuldade', 3)
                ->inRandomOrder()
                ->limit($distribuicao['media_qtd'])
                ->get();

            foreach ($itensMedios as $item) {
                AvaliacaoItem::create([
                    'avaliacao_id' => $avaliacaoId,
                    'item_id' => $item->id,
                    'ordem' => $ordem++,
                ]);
            }
        }

        // SELECIONAR ITENS DIFÍCEIS (dificuldade 4 e 5)
        if ($distribuicao['dificil_muito_dificil_qtd'] > 0) {
            $itensDificeis = Item::where('matriz_id', $matrizId)
                ->whereIn('status', [1, 2])
                ->whereIn('dificuldade', [4, 5])
                ->inRandomOrder()
                ->limit($distribuicao['dificil_muito_dificil_qtd'])
                ->get();

            foreach ($itensDificeis as $item) {
                AvaliacaoItem::create([
                    'avaliacao_id' => $avaliacaoId,
                    'item_id' => $item->id,
                    'ordem' => $ordem++,
                ]);
            }
        }

        // EMBARALHAR A ORDEM DOS ITENS
        $this->embaralharOrdemItens($avaliacaoId);
    }

    private function embaralharOrdemItens(string $avaliacaoId): void
    {
        $itens = AvaliacaoItem::where('avaliacao_id', $avaliacaoId)->get();
        
        $ordens = range(1, $itens->count());
        shuffle($ordens);

        foreach ($itens as $index => $item) {
            $item->update(['ordem' => $ordens[$index]]);
        }
    }

    public function getAll(array $filters = []): LengthAwarePaginator
    {
        $query = Avaliacao::with(['curso', 'matriz']);
        return $query->orderBy('created_at', 'desc')
            ->paginate($filters['per_page'] ?? 10);
    }

    public function getById(string $id): ?Avaliacao
    {
        return Avaliacao::with(['curso', 'matriz'])->find($id);
    }

    // Buscar avaliação com itens
    public function getByIdComItens(string $id): ?Avaliacao
    {
        return Avaliacao::with(['curso', 'matriz', 'itens'])->find($id);
    }

    public function getByCurso(string $cursoId, array $filters = []): LengthAwarePaginator
    {
        $query = Avaliacao::with(['curso', 'matriz'])
            ->where('curso_id', $cursoId);

        return $query->orderBy('created_at', 'desc')
            ->paginate($filters['per_page'] ?? 10);
    }

    public function update(string $id, array $data): ?Avaliacao
    {
        $avaliacao = $this->getById($id);
        
        if (!$avaliacao) {
            return null;
        }

        $avaliacao->update($data);
        return $avaliacao->fresh(['curso', 'matriz']);
    }

    public function delete(string $id): bool
    {
        $avaliacao = $this->getById($id);
        
        if (!$avaliacao) {
            return false;
        }
        
        return $avaliacao->delete();
    }

    private function validarCursoEMatriz(string $cursoId, string $matrizId): void
    {
        $curso = Curso::find($cursoId);
        $matriz = Matriz::find($matrizId);

        if (!$curso) {
            throw new Exception("Curso não encontrado com ID: {$cursoId}");
        }

        if (!$matriz) {
            throw new Exception("Matriz não encontrada com ID: {$matrizId}");
        }
    }

    private function contarItensDisponiveisNaMatriz(string $matrizId): array
    {
        $matriz = Matriz::find($matrizId);
        if (!$matriz) {
            throw new Exception("❌ Matriz não encontrada: {$matrizId}");
        }

        $totalItens = Item::where('matriz_id', $matrizId)->count();
        
        $itensPorStatus = Item::where('matriz_id', $matrizId)
            ->selectRaw('status, COUNT(*) as total')
            ->groupBy('status')
            ->get()
            ->pluck('total', 'status')
            ->toArray();

        Log::info('📊 Estatísticas gerais da matriz:', [
            'matriz_nome' => $matriz->nome,
            'total_itens' => $totalItens,
            'itens_por_status' => $itensPorStatus
        ]);
        
        // REGRA: Itens aproveitáveis = status 1 (finalizado) OU status 2 (calibrado)
        $itensAproveitaveis = Item::where('matriz_id', $matrizId)
                                ->whereIn('status', [1, 2])
                                ->count();

        // Contar por dificuldade (apenas itens aproveitáveis)
        $itensPorDificuldade = Item::where('matriz_id', $matrizId)
            ->whereIn('status', [1, 2])
            ->selectRaw('dificuldade, COUNT(*) as total')
            ->groupBy('dificuldade')
            ->get()
            ->pluck('total', 'dificuldade')
            ->toArray();

        Log::info('📈 Itens aproveitáveis por dificuldade:', $itensPorDificuldade);

        $disponiveis = [
            'facil_muito_facil' => Item::where('matriz_id', $matrizId)
                                      ->whereIn('status', [1, 2])
                                      ->whereIn('dificuldade', [1, 2])
                                      ->count(),
            'medio' => Item::where('matriz_id', $matrizId)
                          ->whereIn('status', [1, 2])
                          ->where('dificuldade', 3)
                          ->count(),
            'dificil_muito_dificil' => Item::where('matriz_id', $matrizId)
                                          ->whereIn('status', [1, 2])
                                          ->whereIn('dificuldade', [4, 5])
                                          ->count(),
        ];

        Log::info('🎯 Distribuição final:', [
            'total_matriz' => $totalItens,
            'total_aproveitaveis' => $itensAproveitaveis,
            'por_dificuldade' => $disponiveis
        ]);

        return [
            'total_matriz' => $totalItens,
            'total_aproveitaveis' => $itensAproveitaveis,
            'por_dificuldade' => $disponiveis
        ];
    }

    private function validarSuficienciaItens(string $matrizId, array $distribuicao): void
    {
        $disponibilidade = $this->contarItensDisponiveisNaMatriz($matrizId);
        $disponiveis = $disponibilidade['por_dificuldade'];

        $erros = [];

        if ($disponiveis['facil_muito_facil'] < $distribuicao['facil_muito_facil_qtd']) {
            $erros[] = "Itens fáceis: disponível {$disponiveis['facil_muito_facil']}, solicitado {$distribuicao['facil_muito_facil_qtd']}";
        }

        if ($disponiveis['medio'] < $distribuicao['media_qtd']) {
            $erros[] = "Itens médios: disponível {$disponiveis['medio']}, solicitado {$distribuicao['media_qtd']}";
        }

        if ($disponiveis['dificil_muito_dificil'] < $distribuicao['dificil_muito_dificil_qtd']) {
            $erros[] = "Itens difíceis: disponível {$disponiveis['dificil_muito_dificil']}, solicitado {$distribuicao['dificil_muito_dificil_qtd']}";
        }

        if (!empty($erros)) {
            $mensagem = "❌ ITENS INSUFICIENTES NA MATRIZ:\n" . implode("\n", $erros);
            throw new Exception($mensagem);
        }
    }

    public function verificarDisponibilidadeItens(string $matrizId, int $quantidadeItens): array
    {
        return $this->contarItensDisponiveisNaMatriz($matrizId);
    }
}