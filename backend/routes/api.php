<?php

use Illuminate\Support\Facades\Route;

use App\Http\Controllers\ConvitesController;

# Convites routes
Route::post('convites', [ConvitesController::class,'store']);
Route::get('/convites', [ConvitesController::class,'index']);