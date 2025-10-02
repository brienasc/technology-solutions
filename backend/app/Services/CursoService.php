<?php

namespace App\Services;

use App\Models\Curso;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

class CursoService
{
    public function getSummary(): Collection
    {
        $cursos = Curso::orderby('nome')->get(['id','nome']);

        $cursos->each(fn($c) => $c->makeHidden('timestamps'));

        return $cursos;
    }

    public function indexFiltered($filters): LengthAwarePaginator
    {
        $query = Curso::query();

        if (isset($filtros['nome'])) {
            $query->where('nome', 'like', '%' . $filters['nome'] . '%');
        }

        $per_page = $filtros['per_page'] ?? 15;

        return $query->paginate($per_page);
    }

    public function createCourse(array $data)
    {
        return Curso::create($data);
    }
}
