<?php

namespace Database\Seeders;

use Carbon\Carbon;
use Illuminate\Support\Str;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use App\Models\{Curso,Matriz,Categoria,Competencia,Conhecimento,Funcao,SubFuncao};

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
                'vigente_de' => Carbon::now()->subYear(),
                'vigente_ate' => Carbon::now()->addYear()
            ],
            ['id' => (string) Str::uuid()]
        );

        // Categorias
        $basica = Categoria::firstOrCreate(
            ['matriz_id' => $matriz->id, 'nome' => 'Básica'],
            ['id' => (string) Str::uuid()]
        );
        $inter  = Categoria::firstOrCreate(
            ['matriz_id' => $matriz->id, 'nome' => 'Intermediária'],
            ['id' => (string) Str::uuid()]
        );

        // Competências por categoria
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

        // Conhecimentos (exemplos)
        $k_php  = Conhecimento::firstOrCreate(
            ['competencia_id' => $c1->id, 'nome' => 'PHP Básico'],
            ['id' => (string) Str::uuid()]
        );
        $k_alg  = Conhecimento::firstOrCreate(
            ['competencia_id' => $c2->id, 'nome' => 'Algoritmos'],
            ['id' => (string) Str::uuid()]
        );
        $k_ed   = Conhecimento::firstOrCreate(
            ['competencia_id' => $c3->id, 'nome' => 'Listas/Pilhas/Filas'],
            ['id' => (string) Str::uuid()]
        );

        $k_drv  = Conhecimento::firstOrCreate(
            ['competencia_id' => $c4->id, 'nome' => 'C/Drivers'],
            ['id' => (string) Str::uuid()]
        );
        $k_rtos = Conhecimento::firstOrCreate(
            ['competencia_id' => $c4->id, 'nome' => 'RTOS Básico'],
            ['id' => (string) Str::uuid()]
        );

        $k_sql  = Conhecimento::firstOrCreate(
            ['competencia_id' => $c5->id, 'nome' => 'SQL Avançado'],
            ['id' => (string) Str::uuid()]
        );
        $k_norm = Conhecimento::firstOrCreate(
            ['competencia_id' => $c5->id, 'nome' => 'Normalização'],
            ['id' => (string) Str::uuid()]
        );

        // Funções/Subfunções
        $dev = Funcao::firstOrCreate(
            ['matriz_id' => $matriz->id, 'nome' => 'Desenvolvimento'],
            ['id' => (string) Str::uuid()]
        );
        $man = Funcao::firstOrCreate(
            ['matriz_id' => $matriz->id, 'nome' => 'Manutenção'],
            ['id' => (string) Str::uuid()]
        );

        $backend     = Subfuncao::firstOrCreate(
            ['funcao_id' => $dev->id, 'nome' => 'Backend'],
            ['id' => (string) Str::uuid()]
        );
        $frontend    = Subfuncao::firstOrCreate(
            ['funcao_id' => $dev->id, 'nome' => 'Frontend'],
            ['id' => (string) Str::uuid()]
        );
        $diagnostico = Subfuncao::firstOrCreate(
            ['funcao_id' => $man->id, 'nome' => 'Diagnóstico'],
            ['id' => (string) Str::uuid()]
        );

        // Cruzamentos (Subfunção × Competência) selecionando conhecimentos
        DB::table('matriz_subfuncao_conhecimento')->insert([
            // Básica
            ['id' => (string) Str::uuid(), 'matriz_id' => $matriz->id, 'subfuncao_id' => $backend->id,    'competencia_id' => $c1->id, 'conhecimento_id' => $k_php->id],
            ['id' => (string) Str::uuid(), 'matriz_id' => $matriz->id, 'subfuncao_id' => $frontend->id,   'competencia_id' => $c2->id, 'conhecimento_id' => $k_alg->id],
            ['id' => (string) Str::uuid(), 'matriz_id' => $matriz->id, 'subfuncao_id' => $diagnostico->id,'competencia_id' => $c3->id, 'conhecimento_id' => $k_ed->id],

            // Intermediária
            ['id' => (string) Str::uuid(), 'matriz_id' => $matriz->id, 'subfuncao_id' => $diagnostico->id,'competencia_id' => $c4->id, 'conhecimento_id' => $k_drv->id],
            ['id' => (string) Str::uuid(), 'matriz_id' => $matriz->id, 'subfuncao_id' => $diagnostico->id,'competencia_id' => $c4->id, 'conhecimento_id' => $k_rtos->id],
            ['id' => (string) Str::uuid(), 'matriz_id' => $matriz->id, 'subfuncao_id' => $backend->id,    'competencia_id' => $c5->id, 'conhecimento_id' => $k_sql->id],
            ['id' => (string) Str::uuid(), 'matriz_id' => $matriz->id, 'subfuncao_id' => $backend->id,    'competencia_id' => $c5->id, 'conhecimento_id' => $k_norm->id],
        ]);
    }
}
