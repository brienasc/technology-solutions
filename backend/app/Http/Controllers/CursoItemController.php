<?php

namespace App\Http\Controllers;

use App\Models\Item;
use App\Models\Alternativa;
use App\Models\MatrizSubfuncaoConhecimento;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Exception;

class CursoItemController extends Controller
{
    // Listar itens de um curso
    public function index(Request $request, string $id): JsonResponse
    {
        try {
            $itens = Item::where('itens.curso_id', $id)
                ->with(['alternativas', 'matriz', 'cruzamento'])
                ->select([
                    'itens.*',
                    'matrizes.nome as matriz_nome'
                ])
                ->leftJoin('matrizes', 'itens.matriz_id', '=', 'matrizes.id')
                ->orderBy('itens.created_at', 'desc')
                ->get()
                ->map(function ($item) {
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
                        'updated_at' => $item->updated_at,
                        'alternativas' => $item->alternativas
                    ];
                });

            return response()->json([
                'status' => 'success',
                'data' => $itens
            ]);

        } catch (Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Erro interno do servidor: ' . $e->getMessage()
            ], 500);
        }
    }

    // Buscar um item específico para visualização/edição
    public function show(string $id): JsonResponse
    {
        try {
            $item = Item::with(['alternativas', 'matriz:id,nome'])
                ->select([
                    'itens.*',
                    'matrizes.nome as matriz_nome'
                ])
                ->leftJoin('matrizes', 'itens.matriz_id', '=', 'matrizes.id')
                ->where('itens.id', $id)
                ->first();

            if (!$item) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Item não encontrado'
                ], 404);
            }

            // Mapear alternativa
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

            $itemData = [
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

            return response()->json([
                'status' => 'success',
                'data' => $itemData
            ]);

        } catch (Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Erro interno do servidor: ' . $e->getMessage()
            ], 500);
        }
    }

    //Atualizar um item existente
    public function update(Request $request, string $id): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'comando' => 'required|string|max:1000',
            'contexto' => 'nullable|string|max:3000',
            'alternativas' => 'required|array|size:5',
            'alternativas.*.texto' => 'required|string|max:500',
            'alternativas.*.correta' => 'required|boolean',
            'alternativas.*.explicacao' => 'nullable|string|max:1000',
            'dificuldade' => 'required|integer|min:1|max:5',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Dados inválidos',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $item = Item::findOrFail($id);

            // Verificar se é rascunho (só rascunhos podem ser editados)
            if ($item->status !== 0) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Apenas itens em rascunho podem ser editados'
                ], 422);
            }

            // Verificar se pelo menos uma alternativa está correta
            $alternativasCorretas = collect($request->alternativas)->where('correta', true)->count();
            if ($alternativasCorretas !== 1) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Deve haver exatamente uma alternativa correta'
                ], 422);
            }

            DB::beginTransaction();

            // Atualizar o item
            $item->update([
                'comando' => $request->comando,
                'contexto' => $request->contexto,
                'dificuldade' => $request->dificuldade,
                'status' => $request->finalizar ? 1 : 0
            ]);

            // Deletar alternativas antigas
            $item->alternativas()->delete();

            // Criar novas alternativas
            foreach ($request->alternativas as $index => $alternativaData) {
                Alternativa::create([
                    'item_id' => $item->id,
                    'ordem' => $index + 1,
                    'texto' => $alternativaData['texto'],
                    'justificativa' => $alternativaData['explicacao'] ?? '',
                    'is_correct' => $alternativaData['correta']
                ]);
            }

            DB::commit();

            // Carregar dados atualizados
            $item->load(['alternativas', 'matriz']);

            return response()->json([
                'status' => 'success',
                'message' => $request->finalizar ? 'Item finalizado com sucesso' : 'Item atualizado com sucesso',
                'data' => $item
            ]);

        } catch (Exception $e) {
            DB::rollBack();
            return response()->json([
                'status' => 'error',
                'message' => 'Erro interno do servidor: ' . $e->getMessage()
            ], 500);
        }
    }

    // Criar um novo item (finalizado)
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'curso_id' => 'required|uuid|exists:cursos,id',
            'matriz_id' => 'required|uuid|exists:matrizes,id',
            'comando' => 'required|string|max:1000',
            'contexto' => 'nullable|string|max:3000',
            'alternativas' => 'required|array|size:5',
            'alternativas.*.texto' => 'required|string|max:500',
            'alternativas.*.correta' => 'required|boolean',
            'alternativas.*.explicacao' => 'nullable|string|max:1000',
            'dificuldade' => 'required|integer|min:1|max:5',
            // Campos do cruzamento
            'categoria_id' => 'nullable|uuid|exists:categorias,id',
            'competencia_id' => 'nullable|uuid|exists:competencias,id',
            'funcao_id' => 'nullable|uuid|exists:funcoes,id',
            'subfuncao_id' => 'nullable|uuid|exists:subfuncoes,id',
            'conhecimento_id' => 'nullable|uuid|exists:conhecimentos,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Dados inválidos',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            // Verificar se pelo menos uma alternativa está correta
            $alternativasCorretas = collect($request->alternativas)->where('correta', true)->count();
            if ($alternativasCorretas !== 1) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Deve haver exatamente uma alternativa correta'
                ], 422);
            }

            DB::beginTransaction();

            // Encontrar ou criar o cruzamento
            $cruzamento = null;
            if ($request->subfuncao_id && $request->conhecimento_id) {
                $cruzamento = MatrizSubfuncaoConhecimento::where([
                    'matriz_id' => $request->matriz_id,
                    'subfuncao_id' => $request->subfuncao_id,
                    'conhecimento_id' => $request->conhecimento_id
                ])->first();
            }

            // Criar o item
            $item = Item::create([
                'curso_id' => $request->curso_id,
                'matriz_id' => $request->matriz_id,
                'cruzamento_id' => $cruzamento?->id,
                'comando' => $request->comando,
                'contexto' => $request->contexto,
                'dificuldade' => $request->dificuldade,
                'status' => 1 // Finalizado
            ]);

            // Criar as alternativas
            foreach ($request->alternativas as $index => $alternativaData) {
                Alternativa::create([
                    'item_id' => $item->id,
                    'ordem' => $index + 1,
                    'texto' => $alternativaData['texto'],
                    'justificativa' => $alternativaData['explicacao'] ?? '',
                    'is_correct' => $alternativaData['correta']
                ]);
            }

            DB::commit();

            // Carregar relacionamentos para retorno
            $item->load(['alternativas', 'matriz', 'cruzamento']);

            return response()->json([
                'status' => 'success',
                'message' => 'Item criado com sucesso',
                'data' => $item
            ], 201);

        } catch (Exception $e) {
            DB::rollBack();
            return response()->json([
                'status' => 'error',
                'message' => 'Erro interno do servidor: ' . $e->getMessage()
            ], 500);
        }
    }

    // Salvar como rascunho
    public function saveDraft(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'curso_id' => 'required|uuid|exists:cursos,id',
            'matriz_id' => 'nullable|uuid|exists:matrizes,id',
            'comando' => 'nullable|string|max:1000',
            'contexto' => 'nullable|string|max:3000',
            'alternativas' => 'nullable|array',
            'dificuldade' => 'nullable|integer|min:1|max:5',
            // Campos do cruzamento
            'categoria_id' => 'nullable|uuid|exists:categorias,id',
            'competencia_id' => 'nullable|uuid|exists:competencias,id',
            'funcao_id' => 'nullable|uuid|exists:funcoes,id',
            'subfuncao_id' => 'nullable|uuid|exists:subfuncoes,id',
            'conhecimento_id' => 'nullable|uuid|exists:conhecimentos,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Dados inválidos',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            DB::beginTransaction();

            // Encontrar o cruzamento se os dados estiverem completos
            $cruzamento = null;
            if ($request->subfuncao_id && $request->conhecimento_id && $request->matriz_id) {
                $cruzamento = MatrizSubfuncaoConhecimento::where([
                    'matriz_id' => $request->matriz_id,
                    'subfuncao_id' => $request->subfuncao_id,
                    'conhecimento_id' => $request->conhecimento_id
                ])->first();
            }

            // Criar o item como rascunho
            $item = Item::create([
                'curso_id' => $request->curso_id,
                'matriz_id' => $request->matriz_id,
                'cruzamento_id' => $cruzamento?->id,
                'comando' => $request->comando ?? 'Rascunho',
                'contexto' => $request->contexto,
                'dificuldade' => $request->dificuldade ?? 3,
                'status' => 0 // Rascunho
            ]);

            // Criar alternativas se fornecidas
            if ($request->alternativas && is_array($request->alternativas)) {
                foreach ($request->alternativas as $index => $alternativaData) {
                    if (!empty($alternativaData['texto'])) {
                        Alternativa::create([
                            'item_id' => $item->id,
                            'ordem' => $index + 1,
                            'texto' => $alternativaData['texto'],
                            'justificativa' => $alternativaData['explicacao'] ?? '',
                            'is_correct' => $alternativaData['correta'] ?? false
                        ]);
                    }
                }
            }

            DB::commit();

            // Carregar relacionamentos para retorno
            $item->load(['alternativas', 'matriz', 'cruzamento']);

            return response()->json([
                'status' => 'success',
                'message' => 'Rascunho salvo com sucesso',
                'data' => $item
            ], 201);

        } catch (Exception $e) {
            DB::rollBack();
            return response()->json([
                'status' => 'error',
                'message' => 'Erro interno do servidor: ' . $e->getMessage()
            ], 500);
        }
    }

    // Listar itens de um curso (rota alternativa)
    public function getByCurso(string $cursoId): JsonResponse
    {
        return $this->index(new Request(), $cursoId);
    }

    //Deletar um item
    public function destroy(string $id): JsonResponse
    {
        try {
            $item = Item::findOrFail($id);
            $item->delete(); // As alternativas serão deletadas automaticamente (CASCADE)

            return response()->json([
                'status' => 'success',
                'message' => 'Item deletado com sucesso'
            ]);

        } catch (Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Erro interno do servidor: ' . $e->getMessage()
            ], 500);
        }
    }
}
