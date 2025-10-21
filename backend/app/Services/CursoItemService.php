<?php

namespace App\Services;

use App\Models\Item;

class CursoItemService
{
    public function getItensByCourse(string $id)
    {
        return Item::query()
            ->leftJoin('matrizes', 'matrizes.id', '=', 'itens.matriz_id')
            ->where('itens.curso_id', $id)
            ->orderByDesc('itens.created_at')
            ->get([
                'itens.id',
                'itens.code',
                'itens.status',
                'itens.dificuldade',
                'itens.created_at',
                'itens.matriz_id',
                'matrizes.nome as matriz_nome',
            ]);
    }
}
