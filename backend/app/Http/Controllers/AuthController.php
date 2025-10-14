<?php

namespace App\Http\Controllers;

use Exception;
use App\Enums\PerfilType;
use App\Http\Responses\ApiResponse;
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
            $user = $request->user();
            if (!$user) {
                return $this->apiResponse->error(null, 'Unauthenticated', 401);
            }

            $token = $user->currentAccessToken();
            $abilities = $token->abilities;

            $perfil = $user->perfil;

            $profile = [
                'code' => $perfil->perfil_id,
                'label' => $perfil->perfil_name
            ];

            $data = [
                'id'        => $user->id,
                'name'      => $user->name ?? $user->nome ?? null,
                'email'     => $user->email ?? null,
                'profile'   => $profile,
                'abilities' => $abilities,
            ];

            return $this->apiResponse->success($data, 'Usuário autenticado');
        } catch (Throwable $e) {
            return $this->apiResponse->error(null, 'Erro ao validar sessão', 500);
        }
    }
}
