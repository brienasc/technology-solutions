<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('matriz_subfuncao_conhecimento', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('matriz_id')->constrained('matrizes')->cascadeOnDelete();
            $table->foreignUuid('subfuncao_id')->constrained('subfuncoes')->cascadeOnDelete();
            $table->foreignUuid('competencia_id')->constrained('competencias')->cascadeOnDelete();
            $table->foreignUuid('conhecimento_id')->constrained('conhecimentos')->cascadeOnDelete();

            $table->unique(['matriz_id','subfuncao_id','competencia_id','conhecimento_id'], 'msc_unique');
            $table->index(['matriz_id']);
            $table->index(['subfuncao_id','competencia_id'], 'msc_subfuncao_comp_idx');
        });
    }
    public function down(): void
    {
        Schema::dropIfExists('matriz_subfuncao_conhecimento');
    }
};
