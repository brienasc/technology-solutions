<?php

namespace App\Http\Responses;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Response as HttpResponse;

use Carbon\Carbon;

class ApiResponse {
    public function success($data = null, string $message = 'Sucesso'): JsonResponse {
        return response()->json([
            'status' => 'success',
            'message'=> $message,
            'data' => $data, 
            'timestamp' => Carbon::now()->toIso8601String(),
        ], HttpResponse::HTTP_OK);
    }

    public function badRequest($data = null, string $message = 'Bad request'): JsonResponse {
        return response()->json([
            'status' => 'error',
            'message'=> $message,
            'data'=> $data,
            'timestamp' => Carbon::now()->toIso8601String(),
        ], HttpResponse::HTTP_BAD_REQUEST);
    }

    public function error(string $message = Responsable::class, int $statusCode = HttpResponse::HTTP_NOT_FOUND): JsonResponse {
        return response()->json([
            'status' => 'error',
            'message' => $message,
            'timestamp' => Carbon::now()->toIso8601String(),
        ], $statusCode);
    }
}