<?php

namespace App\Services;

use App\Models\Curso;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class CursoService
{
    public function getSummary(): Collection
    {
        $cursos = Curso::orderby('nome')->get(['id','nome']);

        $cursos->each(fn($c) => $c->makeHidden('timestamps'));

        return $cursos;
    }


    public function indexFiltered(array $filters): LengthAwarePaginator
    {
        $query = Curso::query();

        if (!empty($filters['nome'])) {
            $nome = trim($filters['nome']);
            $query->where('nome', 'ILIKE', "%{$nome}%");
        }

        if (array_key_exists('status', $filters)) {
            $status = filter_var($filters['status'], FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE);
            if ($status !== null) {
                $query->where('status', $status);
            }
        }

        $perPage = (int)($filters['per_page'] ?? 15);
        $perPage = max(1, min($perPage, 100));

        $page = isset($filters['page']) ? (int)$filters['page'] : null;

        return $query->paginate($perPage, ['*'], 'page', $page);
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
