<?php

namespace App\Http\Controllers;

use App\Enums\GameStatus;
use App\Enums\Orientation;
use App\Models\Game;
use App\Models\Ship;
use Illuminate\Http\Request;

class GameController extends Controller
{
    private array $defaultShipConfig = [
        ['name' => 'Portaavions', 'size' => 5],
        ['name' => 'Cuirassat',   'size' => 4],
        ['name' => 'Creuer',      'size' => 3],
        ['name' => 'Submarí',     'size' => 3],
        ['name' => 'Patrullera',  'size' => 2],
    ];

    public function create(Request $request)
    {
        $request->validate([
            'board_size'   => 'integer|min:8|max:15',
            'ships'        => 'array|min:1|max:10',
            'ships.*.size' => 'required_with:ships|integer|min:1|max:6',
            'max_shots'    => 'nullable|integer|min:10|max:200',
        ]);

        // Si ja té una partida en curs, la retornem
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
        $shipConfig = collect($request->input('ships', $this->defaultShipConfig))
            ->map(fn($ship, $index) => [
                'name' => $this->defaultShipConfig[$index]['name'] ?? 'Vaixell ' . ($index + 1),
                'size' => $ship['size'],
            ])->toArray();

        // Si el frontend envia max_shots, l'usem; si no, el calculem automàticament
        $maxShots = $request->input('max_shots')
            ? (int) $request->input('max_shots')
            : $this->calculateMaxShots($boardSize, $shipConfig);

        $game = Game::create([
            'user_id'     => $request->user()->id,
            'status'      => GameStatus::PLAYING,
            'shots_taken' => 0,
            'max_shots'   => $maxShots,
            'board_size'  => $boardSize,
            'ship_config' => $shipConfig,
            'time_limit'  => null,
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
        $totalShipCells = array_sum(array_column($shipConfig, 'size'));
        return max(20, (int) round($totalShipCells * 2.5));
    }

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

        return [
            'id'           => $game->id,
            'status'       => $game->status->value,
            'board_size'   => $game->board_size,
            'shots_taken'  => $game->shots_taken,
            'max_shots'    => $game->max_shots,
            'shots_left'   => $game->max_shots - $game->shots_taken,
            'started_at'   => $game->started_at,
            'finished_at'  => $game->finished_at,
            'shots'        => $game->shots->map(fn($s) => [
                'row'    => $s->row,
                'col'    => $s->col,
                'result' => $s->result->value,
            ]),
        ];
    }
}