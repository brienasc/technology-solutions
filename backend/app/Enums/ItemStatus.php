<?php

namespace App\Enums;

enum ItemStatus: int
{
    case RASCUNHO = 0;
    case FINALIZADO = 1;
    case CALIBRADO = 2;

    public function description(): string
    {
        return match ($this) {
            self::RASCUNHO => 'Rascunho',
            self::FINALIZADO => 'Finalizado',
            self::CALIBRADO => 'Calibrado',
        };
    }
}
