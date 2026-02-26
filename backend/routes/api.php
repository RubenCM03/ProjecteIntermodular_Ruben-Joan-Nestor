<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\GameController;
use App\Http\Controllers\ShotController;

// ==========================================
// RUTES PÚBLIQUES
// ==========================================
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// ==========================================
// RUTES PROTEGIDES (qualsevol usuari autenticat)
// ==========================================
Route::middleware('auth:sanctum')->group(function () {
    // Auth
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', function (Request $request) {
        return response()->json($request->user());
    });

    // ==========================================
    // RUTES DE PLAYER
    // ==========================================
    Route::middleware('role:player')->group(function () {
        Route::post('/game', [GameController::class, 'create']);
        Route::get('/game', [GameController::class, 'show']);
        Route::post('/game/abandon', [GameController::class, 'abandon']);
        Route::post('/game/shoot', [ShotController::class, 'shoot']);
    });

    // ==========================================
    // RUTES D'ADMIN
    // ==========================================
    Route::middleware('role:admin')->group(function () {
        // Aquí afegirem les rutes d'admin al pas següent
    });
});