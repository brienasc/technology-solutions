<?php

namespace App\Http\Controllers;

use Exception;
use App\Http\Responses\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use App\Services\CursoItemService;
use Illuminate\Support\Facades\Validator;

class CursoItemController extends Controller
{
    protected ApiResponse $apiResponse;
    protected CursoItemService $cursosItensService;

    public function __construct(ApiResponse $apiResponse, CursoItemService $cursosItensService)
    {
        $this->apiResponse = $apiResponse;
        $this->cursosItensService = $cursosItensService;
    }

    public function index(Request $request, string $id): JsonResponse
    {
        try {
            $itens = $this->cursosItensService->getItensByCourse($id);
            return $this->apiResponse->success($itens, 'Itens retornados com sucesso');
        } catch (Exception $e) {
            Log::error('Erro ao buscar itens do curso: ' . $e->getMessage());
            return $this->apiResponse->badRequest($e->getMessage(), 'Falha ao buscar itens!');
        }
    }

    public function show(string $id): JsonResponse
    {
        try {
            $item = $this->cursosItensService->getItemById($id);
            return $this->apiResponse->success($item, 'Item retornado com sucesso');
        } catch (Exception $e) {
            Log::error('Erro ao buscar item: ' . $e->getMessage());
            return $this->apiResponse->badRequest($e->getMessage(), 'Item não encontrado');
        }
    }

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
            return $this->apiResponse->badRequest(
                $validator->errors()->first(),
                'Dados inválidos'
            );
        }

        try {
            $item = $this->cursosItensService->createItem($request->all());
            return $this->apiResponse->success($item, 'Item criado com sucesso');
        } catch (Exception $e) {
            Log::error('Erro ao criar item: ' . $e->getMessage());
            return $this->apiResponse->badRequest($e->getMessage(), 'Falha ao criar item');
        }
    }

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
            return $this->apiResponse->badRequest(
                $validator->errors()->first(),
                'Dados inválidos'
            );
        }

        try {
            $item = $this->cursosItensService->saveDraft($request->all());
            return $this->apiResponse->success($item, 'Rascunho salvo com sucesso');
        } catch (Exception $e) {
            Log::error('Erro ao salvar rascunho: ' . $e->getMessage());
            return $this->apiResponse->badRequest($e->getMessage(), 'Falha ao salvar rascunho');
        }
    }

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
            'finalizar' => 'nullable|boolean'
        ]);

        if ($validator->fails()) {
            return $this->apiResponse->badRequest(
                $validator->errors()->first(),
                'Dados inválidos'
            );
        }

        try {
            $item = $this->cursosItensService->updateItem($id, $request->all());
            $message = $request->get('finalizar', false) ? 'Item finalizado com sucesso' : 'Item atualizado com sucesso';
            return $this->apiResponse->success($item, $message);
        } catch (Exception $e) {
            Log::error('Erro ao atualizar item: ' . $e->getMessage());
            return $this->apiResponse->badRequest($e->getMessage(), 'Falha ao atualizar item');
        }
    }

    public function destroy(string $id): JsonResponse
    {
        try {
            $this->cursosItensService->deleteItem($id);
            return $this->apiResponse->success(null, 'Item deletado com sucesso');
        } catch (Exception $e) {
            Log::error('Erro ao deletar item: ' . $e->getMessage());
            return $this->apiResponse->badRequest($e->getMessage(), 'Falha ao deletar item');
        }
    }

    public function getByCurso(string $cursoId): JsonResponse
    {
        return $this->index(new Request(), $cursoId);
    }

    public function calibrate(Request $request, string $id): JsonResponse
    {
        try {
            $item = $this->cursosItensService->calibrateItem($id);
            return $this->apiResponse->success($item, 'Item marcado como calibrado com sucesso');
        } catch (Exception $e) {
            Log::error('Erro ao calibrar item: ' . $e->getMessage());
            return $this->apiResponse->badRequest($e->getMessage(), 'Falha ao calibrar item');
        }
    }
}
