<?php

namespace App\Enums;

enum PerfilType: int
{
    case Administrador = 1;
    case Elaborador = 2;

    public function label(): string
    {
        return match ($this) {
            self::Administrador => 'Administrador',
            self::Elaborador    => 'Elaborador de Itens'
        };
    }
}
