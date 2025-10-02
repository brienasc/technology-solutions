<?php

namespace App\Services;

use App\Models\Curso;
use Illuminate\Support\Collection;

class CursoService
{
    public function getSummary(): Collection
    {
        $cursos = Curso::orderby('nome')->get(['id','nome']);

        $cursos->each(fn($c) => $c->makeHidden('timestamps'));

        return $cursos;
    }
}
