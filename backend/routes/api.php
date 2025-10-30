<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\CursoItemController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CursoController;
use App\Http\Controllers\PerfisController;
use App\Http\Controllers\ConvitesController;
use App\Http\Controllers\ColabsController;
use App\Http\Controllers\ContactController;
use App\Http\Controllers\MatrixController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\AvaliacaoController;

# Contact Route
Route::post('/contact-form', [ContactController::class, 'recv']);
Route::post('/login', [ColabsController::class, 'login'])->name('login');
Route::post('/colabs', [ColabsController::class,'store']);
Route::get('/convites/{id_convite}', [ConvitesController::class,'show']);


Route::middleware('auth:sanctum')->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index']);
    Route::get('/cursos/itens/{id}', [CursoItemController::class, 'index']);
    Route::get('/cursos/itens/{cursoId}', [CursoItemController::class, 'getByCurso']);

    Route::get('/matrizes', [MatrixController::class, 'index']);
    Route::get('/matrizes/{id}', [MatrixController::class,'show']);
    Route::get('/matrizes/list', [MatrixController::class, 'index']);
    Route::get('/matrizes/{id}/details', [MatrixController::class, 'show']);

    Route::get('/cursos/summary', [CursoController::class, 'summary']);
    Route::get('/cursos/{id}/summary', [CursoController::class, 'idSummary']);
    Route::get('/cursos', [CursoController::class, 'index']);

    # Rotas de Itens
    Route::prefix('itens')->group(function () {
        Route::post('/', [CursoItemController::class, 'store']);
        Route::post('/draft', [CursoItemController::class, 'saveDraft']);
        Route::get('/{id}', [CursoItemController::class, 'show']);
        Route::put('/{id}', [CursoItemController::class, 'update']);
        Route::delete('/{id}', [CursoItemController::class, 'destroy']);
        Route::patch('/{id}/calibrate', [CursoItemController::class, 'calibrate']);

        Route::get('/export/{id}/{method}', [CursoItemController::class, 'export']);
        Route::post('/import/{method}', [CursoItemController::class, 'import']);
        });

    // Rotas de Avaliações
    Route::prefix('avaliacoes')->group(function () {
        Route::post('/', [AvaliacaoController::class, 'store']);
        Route::get('/', [AvaliacaoController::class, 'index']);
        Route::get('/curso/{cursoId}', [AvaliacaoController::class, 'getByCurso']);
        Route::get('/{id}', [AvaliacaoController::class, 'show']);
        Route::get('/{id}/itens', [AvaliacaoController::class, 'getItensAvaliacao']);
        Route::get('/{id}/completa', [AvaliacaoController::class, 'getAvaliacaoCompleta']);
        Route::put('/{id}', [AvaliacaoController::class, 'update']);
        Route::delete('/{id}', [AvaliacaoController::class, 'destroy']);
        Route::post('/verificar-disponibilidade', [AvaliacaoController::class, 'verificarDisponibilidade']);
    });

    Route::middleware('abilities:access:all')->group(function () {
        # Rotas de Convites
        Route::post('/convites', [ConvitesController::class,'store']);
        Route::get('/convites', [ConvitesController::class,'index']);

        # Rota de Colabs
        Route::get('/colabs', [ColabsController::class,'index']);
        Route::get('/colabs/{id_colab}', [ColabsController::class,'show']);
        Route::put('/colabs/{id}', [ColabsController::class,'update']);
        Route::get('/colabs/export', [ColabsController::class, 'export']);

        # Rotas para Cursos de Colaboradores
        Route::get('/colabs/{id}/cursos', [ColabsController::class, 'getCursos']);
        Route::post('/colabs/{id}/cursos', [ColabsController::class, 'addCurso']);
        Route::delete('/colabs/{id}/cursos/{curso_id}', [ColabsController::class, 'removeCurso']);
        Route::put('/colabs/{id}/cursos', [ColabsController::class, 'syncCursos']);

        #Rotas de Cursos
        Route::post('/cursos', [CursoController::class, 'store']);
        Route::patch('/cursos/{id}', [CursoController::class, 'update']);
        Route::delete('/cursos/{id}', [CursoController::class, 'destroy']);

        #Rotas de matrizes
        Route::post('/matrizes', [MatrixController::class,'store']);
        Route::delete('/matrizes/{id}', [MatrixController::class, 'destroy']);
    });

    Route::get('/perfis', [PerfisController::class, 'index']);
    Route::get('/auth', [AuthController::class,'show']);
});