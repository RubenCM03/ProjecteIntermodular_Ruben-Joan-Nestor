<?php

namespace App\Enums;

enum GameStatus: string
{
    case PLAYING = 'playing';
    case WON = 'won';
    case LOST = 'lost';
}