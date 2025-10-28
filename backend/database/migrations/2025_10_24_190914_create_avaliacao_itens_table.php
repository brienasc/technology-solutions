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
        Schema::create('avaliacao_itens', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('avaliacao_id');
            $table->uuid('item_id');
            $table->integer('ordem')->nullable(); // Para ordenar as questões
            $table->timestamps();

            // Foreign keys
            $table->foreign('avaliacao_id')->references('id')->on('avaliacoes')->onDelete('cascade');
            $table->foreign('item_id')->references('id')->on('itens')->onDelete('cascade');
            
            // Evitar duplicatas
            $table->unique(['avaliacao_id', 'item_id']);
            
            // Índices
            $table->index(['avaliacao_id']);
            $table->index(['item_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('avaliacao_itens');
    }
};
