<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\CursoController;
use App\Http\Controllers\PerfisController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ConvitesController;
use App\Http\Controllers\ColabsController;
use App\Http\Controllers\ContactController;

# Contact Route
Route::post('/contact-form', [ContactController::class, 'recv']);
Route::post('/login', [ColabsController::class, 'login'])->name('login');
Route::post('/colabs', [ColabsController::class,'store']);
Route::get('/convites/{id_convite}', [ConvitesController::class,'show']);


Route::middleware('auth:sanctum')->group(function () {
    # Rotas de Convites
    Route::middleware('abilities:access:menu-convidar')->group(function () {
        Route::post('/convites', [ConvitesController::class,'store']);
        Route::get('/convites', [ConvitesController::class,'index']);
    });

    # Rotas de Colabs
    Route::middleware('abilities:access:menu-gerencial')->group(function () {
        Route::get('/colabs', [ColabsController::class,'index']);
        Route::get('/colabs/{id_colab}', [ColabsController::class,'show']);
        Route::put('/colabs/{id}', [ColabsController::class,'update']);
        Route::get('/colabs/export', [ColabsController::class, 'export']);
    });

    #Rotas de Cursos
    Route::get('/cursos/summary', [CursoController::class, 'summary']);
    Route::get('/cursos', [CursoController::class, 'index']);
    Route::post('/cursos', [CursoController::class, 'store']);
    Route::patch('/cursos/{id}', [CursoController::class, 'update']);
    Route::delete('/cursos/{id}', [CursoController::class, 'destroy']);


    Route::get('/perfis', [PerfisController::class, 'index']);
    Route::get('/auth', [AuthController::class,'show']);
});
