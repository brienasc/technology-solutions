<?php

namespace App\Services;

use App\Models\Curso;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

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

    public function update(string $id, array $data): Curso
    {
        $curso = Curso::findOrFail($id);

        $allowed = array_intersect_key($data, array_flip([
            'nome', 'descricao', 'carga_horaria', 'status',
        ]));

        $curso->fill($allowed);
        $curso->save();

        return $curso->refresh();
    }

    public function delete(string $id): void
    {
        DB::transaction(function () use ($id) {
            $curso = Curso::findOrFail($id);

            $curso->delete();
        });
    }
}
