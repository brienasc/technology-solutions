<?php

namespace App\Enums;

enum  ConviteStatus: int{
    case PENDENTE = 0;
    case FINALIZADO = 1;
    case EXPIRADO = 2;

    public function description(): string
    {
        return match ($this) {
            self::PENDENTE => 'Em Aberto',
            self::FINALIZADO => 'Finalizado',
            self::EXPIRADO => 'Vencido',
        };
    }
}