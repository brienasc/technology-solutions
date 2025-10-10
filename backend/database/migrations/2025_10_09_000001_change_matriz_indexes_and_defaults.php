<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        DB::statement('CREATE EXTENSION IF NOT EXISTS "pgcrypto";');

        $setUuidDefaultIfHasId = function (string $table) {
            if (Schema::hasColumn($table, 'id')) {
                DB::statement("ALTER TABLE {$table} ALTER COLUMN id SET DEFAULT gen_random_uuid();");
            }
        };

        foreach (
            [
                'categorias',
                'competencias',
                'funcoes',
                'subfuncoes',
                'conhecimentos',
                'matrizes',
                'matriz_subfuncao_conhecimento'
            ] as $tbl
        ) {
            $setUuidDefaultIfHasId($tbl);
        }
        $setUuidDefaultIfHasId('matrizes');

        Schema::table('matrizes', function (Blueprint $t) {
            $t->unique(['curso_id','nome','versao'], 'uq_matrizes_curso_nome_versao');
        });

        Schema::table('categorias', function (Blueprint $t) {
            $t->unique(['matriz_id','nome'], 'uq_categorias_matriz_nome');
        });

        Schema::table('competencias', function (Blueprint $t) {
            $t->unique(['categoria_id','nome'], 'uq_competencias_cat_nome');
        });

        Schema::table('funcoes', function (Blueprint $t) {
            $t->unique(['matriz_id','nome'], 'uq_funcoes_matriz_nome');
        });

        Schema::table('subfuncoes', function (Blueprint $t) {
            $t->unique(['funcao_id','nome'], 'uq_subfuncoes_funcao_nome');
        });

        Schema::table('conhecimentos', function (Blueprint $t) {
            $t->unique(['matriz_id','codigo'], 'uq_conhecimentos_matriz_codigo');
        });

        Schema::table('competencia_conhecimento', function (Blueprint $t) {
            $t->unique(['competencia_id','conhecimento_id'], 'uq_cc');
        });

        Schema::table('matriz_subfuncao_conhecimento', function (Blueprint $t) {
            $t->unique(['matriz_id','subfuncao_id','competencia_id','conhecimento_id'], 'uq_msc');
        });
    }

    public function down(): void
    {
        Schema::table('matrizes', fn (Blueprint $t) => $t->dropUnique('uq_matrizes_curso_nome_versao'));
        Schema::table('categorias', fn (Blueprint $t) => $t->dropUnique('uq_categorias_matriz_nome'));
        Schema::table('competencias', fn (Blueprint $t) => $t->dropUnique('uq_competencias_cat_nome'));
        Schema::table('funcoes', fn (Blueprint $t) => $t->dropUnique('uq_funcoes_matriz_nome'));
        Schema::table('subfuncoes', fn (Blueprint $t) => $t->dropUnique('uq_subfuncoes_funcao_nome'));
        Schema::table('conhecimentos', fn (Blueprint $t) => $t->dropUnique('uq_conhecimentos_matriz_codigo'));

        Schema::table('competencia_conhecimento', fn (Blueprint $t) => $t->dropUnique('uq_cc'));
        Schema::table('matriz_subfuncao_conhecimento', fn (Blueprint $t) => $t->dropUnique('uq_msc'));
    }
};
