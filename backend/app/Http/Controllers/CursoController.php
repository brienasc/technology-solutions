<?php

namespace App\Http\Controllers;

use App\Http\Responses\ApiResponse;
use App\Models\Curso;
use App\Services\CursoService;
use Exception;
use Illuminate\Http\Request;

class CursoController extends Controller
{
    private ApiResponse $apiResponse;
    private CursoService $cursoService;

    public function __construct(ApiResponse $apiResponse, CursoService $cursoService)
    {
        $this->apiResponse = $apiResponse;
        $this->cursoService = $cursoService;
    }

    public function summary()
    {
        try {
            $cursos = $this->cursoService->getSummary();

            return $this->apiResponse->success($cursos, 'Cursos retornados com sucesso!');
        } catch (Exception $e) {
            return $this->apiResponse->badRequest($e->getMessage(), 'Falha ao buscar cursos!');
        }
    }

    public function index()
    {
    }
}
