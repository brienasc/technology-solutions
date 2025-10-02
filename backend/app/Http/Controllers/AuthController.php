<?php

namespace App\Http\Controllers;

use App\Http\Responses\ApiResponse;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AuthController extends Controller
{
    protected ApiResponse $apiResponse;

    public function __construct(ApiResponse $apiResponse)
    {
        $this->apiResponse = $apiResponse;
    }

    public function show(Request $request): JsonResponse
    {
        try {
            return $this->apiResponse->success(null, "Usuário logado");
        } catch (Exception $e) {
            return $this->apiResponse->error(null, $e->getMessage());
        }
    }
}
