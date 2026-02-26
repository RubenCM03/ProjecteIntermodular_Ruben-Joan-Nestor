<?php

namespace App\Models;

use App\Enums\Orientation;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Ship extends Model
{
    use HasFactory;

    protected $fillable = [
        'game_id',
        'name',
        'size',
        'start_row',
        'start_col',
        'orientation',
        'sunk',
    ];

    protected function casts(): array
    {
        return [
            'orientation' => Orientation::class,
            'sunk' => 'boolean',
        ];
    }

    public function game()
    {
        return $this->belongsTo(Game::class);
    }

    public function occupiedCells(): array
    {
        $cells = [];
        for ($i = 0; $i < $this->size; $i++) {
            if ($this->orientation === Orientation::HORIZONTAL) {
                $cells[] = ['row' => $this->start_row, 'col' => $this->start_col + $i];
            } else {
                $cells[] = ['row' => $this->start_row + $i, 'col' => $this->start_col];
            }
        }
        return $cells;
    }
}