<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

class ItensAlternativasSeeder extends Seeder
{
    public function run(): void
    {
        $qtdItens = 5;

        foreach (['cursos', 'matrizes', 'matriz_subfuncao_conhecimento'] as $tbl) {
            if (!Schema::hasTable($tbl)) {
                throw new \RuntimeException("A tabela '{$tbl}' não existe. Rode as migrations ou ajuste o seeder.");
            }
        }

        $cursoId = DB::table('cursos')->inRandomOrder()->value('id');
        $matrizId = DB::table('matrizes')->inRandomOrder()->value('id');

        if (!$cursoId || !$matrizId) {
            throw new \RuntimeException("É necessário ter ao menos 1 curso e 1 matriz para semear itens.");
        }

        $cruzamentoQuery = DB::table('matriz_subfuncao_conhecimento');
        if (Schema::hasColumn('matriz_subfuncao_conhecimento', 'matriz_id')) {
            $cruzamentos = $cruzamentoQuery->where('matriz_id', $matrizId)->pluck('id');
            if ($cruzamentos->isEmpty()) {
                $cruzamentos = DB::table('matriz_subfuncao_conhecimento')->pluck('id');
            }
        } else {
            $cruzamentos = $cruzamentoQuery->pluck('id');
        }

        if ($cruzamentos->isEmpty()) {
            throw new \RuntimeException("Não há registros em 'matriz_subfuncao_conhecimento' para relacionar aos itens.");
        }

        DB::transaction(function () use ($qtdItens, $cursoId, $matrizId, $cruzamentos) {
            for ($i = 1; $i <= $qtdItens; $i++) {
                $itemId = (string) Str::uuid();

                do {
                    $code = 'ITM-' . strtoupper(Str::random(8));
                } while (DB::table('itens')->where('code', $code)->exists());

                $cruzamentoId = $cruzamentos->random();
                $status = [0,1,2][array_rand([0,1,2])];
                $dificuldade = random_int(1, 5);

                DB::table('itens')->insert([
                    'id'             => $itemId,
                    'code'           => $code,
                    'curso_id'       => $cursoId,
                    'matriz_id'      => $matrizId,
                    'cruzamento_id'  => $cruzamentoId,
                    'comando'        => "Enunciado da questão {$i}: descreva/analise a situação proposta.",
                    'contexto'       => "Contexto {$i}: texto-base, cenário ou trecho de apoio ao item.",
                    'status'         => $status,
                    'dificuldade'    => $dificuldade,
                    'created_at'     => now(),
                    'updated_at'     => now(),
                ]);

                $correta = random_int(1, 5);
                $letras  = ['A','B','C','D','E'];

                for ($ordem = 1; $ordem <= 5; $ordem++) {
                    $altId = (string) Str::uuid();
                    $isCorrect = ($ordem === $correta);

                    DB::table('alternativas')->insert([
                        'id'            => $altId,
                        'item_id'       => $itemId,
                        'ordem'         => $ordem,
                        'texto'         => "Alternativa {$letras[$ordem-1]} do item {$i}.",
                        'justificativa' => $isCorrect
                            ? "Correta: atende aos requisitos do enunciado e está alinhada ao contexto."
                            : "Incorreta: não contempla o critério principal ou contraria o contexto.",
                        'is_correct'    => $isCorrect,
                        'created_at'    => now(),
                        'updated_at'    => now(),
                    ]);
                }
            }

            $count = DB::table('itens')->where('curso_id', $cursoId)->count();
            DB::table('cursos')->where('id', $cursoId)->update([
                'itens_count' => $count,
                'updated_at' => now(),
            ]);
        });
    }
}
