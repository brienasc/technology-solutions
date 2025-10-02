<?php

namespace App\Http\Controllers;

use App\Http\Responses\ApiResponse;
use App\Services\PerfisService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Exception;

class PerfisController extends Controller
{
    protected ApiResponse $apiResponse;
    protected PerfisService $perfisService;

    public function __construct(ApiResponse $apiResponse, PerfisService $perfisService)
    {
        $this->apiResponse = $apiResponse;
        $this->perfisService = $perfisService;
    }

    public function index(Request $request): JsonResponse
    {
        try {
            $perfis = $this->perfisService->indexAllPerfis();

            return $this->apiResponse->success($perfis, "Perfis retornados com successo");
        } catch (Exception $e) {
            return $this->apiResponse->error($e->getMessage(), $e->getMessage());
        }
    }
}
