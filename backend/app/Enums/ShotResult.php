<?php

namespace App\Enums;

enum ShotResult: string
{
    case HIT = 'hit';
    case MISS = 'miss';
    case SUNK = 'sunk';
}