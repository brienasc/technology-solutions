<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('competencias', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('categoria_id')->constrained('categorias')->cascadeOnDelete();
            $table->string('nome');
            $table->text('descricao')->nullable();
            $table->timestamps();
            $table->unique(['categoria_id','nome']);
            $table->index('categoria_id');
        });
    }
    public function down(): void
    {
        Schema::dropIfExists('competencias');
    }
};
