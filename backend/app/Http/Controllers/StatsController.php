<?php

namespace App\Http\Controllers;

use App\Enums\GameStatus;
use App\Models\Game;
use App\Models\User;
use Illuminate\Http\Request;

class StatsController extends Controller
{
    // Estadístiques personals del jugador
    public function myStats(Request $request)
    {
        $userId = $request->user()->id;

        $games = Game::where('user_id', $userId)
            ->whereIn('status', [GameStatus::WON, GameStatus::LOST])
            ->get();

        if ($games->isEmpty()) {
            return response()->json([
                'message' => 'Encara no has jugat cap partida',
                'stats'   => null,
            ]);
        }

        $totalGames    = $games->count();
        $wonGames      = $games->where('status', GameStatus::WON)->count();
        $lostGames     = $games->where('status', GameStatus::LOST)->count();
        $winRate       = round(($wonGames / $totalGames) * 100, 2);
        $avgShots      = round($games->avg('shots_taken'), 2);
        $bestGame      = $games->where('status', GameStatus::WON)->sortBy('shots_taken')->first();

        return response()->json([
            'stats' => [
                'total_games'  => $totalGames,
                'won_games'    => $wonGames,
                'lost_games'   => $lostGames,
                'win_rate'     => $winRate . '%',
                'avg_shots'    => $avgShots,
                'best_game'    => $bestGame ? [
                    'shots_taken' => $bestGame->shots_taken,
                    'date'        => $bestGame->finished_at,
                ] : null,
            ]
        ]);
    }

    // Historial de partides del jugador
    public function myHistory(Request $request)
    {
        $games = Game::where('user_id', $request->user()->id)
            ->whereIn('status', [GameStatus::WON, GameStatus::LOST])
            ->orderBy('finished_at', 'desc')
            ->get()
            ->map(fn($game) => [
                'id'          => $game->id,
                'status'      => $game->status->value,
                'shots_taken' => $game->shots_taken,
                'max_shots'   => $game->max_shots,
                'started_at'  => $game->started_at,
                'finished_at' => $game->finished_at,
                'duration'    => $this->formatDuration($game),
            ]);

        return response()->json([
            'history' => $games,
        ]);
    }

    // Ranking global
public function ranking()
{
    $ranking = User::where('role', 'player')
        ->withCount([
            'games as total_games' => fn($q) => $q->whereIn('status', [GameStatus::WON, GameStatus::LOST]),
            'games as won_games'   => fn($q) => $q->where('status', GameStatus::WON),
        ])
        ->get()
        ->filter(fn($user) => $user->total_games > 0)
        ->map(fn($user) => [
            'name'        => $user->name,
            'total_games' => $user->total_games,
            'won_games'   => $user->won_games,
            'win_rate'    => $user->total_games > 0
                ? round(($user->won_games / $user->total_games) * 100, 2) . '%'
                : '0%',
            'best_score'  => Game::where('user_id', $user->id)
                ->where('status', GameStatus::WON)
                ->min('shots_taken'),
        ])
        ->sortByDesc('won_games')
        ->sortBy('best_score')
        ->take(10)
        ->values();

    return response()->json([
        'ranking' => $ranking,
    ]);
}

    // Estadístiques globals (només admin)
    public function globalStats()
    {
        $totalGames  = Game::whereIn('status', [GameStatus::WON, GameStatus::LOST])->count();
        $totalWon    = Game::where('status', GameStatus::WON)->count();
        $totalLost   = Game::where('status', GameStatus::LOST)->count();
        $avgShots    = round(Game::whereIn('status', [GameStatus::WON, GameStatus::LOST])->avg('shots_taken'), 2);
        $activGames  = Game::where('status', GameStatus::PLAYING)->count();
        $totalPlayers = User::where('role', 'player')->count();

        return response()->json([
            'global_stats' => [
                'total_players'  => $totalPlayers,
                'total_games'    => $totalGames,
                'active_games'   => $activGames,
                'won_games'      => $totalWon,
                'lost_games'     => $totalLost,
                'avg_shots'      => $avgShots,
            ]
        ]);
    }

    // ==========================================
    // MÈTODES PRIVATS
    // ==========================================

    private function formatDuration(Game $game): ?string
    {
        if (!$game->started_at || !$game->finished_at) return null;

        $seconds = $game->started_at->diffInSeconds($game->finished_at);
        $minutes = intdiv($seconds, 60);
        $secs    = $seconds % 60;

        return "{$minutes}m {$secs}s";
    }
}