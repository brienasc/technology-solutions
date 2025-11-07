<?php

namespace App\Enums;

enum ItemDificuldade: int
{
    case MUITO_FACIL = 1;
    case FACIL = 2;
    case MEDIO = 3;
    case DIFICIL = 4;
    case MUITO_DIFICIL = 5;

    public function description(): string
    {
        return match ($this) {
            self::MUITO_FACIL => 'Muito Fácil',
            self::FACIL => 'Fácil',
            self::MEDIO => 'Médio',
            self::DIFICIL => 'Difícil',
            self::MUITO_DIFICIL => 'Muito Difícil',
        };
    }
}
