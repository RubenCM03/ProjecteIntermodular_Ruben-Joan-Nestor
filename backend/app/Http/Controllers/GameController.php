<?php

namespace App\Http\Controllers;

use App\Enums\GameStatus;
use App\Enums\Orientation;
use App\Models\Game;
use App\Models\Ship;
use Illuminate\Http\Request;

class GameController extends Controller
{
    // Configuració dels vaixells
    private array $shipConfig = [
        ['name' => 'Portaavions', 'size' => 5],
        ['name' => 'Cuirassat',   'size' => 4],
        ['name' => 'Destructor',  'size' => 3],
        ['name' => 'Submarí',     'size' => 3],
        ['name' => 'Patrullera',  'size' => 2],
    ];

    // Crear nova partida
    public function create(Request $request)
    {
        // Si el jugador ja té una partida en curs, la retornem
        $activeGame = Game::where('user_id', $request->user()->id)
            ->where('status', GameStatus::PLAYING)
            ->first();

        if ($activeGame) {
            return response()->json([
                'message' => 'Ja tens una partida en curs',
                'game' => $this->formatGame($activeGame),
            ], 200);
        }

        // Crear la partida
        $game = Game::create([
            'user_id'    => $request->user()->id,
            'status'     => GameStatus::PLAYING,
            'shots_taken' => 0,
            'max_shots'  => 40,
            'started_at' => now(),
        ]);

        // Col·locar els vaixells automàticament
        $this->placeShips($game);

        return response()->json([
            'message' => 'Partida creada correctament',
            'game'    => $this->formatGame($game),
        ], 201);
    }

    // Obtenir estat de la partida actual
    public function show(Request $request)
    {
        $game = Game::where('user_id', $request->user()->id)
            ->where('status', GameStatus::PLAYING)
            ->with('shots')
            ->first();

        if (!$game) {
            return response()->json([
                'message' => 'No tens cap partida en curs'
            ], 404);
        }

        return response()->json([
            'game' => $this->formatGame($game),
        ]);
    }

    // Abandonar partida
    public function abandon(Request $request)
    {
        $game = Game::where('user_id', $request->user()->id)
            ->where('status', GameStatus::PLAYING)
            ->first();

        if (!$game) {
            return response()->json([
                'message' => 'No tens cap partida en curs'
            ], 404);
        }

        $game->update([
            'status'      => GameStatus::LOST,
            'finished_at' => now(),
        ]);

        return response()->json([
            'message' => 'Partida abandonada',
        ]);
    }

    // ==========================================
    // MÈTODES PRIVATS
    // ==========================================

    private function placeShips(Game $game): void
    {
        $board = array_fill(0, 10, array_fill(0, 10, false));

        foreach ($this->shipConfig as $config) {
            $placed = false;
            $attempts = 0;

            while (!$placed && $attempts < 100) {
                $attempts++;
                $orientation = collect(Orientation::cases())->random();
                
                if ($orientation === Orientation::HORIZONTAL) {
                    $row = rand(0, 9);
                    $col = rand(0, 9 - $config['size']);
                } else {
                    $row = rand(0, 9 - $config['size']);
                    $col = rand(0, 9);
                }

                if ($this->canPlace($board, $row, $col, $config['size'], $orientation)) {
                    $this->markBoard($board, $row, $col, $config['size'], $orientation);

                    Ship::create([
                        'game_id'     => $game->id,
                        'name'        => $config['name'],
                        'size'        => $config['size'],
                        'start_row'   => $row,
                        'start_col'   => $col,
                        'orientation' => $orientation,
                        'sunk'        => false,
                    ]);

                    $placed = true;
                }
            }
        }
    }

    private function canPlace(array $board, int $row, int $col, int $size, Orientation $orientation): bool
    {
        for ($i = 0; $i < $size; $i++) {
            $r = $orientation === Orientation::HORIZONTAL ? $row : $row + $i;
            $c = $orientation === Orientation::HORIZONTAL ? $col + $i : $col;

            // Comprovem la cel·la i les seves veïnes
            for ($dr = -1; $dr <= 1; $dr++) {
                for ($dc = -1; $dc <= 1; $dc++) {
                    $nr = $r + $dr;
                    $nc = $c + $dc;
                    if ($nr >= 0 && $nr < 10 && $nc >= 0 && $nc < 10 && $board[$nr][$nc]) {
                        return false;
                    }
                }
            }
        }
        return true;
    }

    private function markBoard(array &$board, int $row, int $col, int $size, Orientation $orientation): void
    {
        for ($i = 0; $i < $size; $i++) {
            $r = $orientation === Orientation::HORIZONTAL ? $row : $row + $i;
            $c = $orientation === Orientation::HORIZONTAL ? $col + $i : $col;
            $board[$r][$c] = true;
        }
    }

    private function formatGame(Game $game): array
    {
        $game->load('shots');

        return [
            'id'          => $game->id,
            'status'      => $game->status->value,
            'shots_taken' => $game->shots_taken,
            'max_shots'   => $game->max_shots,
            'shots_left'  => $game->max_shots - $game->shots_taken,
            'started_at'  => $game->started_at,
            'finished_at' => $game->finished_at,
            'shots'       => $game->shots->map(fn($s) => [
                'row'    => $s->row,
                'col'    => $s->col,
                'result' => $s->result->value,
            ]),
        ];
    }
}