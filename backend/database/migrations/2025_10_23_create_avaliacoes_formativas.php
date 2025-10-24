<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('avaliacoes_formativas', function (Blueprint $table) {
            $table->id();
            $table->string('curso');
            $table->string('matriz');
            $table->integer('quantidade_itens');
            $table->json('distribuicao_dificuldade'); // Armazena os percentuais por dificuldade
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('avaliacoes_formativas');
    }
};