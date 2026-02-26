<?php

namespace App\Http\Controllers;

use App\Enums\GameStatus;
use App\Enums\ShotResult;
use App\Models\Game;
use App\Models\Shot;
use Illuminate\Http\Request;

class ShotController extends Controller
{
    public function shoot(Request $request)
    {
        $request->validate([
            'row' => 'required|integer|min:0|max:9',
            'col' => 'required|integer|min:0|max:9',
        ]);

        // Obtenir partida activa
        $game = Game::where('user_id', $request->user()->id)
            ->where('status', GameStatus::PLAYING)
            ->with('ships', 'shots')
            ->first();

        if (!$game) {
            return response()->json([
                'message' => 'No tens cap partida en curs'
            ], 404);
        }

        $row = $request->row;
        $col = $request->col;

        // Comprovar si ja s'ha disparat a aquesta cel·la
        $alreadyShot = $game->shots->first(
            fn($s) => $s->row === $row && $s->col === $col
        );

        if ($alreadyShot) {
            return response()->json([
                'message' => 'Ja has disparat a aquesta cel·la'
            ], 422);
        }

        // Comprovar si ha tocat un vaixell
        $hitShip = null;
        foreach ($game->ships as $ship) {
            foreach ($ship->occupiedCells() as $cell) {
                if ($cell['row'] === $row && $cell['col'] === $col) {
                    $hitShip = $ship;
                    break 2;
                }
            }
        }

        // Determinar resultat
        if (!$hitShip) {
            $result = ShotResult::MISS;
        } else {
            // Comprovar si el vaixell queda enfonsat
            $hitsOnShip = $this->countHitsOnShip($game, $hitShip, $row, $col);

            if ($hitsOnShip >= $hitShip->size) {
                $result = ShotResult::SUNK;
                $hitShip->update(['sunk' => true]);
            } else {
                $result = ShotResult::HIT;
            }
        }

        // Guardar el tir
        Shot::create([
            'game_id' => $game->id,
            'row'     => $row,
            'col'     => $col,
            'result'  => $result,
        ]);

        // Actualitzar comptador
        $game->increment('shots_taken');
        $game->refresh();

        // Comprovar fi de partida
        $gameOver = $this->checkGameOver($game, $result);

        $response = [
            'result'      => $result->value,
            'shots_taken' => $game->shots_taken,
            'shots_left'  => $game->max_shots - $game->shots_taken,
        ];

        if ($result === ShotResult::SUNK) {
            $response['sunk_ship'] = $hitShip->name;
        }

        if ($gameOver) {
            $response['game_over'] = true;
            $response['status']    = $game->status->value;
            $response['message']   = $game->status === GameStatus::WON
                ? '🎉 Has trobat tots els vaixells!'
                : '💀 Se t\'han acabat els intents!';

            // Revelar posicions dels vaixells al final
            $response['ships'] = $game->ships->map(fn($s) => [
                'name'        => $s->name,
                'size'        => $s->size,
                'start_row'   => $s->start_row,
                'start_col'   => $s->start_col,
                'orientation' => $s->orientation->value,
                'sunk'        => $s->sunk,
            ]);
        }

        return response()->json($response);
    }

    // ==========================================
    // MÈTODES PRIVATS
    // ==========================================

    private function countHitsOnShip(Game $game, $ship, int $newRow, int $newCol): int
    {
        $cells = $ship->occupiedCells();
        $cellKeys = array_map(fn($c) => $c['row'] . '-' . $c['col'], $cells);

        // Hits anteriors sobre aquest vaixell
        $previousHits = $game->shots->filter(function ($shot) use ($cellKeys) {
            return in_array($shot->row . '-' . $shot->col, $cellKeys)
                && $shot->result !== ShotResult::MISS;
        })->count();

        // +1 pel tir actual
        return $previousHits + 1;
    }

    private function checkGameOver(Game $game, ShotResult $lastResult): bool
    {
        // Comprovar si ha guanyat (tots els vaixells enfonsats)
        if ($lastResult === ShotResult::SUNK) {
            $game->refresh()->load('ships');
            $allSunk = $game->ships->every(fn($s) => $s->sunk);

            if ($allSunk) {
                $game->update([
                    'status'      => GameStatus::WON,
                    'finished_at' => now(),
                ]);
                return true;
            }
        }

        // Comprovar si ha perdut (sense intents)
        if ($game->shots_taken >= $game->max_shots) {
            $game->update([
                'status'      => GameStatus::LOST,
                'finished_at' => now(),
            ]);
            return true;
        }

        return false;
    }
}