<?php

namespace App\Models;

use App\Enums\GameStatus;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Game extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'status',
        'shots_taken',
        'max_shots',
        'started_at',
        'finished_at',
    ];

    protected function casts(): array
    {
        return [
            'status' => GameStatus::class,
            'started_at' => 'datetime',
            'finished_at' => 'datetime',
        ];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function ships()
    {
        return $this->hasMany(Ship::class);
    }

    public function shots()
    {
        return $this->hasMany(Shot::class);
    }
}