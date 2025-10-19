<?php

namespace App\Http\Controllers;

use Exception;
use App\Http\Responses\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use App\Services\CursoItemService;

class CursoItemController extends Controller
{
    protected ApiResponse $apiResponse;
    protected CursoItemService $cursosItensService;

    public function __construct(ApiResponse $apiResponse, CursoItemService $cursosItensService)
    {
        $this->apiResponse = $apiResponse;
        $this->cursosItensService = $cursosItensService;
    }

    public function index(Request $request, string $id)
    {
        try {
            $itens = $this->cursosItensService->getItensByCourse($id);

            return $this->apiResponse->success($itens, 'Itens retornados com sucesso');
        } catch (Exception $e) {
            return $this->apiResponse->badRequest($e->getMessage(), 'Falha ao buscar itens!');
        }
    }
}
