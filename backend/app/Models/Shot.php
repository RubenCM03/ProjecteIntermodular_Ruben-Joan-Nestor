<?php

namespace App\Models;

use App\Enums\ShotResult;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Shot extends Model
{
    use HasFactory;

    protected $fillable = [
        'game_id',
        'row',
        'col',
        'result',
    ];

    protected function casts(): array
    {
        return [
            'result' => ShotResult::class,
        ];
    }

    public function game()
    {
        return $this->belongsTo(Game::class);
    }
}