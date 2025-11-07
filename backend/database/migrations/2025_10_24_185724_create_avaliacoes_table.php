<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('avaliacoes', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('nome');
            $table->uuid('curso_id');
            $table->uuid('matriz_id');
            $table->integer('quantidade_itens');
            $table->enum('status', ['agendada', 'em_andamento', 'finalizada', 'cancelada'])->default('agendada');
            $table->enum('tipo', ['prova', 'simulado', 'atividade'])->default('prova');
            $table->dateTime('data_agendada')->nullable();
            $table->integer('tempo_duracao')->nullable(); // em minutos
            $table->integer('alunos_previstos')->nullable();
            $table->integer('alunos_realizados')->default(0);
            
            // Distribuição de dificuldade
            $table->integer('facil_muito_facil_qtd');
            $table->integer('media_qtd');
            $table->integer('dificil_muito_dificil_qtd');
            $table->decimal('facil_muito_facil_percent', 5, 2);
            $table->decimal('media_percent', 5, 2);
            $table->decimal('dificil_muito_dificil_percent', 5, 2);
            
            $table->timestamps();
            
            // Foreign keys
            $table->foreign('curso_id')->references('id')->on('cursos')->onDelete('cascade');
            $table->foreign('matriz_id')->references('id')->on('matrizes')->onDelete('cascade');
            
            // Indexes
            $table->index(['curso_id']);
            $table->index(['status']);
            $table->index(['tipo']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('avaliacoes');
    }
};
