<?php

namespace App\Http\Controllers;

use Exception;
use App\Http\Responses\ApiResponse;
use App\Models\Matriz;
use App\Services\MatrixService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class MatrixController extends Controller
{
    protected ApiResponse $apiResponse;
    protected MatrixService $matrixService;

    public function __construct(ApiResponse $apiResponse, MatrixService $matrixService)
    {
        $this->apiResponse = $apiResponse;
        $this->matrixService = $matrixService;
    }

    public function index(Request $request)
    {
        try {
            $perPage = min(100, max(1, (int) $request->query('per_page', 15)));
            $q       = $request->query('q');

            $matricesPaginate = $this->matrixService->indexFiltered($perPage, $q);

            $responseData = [
                'matrices' => $matricesPaginate->getCollection(),
                'current_page' => $matricesPaginate->currentPage(),
                'per_page' => $matricesPaginate->perPage(),
                'total' => $matricesPaginate->total(),
                'last_page' => $matricesPaginate->lastPage(),
            ];

            return $this->apiResponse->success($responseData, 'Matrizes retornadas com sucesso.');
        } catch (Exception $e) {
            return $this->apiResponse->badRequest(null, 'Falha ao buscar matrizes!');
        }
    }

    public function store(Request $request)
    {
        try {
            $validateData = $request->validate(
                [
                    'file'        => 'required|file|max:10240',
                    'nome'        => 'required|string|max:255|unique:matrizes,nome',
                    'versao'      => 'required|string|max:20',
                    'curso_id'    => 'required|string|exists:cursos,id',
                    'vigente_de'  => 'required|date',
                    'vigente_ate' => 'required|date'
                ],
                [
                    'required'    => 'O campo :attribute é obrigatório.',
                    'max'         => 'O campo :attribute não pode ter mais de :max caracteres.',
                    'unique'      => 'Este :attribute já está sendo utilizado em outra matriz.',
                    'file'        => 'Arquivo invalido.',
                    'exists'      => 'O campo :attribute não existe.'
                ]
            );

            $validateData['file'] = $request->file('file');
            $matrix = $this->matrixService->importMatrix($validateData);

            return $this->apiResponse->success($matrix, 'Matriz importada com sucesso.');
        } catch (Exception $e) {
            return $this->apiResponse->badRequest($e->getMessage(), 'Falha ao importar matriz!');
        }
    }

    public function show(string $id)
    {
        try {
            $matrix = $this->matrixService->getMatrix($id);

            return $this->apiResponse->success($matrix, "Matriz retornada com sucesso");
        } catch (Exception $e) {
            return $this->apiResponse->badRequest($e->getMessage(), "Falha ao retornar matriz");
        }
    }

    public function destroy(string $id): JsonResponse
    {
        try {
            $this->matrixService->delete($id);

            return $this->apiResponse->success(null, "Matriz apagado com sucesso");
        } catch (Exception $e) {
            return $this->apiResponse->badRequest($e->getMessage(), 'Erro ao apagar matriz.');
        }
    }
}
