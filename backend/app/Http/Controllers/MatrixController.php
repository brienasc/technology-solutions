<?php

namespace App\Http\Controllers;

use App\Http\Responses\ApiResponse;
use App\Models\Matriz;
use App\Services\MatrixService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Exception;
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

            $matricesPaginate = $this->matrixService->paginate($perPage, $q);

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
}
