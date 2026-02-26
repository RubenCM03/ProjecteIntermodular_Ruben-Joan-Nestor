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
    private array $defaultShipConfig = [
        ['name' => 'Portaavions', 'size' => 5],
        ['name' => 'Cuirassat',   'size' => 4],
        ['name' => 'Destructor',  'size' => 3],
        ['name' => 'Submarí',     'size' => 3],
        ['name' => 'Patrullera',  'size' => 2],
    ];

    public function create(Request $request)
    {
        $request->validate([
            'board_size'          => 'integer|min:8|max:15',
            'ships'               => 'array|min:1|max:10',
            'ships.*.name'        => 'required_with:ships|string|max:50',
            'ships.*.size'        => 'required_with:ships|integer|min:1|max:6',
            'time_limit'          => 'nullable|integer|min:60|max:3600',
        ]);

        // Si el jugador ja té una partida en curs, la retornem
        $activeGame = Game::where('user_id', $request->user()->id)
            ->where('status', GameStatus::PLAYING)
            ->first();

        if ($activeGame) {
            return response()->json([
                'message' => 'Ja tens una partida en curs',
                'game'    => $this->formatGame($activeGame),
            ], 200);
        }

        $boardSize  = $request->input('board_size', 10);
        $shipConfig = $request->input('ships', $this->defaultShipConfig);

        // Validar que els vaixells caben al tauler
        foreach ($shipConfig as $ship) {
            if ($ship['size'] >= $boardSize) {
                return response()->json([
                    'message' => "El vaixell {$ship['name']} (mida {$ship['size']}) no cap en un tauler de {$boardSize}x{$boardSize}"
                ], 422);
            }
        }

        $game = Game::create([
            'user_id'     => $request->user()->id,
            'status'      => GameStatus::PLAYING,
            'shots_taken' => 0,
            'max_shots'   => $this->calculateMaxShots($boardSize, $shipConfig),
            'board_size'  => $boardSize,
            'ship_config' => $shipConfig,
            'time_limit'  => $request->input('time_limit'),
            'started_at'  => now(),
        ]);

        $this->placeShips($game, $boardSize, $shipConfig);

        return response()->json([
            'message' => 'Partida creada correctament',
            'game'    => $this->formatGame($game),
        ], 201);
    }

    private function calculateMaxShots(int $boardSize, array $shipConfig): int
    {
        // Total de cel·les dels vaixells * 2.5 arrodonit, mínim 20
        $totalShipCells = array_sum(array_column($shipConfig, 'size'));
        return max(20, (int) round($totalShipCells * 2.5));
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
    
        // Comprovar si s'ha acabat el temps
        if ($game->time_limit !== null) {
            $elapsed = (int) $game->started_at->diffInSeconds(now());
        
            if ($elapsed >= $game->time_limit) {
                $game->update([
                    'status'      => GameStatus::LOST,
                    'finished_at' => now(),
                ]);
            
                return response()->json([
                    'message'   => 'La partida ha expirat per temps',
                    'game_over' => true,
                    'status'    => GameStatus::LOST->value,
                ], 200);
            }
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

    private function placeShips(Game $game, int $boardSize, array $shipConfig): void
    {
        $board = array_fill(0, $boardSize, array_fill(0, $boardSize, false));

        foreach ($shipConfig as $config) {
            $placed   = false;
            $attempts = 0;

            while (!$placed && $attempts < 200) {
                $attempts++;
                $orientation = collect(Orientation::cases())->random();

                if ($orientation === Orientation::HORIZONTAL) {
                    $row = rand(0, $boardSize - 1);
                    $col = rand(0, $boardSize - $config['size']);
                } else {
                    $row = rand(0, $boardSize - $config['size']);
                    $col = rand(0, $boardSize - 1);
                }

                if ($this->canPlace($board, $row, $col, $config['size'], $orientation, $boardSize)) {
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

    private function canPlace(array $board, int $row, int $col, int $size, Orientation $orientation, int $boardSize): bool
    {
        for ($i = 0; $i < $size; $i++) {
            $r = $orientation === Orientation::HORIZONTAL ? $row : $row + $i;
            $c = $orientation === Orientation::HORIZONTAL ? $col + $i : $col;

            for ($dr = -1; $dr <= 1; $dr++) {
                for ($dc = -1; $dc <= 1; $dc++) {
                    $nr = $r + $dr;
                    $nc = $c + $dc;
                    if ($nr >= 0 && $nr < $boardSize && $nc >= 0 && $nc < $boardSize && $board[$nr][$nc]) {
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

        $timeInfo = $this->getTimeInfo($game);

        return [
            'id'          => $game->id,
            'status'      => $game->status->value,
            'board_size'  => $game->board_size,
            'shots_taken' => $game->shots_taken,
            'max_shots'   => $game->max_shots,
            'shots_left'  => $game->max_shots - $game->shots_taken,
            'time_limit'  => $game->time_limit,
            'time_elapsed' => $timeInfo['elapsed'],
            'time_left'   => $timeInfo['left'],
            'started_at'  => $game->started_at,
            'finished_at' => $game->finished_at,
            'shots'       => $game->shots->map(fn($s) => [
                'row'    => $s->row,
                'col'    => $s->col,
                'result' => $s->result->value,
            ]),
        ];
    }

    private function getTimeInfo(Game $game): array
    {
        if (!$game->started_at) {
            return ['elapsed' => 0, 'left' => $game->time_limit];
        }

        $elapsed = (int) $game->started_at->diffInSeconds(now());

        if ($game->time_limit === null) {
            return ['elapsed' => $elapsed, 'left' => null];
        }

        $left = max(0, $game->time_limit - $elapsed);

        return ['elapsed' => $elapsed, 'left' => $left];
    }
}