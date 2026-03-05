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
        $game = Game::where('user_id', $request->user()->id)
            ->where('status', GameStatus::PLAYING)
            ->with('ships', 'shots')
            ->first();

        if (!$game) {
            return response()->json([
                'message' => 'No tens cap partida en curs'
            ], 404);
        }

        // Comprovar temps
        if ($game->time_limit !== null) {
            $elapsed = (int) $game->started_at->diffInSeconds(now());

            if ($elapsed >= $game->time_limit) {
                if ($game->status === GameStatus::PLAYING) {
                    $game->update([
                        'status'      => GameStatus::LOST,
                        'finished_at' => now(),
                    ]);
                }

                return response()->json([
                    'message'   => 'Se t\'ha acabat el temps!',
                    'game_over' => true,
                    'status'    => GameStatus::LOST->value,
                    'ships'     => $this->formatShips($game),
                ], 422);
            }
        }

        $request->validate([
            'row' => "required|integer|min:0|max:" . ($game->board_size - 1),
            'col' => "required|integer|min:0|max:" . ($game->board_size - 1),
        ]);

        $row = $request->row;
        $col = $request->col;

        // Comprovar cel·la ja disparada
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
            $hitsOnShip = $this->countHitsOnShip($game, $hitShip, $row, $col);
            if ($hitsOnShip >= $hitShip->size) {
                $result = ShotResult::SUNK;
                $hitShip->update(['sunk' => true]);
            } else {
                $result = ShotResult::HIT;
            }
        }

        // Guardar tir
        Shot::create([
            'game_id' => $game->id,
            'row'     => $row,
            'col'     => $col,
            'result'  => $result,
        ]);

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
            $response['sunk_size'] = $hitShip->size;
            $response['sunk_cells'] = $hitShip->occupiedCells(); // ← añade esto
        }

        if ($gameOver) {
            $response['game_over'] = true;
            $response['status']    = $game->status->value;
            $response['message']   = $game->status === GameStatus::WON
                ? '🎉 Has trobat tots els vaixells!'
                : '💀 Se t\'han acabat els intents!';
            $response['ships']     = $this->formatShips($game);
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

    private function formatShips(Game $game): array
    {
        return $game->ships->map(fn($s) => [
            'name'        => $s->name,
            'size'        => $s->size,
            'start_row'   => $s->start_row,
            'start_col'   => $s->start_col,
            'orientation' => $s->orientation->value,
            'sunk'        => $s->sunk,
        ])->toArray();
    }
}