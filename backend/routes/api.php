<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\ConvitesController;
use App\Http\Controllers\ColabsController;

# Convites routes
Route::post('/convites', [ConvitesController::class,'store']);
Route::get('/convites', [ConvitesController::class,'index']);
Route::get('/convites/{id_convite}', [ConvitesController::class,'show']);

# Colabs routes
Route::post('/colabs', [ColabsController::class,'store']);
Route::get('/colabs', [ColabsController::class,'index']);
Route::get('/colabs/{id_colab}', [ColabsController::class,'show']);

Route::post('/login', [ColabsController::class, 'login']);
