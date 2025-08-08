<?php

namespace App\Http\Controllers;

use App\Enums\ConviteStatus;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Str;
use Exception;

use App\Http\Responses\ApiResponse;
use App\Services\ConviteService;

class ConvitesController extends Controller{
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
            return $this->apiResponse->error('', $e->getMessage(), 400);
        }
    }

    public function index(Request $request): JsonResponse{
        try {
            $convites = $this->conviteService->indexAllConvites();

            $mappedConvites = $convites->map(function ($convite) {
                if($convite->status_code !== ConviteStatus::FINALIZADO &&
                   $convite->expires_at && Carbon::now()->greaterThan($convite->expires_at))
                {
                    $convite->status_code = ConviteStatus::EXPIRADO;
                }

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

            if($convite->status_code !== ConviteStatus::FINALIZADO &&
                $convite->expires_at && Carbon::now()->greaterThan($convite->expires_at))
            {
                $convite->status_code = ConviteStatus::EXPIRADO;
            }

            $conviteArray = $convite->toArray();
            $conviteArray['status_description'] = $convite->status_code->description();

            return $this->apiResponse->success($conviteArray, 'Convite retornado com sucesso');
        } catch(Exception $e) {
            return $this->apiResponse->error($e->getMessage(), 'Erro ao buscar convite', 400);
        }
    }

    public function show($id_convite){
    $convite = Convite::find($id_convite);

        if (!$convite) {
            return response()->json(['error' => 'Convite não encontrado'], 400);
        }

        return response()->json([
            'email' => $convite->email,
            'status' => $convite->status,
        ]);

        // Verifica convite
        $convite = Convite::find($validated['convite_id']);
        if (!$convite || $convite->status !== 'valido') {
            return response()->json(['error' => 'Convite inválido'], 400);
        }
    }

}
