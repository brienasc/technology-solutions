<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('categorias', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('matriz_id')->constrained('matrizes')->cascadeOnDelete();
            $table->string('nome');
            $table->text('descricao')->nullable();
            $table->timestamps();
            $table->unique(['matriz_id','nome']);
            $table->index('matriz_id');
        });
    }
    public function down(): void
    {
        Schema::dropIfExists('categorias');
    }
};
