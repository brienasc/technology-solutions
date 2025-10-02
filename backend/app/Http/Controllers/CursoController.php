<?php

namespace App\Http\Controllers;

use App\Http\Responses\ApiResponse;
use App\Models\Curso;
use App\Services\CursoService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Exception;

class CursoController extends Controller
{
    private ApiResponse $apiResponse;
    private CursoService $cursoService;

    public function __construct(ApiResponse $apiResponse, CursoService $cursoService)
    {
        $this->apiResponse = $apiResponse;
        $this->cursoService = $cursoService;
    }

    public function summary()
    {
        try {
            $cursos = $this->cursoService->getSummary();

            return $this->apiResponse->success($cursos, 'Cursos retornados com sucesso!');
        } catch (Exception $e) {
            return $this->apiResponse->badRequest($e->getMessage(), 'Falha ao buscar cursos!');
        }
    }

    public function index(Request $request): JsonResponse
    {
        try {
            $filters = $request->only(['nome', 'page', 'per_page']);

            $cursosPaginate = $this->cursoService->indexFiltered($filters);

            $responseData = [
                'cursos' => $cursosPaginate->getCollection(),
                'current_page' => $cursosPaginate->currentPage(),
                'per_page' => $cursosPaginate->perPage(),
                'total' => $cursosPaginate->total(),
                'last_page' => $cursosPaginate->lastPage(),
            ];

            return $this->apiResponse->success($responseData, 'Lista de cursos retornada com sucesso.');
        } catch (Exception $e) {
            return $this->apiResponse->badRequest(null, 'Erro ao buscar cursos.');
        }
    }

    public function store(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate(
                [
                    'nome'          => ['bail','required','string','max:255', 'unique:cursos,nome'],
                    'descricao'     => ['bail','required','string','max:255'],
                    'carga_horaria' => ['bail','required','integer','min:1'],
                    'status'        => ['bail','required','boolean'],
                ],
                [
                    'required' => 'O campo :attribute é obrigatório.',
                    'max'      => 'O campo :attribute não pode ter mais de :max caracteres.',
                    'min'      => 'O campo :attribute deve ser no mínimo :min.',
                ]
            );

            $curso = $this->cursoService->createCourse($validated);
            if ($curso == null) {
                return $this->apiResponse->badRequest(null, "Falha ao criar curso");
            }

            return $this->apiResponse->success($curso, "Curso criado com successo");
        } catch (Exception $e) {
            return $this->apiResponse->badRequest(null, 'Erro ao criar curso.');
        }
    }

    public function update(Request $request, string $id): JsonResponse
    {
        try {
            $data = $request->validate([
            'nome'          => ['sometimes','string','max:255', Rule::unique('cursos', 'nome')->ignore($id, 'id')],
            'descricao'     => ['sometimes','string','max:255'],
            'carga_horaria' => ['sometimes','integer','min:1'],
            'status'        => ['sometimes','boolean'],
            ]);

            $curso = $this->cursoService->update($id, $data);
            if ($curso == null) {
                return $this->apiResponse->badRequest(null, "Falha ao criar curso");
            }

            return $this->apiResponse->success($curso, "Curso atualizado com sucesso");
        } catch (Exception $e) {
            return $this->apiResponse->badRequest(null, 'Erro ao criar curso.');
        }
    }

    public function destroy(string $id): JsonResponse
    {
        try {
            $this->cursoService->delete($id);

            return $this->apiResponse->success(null, "Curso apagado com sucesso");
        } catch (Exception $e) {
            return $this->apiResponse->badRequest($e->getMessage(), 'Erro ao apagar curso.');
        }
    }
}
