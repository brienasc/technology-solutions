<?php

namespace App\Http\Responses;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Response as HttpResponse;
use Carbon\Carbon;

class ApiResponse
{
    private function standardReturn(
        $data = null,
        string $message = 'Sucesso',
        string $status = 'success',
        int $statusCode = HttpResponse::HTTP_OK
    ): JsonResponse {
        return response()->json([
            'status' => $status,
            'message' => $message,
            'data' => $data,
            'timestamp' => Carbon::now()->toIso8601String(),
        ], $statusCode);
    }

    public function success($data = null, string $message = 'Sucesso'): JsonResponse
    {
        return $this->standardReturn($data, $message, 'success', HttpResponse::HTTP_OK);
    }

    public function badRequest($data = null, string $message = 'Bad request'): JsonResponse
    {
        return $this->standardReturn($data, $message, 'error', HttpResponse::HTTP_BAD_REQUEST);
    }

    public function error($data = null, string $message = 'error', int $statusCode = HttpResponse::HTTP_NOT_FOUND): JsonResponse
    {
        return $this->standardReturn($data, $message, 'error', $statusCode);
    }

    public function respondItem($item, string $type = 'json', string $message = 'Sucesso', int $statusCode = HttpResponse::HTTP_OK): HttpResponse
    {
        $type = strtolower($type);

        if ($type === 'xml') {
            return response((string)$item, $statusCode)->header('Content-Type', 'application/xml; charset=UTF-8');
        }

        if ($type === 'text' || $type === 'txt') {
            return response((string)$item, $statusCode)->header('Content-Type', 'text/plain; charset=UTF-8');
        }

        return $this->standardReturn($item, $message, 'success', $statusCode);
    }
}
