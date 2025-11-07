<?php

namespace Database\Seeders;

use Carbon\Carbon;
use Illuminate\Support\Str;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use App\Models\{
    Curso,
    Matriz,
    Categoria,
    Competencia,
    Conhecimento,
    Funcao,
    SubFuncao
};

class MatrizDemoSeeder extends Seeder
{
    public function run(): void
    {
        $curso = Curso::firstOrCreate(
            ['nome' => 'Engenharia de Computação'],
            [
                'id' => (string) Str::uuid(),
                'descricao' => 'Melhor curso de todos',
                'carga_horaria' => 360,
                'status' => true,
            ]
        );

        $matriz = Matriz::firstOrCreate(
            [
                'curso_id' => $curso->id,
                'nome' => '2025.1',
                'versao' => 'v1',
            ],
            [
                'id' => (string) Str::uuid(),
                'vigente_de' => Carbon::now()->subYear(),
                'vigente_ate' => Carbon::now()->addYear(),
            ]
        );

        $basica = Categoria::firstOrCreate(
            ['matriz_id' => $matriz->id, 'nome' => 'Básica', 'codigo' => 1],
            ['id' => (string) Str::uuid()],
        );

        $inter = Categoria::firstOrCreate(
            ['matriz_id' => $matriz->id, 'nome' => 'Intermediária', 'codigo' => 2],
            ['id' => (string) Str::uuid()],
        );

        $c1 = Competencia::firstOrCreate(
            ['categoria_id' => $basica->id, 'nome' => 'Programação I'],
            ['id' => (string) Str::uuid()]
        );
        $c2 = Competencia::firstOrCreate(
            ['categoria_id' => $basica->id, 'nome' => 'Lógica'],
            ['id' => (string) Str::uuid()]
        );
        $c3 = Competencia::firstOrCreate(
            ['categoria_id' => $basica->id, 'nome' => 'Estruturas de Dados'],
            ['id' => (string) Str::uuid()]
        );
        $c4 = Competencia::firstOrCreate(
            ['categoria_id' => $inter->id, 'nome' => 'Sistemas Embarcados'],
            ['id' => (string) Str::uuid()]
        );
        $c5 = Competencia::firstOrCreate(
            ['categoria_id' => $inter->id, 'nome' => 'Banco de Dados'],
            ['id' => (string) Str::uuid()]
        );
        $c6 = Competencia::firstOrCreate(
            ['categoria_id' => $inter->id, 'nome' => 'Arquitetura de SW'],
            ['id' => (string) Str::uuid()]
        );

        $k_php = Conhecimento::firstOrCreate(
            ['matriz_id' => $matriz->id, 'nome' => 'PHP Básico'],
            ['id' => (string) Str::uuid(), 'codigo' => 101, 'descricao' => 'Introdução à linguagem PHP.']
        );

        $k_alg = Conhecimento::firstOrCreate(
            ['matriz_id' => $matriz->id, 'nome' => 'Algoritmos'],
            ['id' => (string) Str::uuid(), 'codigo' => 102, 'descricao' => 'Raciocínio lógico e estruturado.']
        );

        $k_ed = Conhecimento::firstOrCreate(
            ['matriz_id' => $matriz->id, 'nome' => 'Listas/Pilhas/Filas'],
            ['id' => (string) Str::uuid(), 'codigo' => 103, 'descricao' => 'Estruturas fundamentais de dados.']
        );

        $k_drv = Conhecimento::firstOrCreate(
            ['matriz_id' => $matriz->id, 'nome' => 'C/Drivers'],
            ['id' => (string) Str::uuid(), 'codigo' => 201, 'descricao' => 'Programação de drivers e hardware.']
        );

        $k_rtos = Conhecimento::firstOrCreate(
            ['matriz_id' => $matriz->id, 'nome' => 'RTOS Básico'],
            ['id' => (string) Str::uuid(), 'codigo' => 202, 'descricao' => 'Fundamentos de sistemas operacionais de tempo real.']
        );

        $k_sql = Conhecimento::firstOrCreate(
            ['matriz_id' => $matriz->id, 'nome' => 'SQL Avançado'],
            ['id' => (string) Str::uuid(), 'codigo' => 203, 'descricao' => 'Consultas e otimização de banco de dados.']
        );

        $k_norm = Conhecimento::firstOrCreate(
            ['matriz_id' => $matriz->id, 'nome' => 'Normalização'],
            ['id' => (string) Str::uuid(), 'codigo' => 204, 'descricao' => 'Modelagem e normalização de dados.']
        );

        $k_php->competencias()->syncWithoutDetaching([$c1->id]);
        $k_alg->competencias()->syncWithoutDetaching([$c2->id]);
        $k_ed->competencias()->syncWithoutDetaching([$c3->id]);

        $k_drv->competencias()->syncWithoutDetaching([$c4->id]);
        $k_rtos->competencias()->syncWithoutDetaching([$c4->id]);
        $k_sql->competencias()->syncWithoutDetaching([$c5->id]);
        $k_norm->competencias()->syncWithoutDetaching([$c5->id]);

        $dev = Funcao::firstOrCreate(
            ['matriz_id' => $matriz->id, 'nome' => 'Desenvolvimento', 'codigo' => 1],
            ['id' => (string) Str::uuid()],
        );
        $man = Funcao::firstOrCreate(
            ['matriz_id' => $matriz->id, 'nome' => 'Manutenção', 'codigo' => 2],
            ['id' => (string) Str::uuid()],
        );

        $backend = SubFuncao::firstOrCreate(['funcao_id' => $dev->id, 'nome' => 'Backend'], ['id' => (string) Str::uuid()]);
        $frontend = SubFuncao::firstOrCreate(['funcao_id' => $dev->id, 'nome' => 'Frontend'], ['id' => (string) Str::uuid()]);
        $diagnostico = SubFuncao::firstOrCreate(['funcao_id' => $man->id, 'nome' => 'Diagnóstico'], ['id' => (string) Str::uuid()]);

        DB::table('matriz_subfuncao_conhecimento')->insert([
            ['id' => (string) Str::uuid(), 'matriz_id' => $matriz->id, 'subfuncao_id' => $backend->id, 'competencia_id' => $c1->id, 'conhecimento_id' => $k_php->id],
            ['id' => (string) Str::uuid(), 'matriz_id' => $matriz->id, 'subfuncao_id' => $frontend->id, 'competencia_id' => $c2->id, 'conhecimento_id' => $k_alg->id],
            ['id' => (string) Str::uuid(), 'matriz_id' => $matriz->id, 'subfuncao_id' => $diagnostico->id, 'competencia_id' => $c3->id, 'conhecimento_id' => $k_ed->id],

            ['id' => (string) Str::uuid(), 'matriz_id' => $matriz->id, 'subfuncao_id' => $diagnostico->id, 'competencia_id' => $c4->id, 'conhecimento_id' => $k_drv->id],
            ['id' => (string) Str::uuid(), 'matriz_id' => $matriz->id, 'subfuncao_id' => $diagnostico->id, 'competencia_id' => $c4->id, 'conhecimento_id' => $k_rtos->id],
            ['id' => (string) Str::uuid(), 'matriz_id' => $matriz->id, 'subfuncao_id' => $backend->id, 'competencia_id' => $c5->id, 'conhecimento_id' => $k_sql->id],
            ['id' => (string) Str::uuid(), 'matriz_id' => $matriz->id, 'subfuncao_id' => $backend->id, 'competencia_id' => $c5->id, 'conhecimento_id' => $k_norm->id],
        ]);
    }
}
