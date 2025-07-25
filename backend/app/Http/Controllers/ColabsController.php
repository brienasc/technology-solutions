<?php

namespace App\Http\Controllers;

use App\Models\Colab;
use App\Models\Perfis;
use App\Rules\Cpf;
use Illuminate\Validation\ValidationException;
use Exception;
use Hash;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

use App\Http\Responses\ApiResponse;
use App\Http\Requests\ColabsRequest;
use App\Services\ColabService;
use Str;

class ColabsController extends Controller{
    protected ApiResponse $apiResponse;
    protected ColabService $colabService;
    
    public function __construct(ApiResponse $apiResponse, ColabService $colabService){
        $this->apiResponse = $apiResponse;
        $this->colabService = $colabService;
    }

    public function store(ColabsRequest $request): JsonResponse{
        try{

            $validated = $request->validated();

            $colab = $this->colabService->create($validated);
        
            return $this->apiResponse->success($colab, 'Colaborador cadastrado com sucesso.');
        }catch(Exception $e){
            return $this->apiResponse->error( null, 'Erro ao criar colaborador.');
        }
    }

    public function index(){
        try{
            $colabs = $this->colabService->indexAllColabs();

            return $this->apiResponse->success($colabs, 'Lista de colaboradores retornada com sucesso.');
        }catch(Exception $e){
            return $this->apiResponse->badRequest( null, 'Erro ao buscar colaboradores.');
        }

    }

    public function show($id){
        try{
            if(!Str::isUuid($id)){
                return $this->apiResponse->badRequest(null, 'O ID do colaborador fornecido é inválido.');
            }

            $colab = $this->colabService->getColabById($id);

            if($colab == null){
                return $this->apiResponse->badRequest( null, 'Colaborador não encontrado'); 
            }
            
            return $this->apiResponse->success($colab, 'Colaborador retornado com sucesso.');
        }catch(Exception $e){
            return $this->apiResponse->badRequest( null, 'Erro ao buscar colaborador');
        }
    }

    public function login(Request $request): JsonResponse{
        try{
            $validateData = $request->validate([
                'cpf' => ['required', 'digits:11', new Cpf()],
                'password' => ['required', 'min:8'],
            ],[
                'required' => 'O :attribute é obrigatório',
                'digits' => 'O campo :attribute deve conter apenas :digits digitos.',
                'min' => 'O campo :attribute deve ter no mínimo :min caracteres.',
            ]);

            $dataResponse = $this->colabService->loginColab($validateData['cpf'], $validateData['password']);
            if($dataResponse == null){
                return $this->apiResponse->badRequest( null, 'Usuario ou senha inválido!');
            }

            return $this->apiResponse->success($dataResponse, 'Login com sucesso');
        }catch(ValidationException $e){
            return $this->apiResponse->badRequest($e->errors(), 'Bad request');
        }catch(Exception $e){
            return $this->apiResponse->badRequest($e->getMessage(), 'Bad request');
        }
    }
}
