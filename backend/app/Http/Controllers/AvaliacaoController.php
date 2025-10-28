<?php

namespace App\Http\Controllers;

use App\Http\Responses\ApiResponse;
use App\Services\AvaliacaoService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Exception;
use Illuminate\Support\Facades\Log;

class AvaliacaoController extends Controller
{
    protected ApiResponse $apiResponse;
    protected AvaliacaoService $avaliacaoService;

    public function __construct(ApiResponse $apiResponse, AvaliacaoService $avaliacaoService)
    {
        $this->apiResponse = $apiResponse;
        $this->avaliacaoService = $avaliacaoService;
    }

    public function store(Request $request): JsonResponse
    {
        try {
            // VALIDAÇÃO
            $data = $request->validate([
                'nome' => ['required', 'string', 'max:255', Rule::unique('avaliacoes', 'nome')],
                'curso_id' => ['required', 'uuid', 'exists:cursos,id'],
                'matriz_id' => ['required', 'uuid', 'exists:matrizes,id'],
                'quantidade_itens' => ['required', 'integer', 'min:1', 'max:50'],
                'distribuicao.facil_muito_facil_qtd' => ['required', 'integer', 'min:0'],
                'distribuicao.media_qtd' => ['required', 'integer', 'min:0'],
                'distribuicao.dificil_muito_dificil_qtd' => ['required', 'integer', 'min:0'],
            ], [
                'nome.required' => 'O nome da avaliação é obrigatório',
                'nome.unique' => 'Já existe uma avaliação com este nome',
                'curso_id.required' => 'É necessário selecionar um curso',
                'curso_id.exists' => 'O curso selecionado não existe',
                'matriz_id.required' => 'É necessário selecionar uma matriz',
                'matriz_id.exists' => 'A matriz selecionada não existe',
                'quantidade_itens.required' => 'A quantidade de itens é obrigatória',
                'distribuicao.facil_muito_facil_qtd.required' => 'Distribuição de itens fáceis é obrigatória',
                'distribuicao.media_qtd.required' => 'Distribuição de itens médios é obrigatória',
                'distribuicao.dificil_muito_dificil_qtd.required' => 'Distribuição de itens difíceis é obrigatória',
            ]);

            $serviceData = [
                'nome' => $data['nome'],
                'curso_id' => $data['curso_id'],
                'matriz_id' => $data['matriz_id'],
                'quantidade_itens' => $data['quantidade_itens'],
                'facil_muito_facil_qtd' => $data['distribuicao']['facil_muito_facil_qtd'],
                'media_qtd' => $data['distribuicao']['media_qtd'],
                'dificil_muito_dificil_qtd' => $data['distribuicao']['dificil_muito_dificil_qtd'],
            ];

            $avaliacao = $this->avaliacaoService->create($serviceData);

            return $this->apiResponse->success($avaliacao, '✅ Avaliação criada com sucesso!', 201);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return $this->apiResponse->error(
                $e->errors(),
                '⚠️ Dados inválidos fornecidos',
                422
            );
        } catch (Exception $e) {
            Log::error(' ERRO GERAL NO CONTROLLER:', [
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine()
            ]);

            // ← TRATAMENTO ESPECÍFICO PARA ITENS INSUFICIENTES
            if (strpos($e->getMessage(), 'ITENS INSUFICIENTES') !== false) {
                return $this->apiResponse->error(
                    $e->getMessage(),
                    '📊 Itens insuficientes na matriz',
                    400  // ← Bad Request para itens insuficientes
                );
            }

            return $this->apiResponse->error(
                $e->getMessage(),
                '❌ Não foi possível criar a avaliação',
                500
            );
        }
    }

    public function index(Request $request): JsonResponse
    {
        try {
            $filters = $request->only(['page', 'per_page', 'status', 'tipo', 'search']);
            $avaliacoes = $this->avaliacaoService->getAll($filters);

            $responseData = [
                'data' => $avaliacoes->getCollection(),
                'current_page' => $avaliacoes->currentPage(),
                'per_page' => $avaliacoes->perPage(),
                'total' => $avaliacoes->total(),
                'last_page' => $avaliacoes->lastPage(),
            ];

            return $this->apiResponse->success($responseData, 'Avaliações retornadas com sucesso');
        } catch (Exception $e) {
            return $this->apiResponse->error($e->getMessage(), 'Erro ao buscar avaliações');
        }
    }

    public function show(string $id): JsonResponse
    {
        try {
            $avaliacao = $this->avaliacaoService->getById($id);

            if (!$avaliacao) {
                return $this->apiResponse->error(null, 'Avaliação não encontrada', 404);
            }

            return $this->apiResponse->success($avaliacao, 'Avaliação retornada com sucesso');
        } catch (Exception $e) {
            return $this->apiResponse->error($e->getMessage(), 'Erro ao buscar avaliação');
        }
    }

    public function getByCurso(string $cursoId, Request $request): JsonResponse
    {
        try {
            $filters = $request->only(['page', 'per_page', 'status', 'tipo']);
            $avaliacoes = $this->avaliacaoService->getByCurso($cursoId, $filters);

            $responseData = [
                'data' => $avaliacoes->getCollection(),
                'current_page' => $avaliacoes->currentPage(),
                'per_page' => $avaliacoes->perPage(),
                'total' => $avaliacoes->total(),
                'last_page' => $avaliacoes->lastPage(),
            ];

            return $this->apiResponse->success($responseData, 'Avaliações do curso retornadas com sucesso');
        } catch (Exception $e) {
            return $this->apiResponse->error($e->getMessage(), 'Erro ao buscar avaliações do curso');
        }
    }

    public function update(Request $request, string $id): JsonResponse
    {
        try {
            $data = $request->validate([
                'nome' => ['sometimes', 'string', 'max:255', Rule::unique('avaliacoes', 'nome')->ignore($id)],
                'quantidade_itens' => ['sometimes', 'integer', 'min:1', 'max:50'],
                'status' => ['sometimes', Rule::in(['agendada', 'em_andamento', 'finalizada', 'cancelada'])],
                'tipo' => ['sometimes', Rule::in(['prova', 'simulado', 'atividade'])],
                'data_agendada' => ['sometimes', 'nullable', 'date'],
                'tempo_duracao' => ['sometimes', 'nullable', 'integer', 'min:1'],
                'alunos_previstos' => ['sometimes', 'nullable', 'integer', 'min:1'],
                'alunos_realizados' => ['sometimes', 'integer', 'min:0'],
            ]);

            $avaliacao = $this->avaliacaoService->update($id, $data);

            if (!$avaliacao) {
                return $this->apiResponse->error(null, 'Avaliação não encontrada', 404);
            }

            return $this->apiResponse->success($avaliacao, 'Avaliação atualizada com sucesso');
        } catch (Exception $e) {
            return $this->apiResponse->error($e->getMessage(), 'Erro ao atualizar avaliação', 400);
        }
    }

    public function destroy(string $id): JsonResponse
    {
        try {
            $success = $this->avaliacaoService->delete($id);

            if (!$success) {
                return $this->apiResponse->error(null, 'Avaliação não encontrada', 404);
            }

            return $this->apiResponse->success(null, 'Avaliação excluída com sucesso');
        } catch (Exception $e) {
            return $this->apiResponse->error($e->getMessage(), 'Erro ao excluir avaliação');
        }
    }

    public function verificarDisponibilidade(Request $request): JsonResponse
    {
        try {
            $data = $request->validate([
                'matriz_id' => ['required', 'uuid', 'exists:matrizes,id'],
                'quantidade_itens' => ['required', 'integer', 'min:1', 'max:50'],
            ]);

            $disponibilidade = $this->avaliacaoService->verificarDisponibilidadeItens(
                $data['matriz_id'],
                $data['quantidade_itens']
            );

            return $this->apiResponse->success($disponibilidade, 'Verificação concluída');
        } catch (Exception $e) {
            return $this->apiResponse->error($e->getMessage(), 'Erro na verificação');
        }
    }
}