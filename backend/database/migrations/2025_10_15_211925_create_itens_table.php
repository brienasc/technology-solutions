<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('itens', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('code', 32)->unique();

            $table->foreignUuid('curso_id')
                ->constrained('cursos')
                ->restrictOnDelete();

            $table->foreignUuid('matriz_id')
                ->constrained('matrizes')
                ->restrictOnDelete();

            $table->foreignUuid('cruzamento_id')
                ->constrained('matriz_subfuncao_conhecimento')
                ->restrictOnDelete();

            $table->text('comando');
            $table->text('contexto')->nullable();

            $table->smallInteger('status')->default(0);
            $table->smallInteger('dificuldade')->default(3);

            $table->timestamps();

            $table->index(['curso_id', 'matriz_id', 'cruzamento_id']);
            $table->index(['status', 'dificuldade']);
        });

        DB::statement("ALTER TABLE itens ADD CONSTRAINT itens_status_check CHECK (status IN (0,1,2))");
        DB::statement("ALTER TABLE itens ADD CONSTRAINT itens_dificuldade_check CHECK (dificuldade BETWEEN 1 AND 5)");
    }

    public function down(): void
    {
        Schema::dropIfExists('itens');
    }
};
