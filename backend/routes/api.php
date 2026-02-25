<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;

// ==========================================
// RUTES PÚBLIQUES (No requereixen token)
// ==========================================

// RUTA GET PÚBLICA PER TEST
Route::get('/informacio-publica', function () {
    return response()->json([
        'success' => true,
        'message' => 'Aquesta és informació pública. Qualsevol la pot veure.',
        'data' => [
            'app_name' => 'La meva API Laravel',
            'versio' => '1.0',
            'estat' => 'Funcionant correctament'
        ]
    ]);
});


Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);


// ==========================================
// RUTES PROTEGIDES (Requereixen token vàlid)
// ==========================================

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    
    // Ruta d'exemple per obtenir les dades de l'usuari identificat
    Route::get('/user', function (Request $request) {
        return $request->user();
    });
});