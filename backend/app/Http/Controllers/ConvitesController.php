<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\ValidationException;
use Exception;

use App\Http\Responses\ApiResponse;
use App\Services\ConviteService;

class ConvitesController extends Controller
{
    protected $apiResponse;
    protected $conviteService;

    public function __construct(ApiResponse $apiResponse, ConviteService $conviteService){
        $this->apiResponse = $apiResponse;
        $this->conviteService = $conviteService;
    }
    
    public function store(Request $request): JsonResponse{
        try{
           $validateData = $request->validate([
                'email' => 'required|email|max:255|unique:colab,email', 
           ],
   [
                'email.required' => 'O campo e-mail é obrigatório.',
                'email.email'    => 'O e-mail deve ter um formato válido.',
                'email.unique'   => 'Este e-mail já está sendo utilizado por outro colaborador.',
                'email.max'      => 'O e-mail não pode ter mais de :max caracteres.'
            ]);
       
            $convite = $this->conviteService->enviarConvite($validateData['email']);

            return $this->apiResponse->success($convite, 'Convite criado com sucesso');

        } catch (ValidationException $e) {
            return $this->apiResponse->badRequest($e->errors(), 'Bad request');
        } catch (Exception $e) {
            return response()->json([
                'message' => $e->getMessage()
            ],400);
        }
    }
}
