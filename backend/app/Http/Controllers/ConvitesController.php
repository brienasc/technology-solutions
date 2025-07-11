<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Str;
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

            $conviteArray = $convite->toArray();
            $conviteArray['status_description'] = $convite->status_code->description();

            return $this->apiResponse->success($conviteArray, 'Convite criado com sucesso');
        } catch (ValidationException $e) {
            return $this->apiResponse->badRequest($e->errors(), 'Bad request');
        } catch (Exception $e) {
            return response()->json([
                'message' => $e->getMessage()
            ],400);
        }
    }

    public function index(Request $request): JsonResponse{
        try {
            $convites = $this->conviteService->indexAllConvites();

            $mappedConvites = $convites->map(function ($convite) {
                $conviteArray = $convite->toArray();
                $conviteArray['status_description'] = $convite->status_code->description();
                return $conviteArray;
            });

            return $this->apiResponse->success($mappedConvites, 'Lista de convites retornada com sucesso.');
        } catch (Exception $e) {
            return $this->apiResponse->error('Erro ao buscar convites', 400);
        }
    }

    public function show(string $id_convite): JsonResponse{
        try {
            if (!Str::isUuid($id_convite)) {
                return $this->apiResponse->badRequest('O ID do convite fornecido é inválido.');
            }

            $convite = $this->conviteService->getConviteById($id_convite);
            
            if (!$convite) {
                return $this->apiResponse->badRequest(message: 'Convite não encontrado');
            }

            $conviteArray = $convite->toArray();
            $conviteArray['status_description'] = $convite->status_code->description();

            return $this->apiResponse->success($conviteArray, 'Convite retornado com sucesso');
        } catch(Exception $e) {
            return $this->apiResponse->error('Erro ao buscar convite', 400);
        }
    }
}
