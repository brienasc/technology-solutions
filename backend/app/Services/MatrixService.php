<?php

namespace App\Services;

use App\Models\Matriz;
use Illuminate\Pagination\LengthAwarePaginator;

class MatrixService
{
    public function paginate(int $perPage = 15, ?string $q = null): LengthAwarePaginator
    {
        $paginator = Matriz::query()
            ->select(['id', 'curso_id', 'nome', 'versao', 'vigente_de', 'vigente_ate'])
            ->with(['curso:id,nome'])
            ->when($q, function ($qb) use ($q) {
                $term = "%{$q}%";
                $qb->where(function ($w) use ($term) {
                    $w->where('nome', 'ilike', $term)
                      ->orWhere('versao', 'ilike', $term);
                });
            })
            ->paginate($perPage);

        $paginator->getCollection()->transform(function (Matriz $m) {
            return [
                'id'      => (string) $m->id,
                'nome'    => $m->nome,
                'versao'  => $m->versao,
                'vigencia' => [
                    'de'  => $m->vigente_de,
                    'ate' => $m->vigente_ate,
                ],
                'curso'   => [
                    'nome' => optional($m->curso)->nome,
                ],
            ];
        });

        return $paginator;
    }
}
