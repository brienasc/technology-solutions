<?php

namespace App\Http\Controllers;

use App\Models\AvaliacaoFormativa;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use App\Http\Responses\ApiResponse;

class AvaliacaoFormativaController extends Controller
{
    protected $apiResponse;

    public function __construct(ApiResponse $apiResponse)
    {
        $this->apiResponse = $apiResponse;
    }

    public function store(Request $request): JsonResponse
    {
        try {
            $validatedData = $request->validate([
                'curso' => 'required|string',
                'matriz' => 'required|string',
                'quantidade_itens' => 'required|integer|min:1',
                'dificuldades' => 'required|array',
                'dificuldades.facil' => 'required|numeric',
                'dificuldades.media' => 'required|numeric',
                'dificuldades.dificil' => 'required|numeric',
            ]);

            // Verifica se os percentuais somam 100%
            $total = $validatedData['dificuldades']['facil'] + 
                    $validatedData['dificuldades']['media'] + 
                    $validatedData['dificuldades']['dificil'];

            if ($total !== 100) {
                return $this->apiResponse->badRequest(
                    null, 
                    'A soma dos percentuais deve ser 100%'
                );
            }

            $avaliacao = AvaliacaoFormativa::create([
                'curso' => $validatedData['curso'],
                'matriz' => $validatedData['matriz'],
                'quantidade_itens' => $validatedData['quantidade_itens'],
                'distribuicao_dificuldade' => $validatedData['dificuldades']
            ]);

            return $this->apiResponse->success(
                $avaliacao, 
                'Avaliação formativa criada com sucesso'
            );
        } catch (\Exception $e) {
            return $this->apiResponse->error(
                null, 
                'Erro ao criar avaliação formativa',
                400
            );
        }
    }
}