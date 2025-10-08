<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('subfuncoes', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('funcao_id')->constrained('funcoes')->cascadeOnDelete();
            $table->string('nome');
            $table->text('descricao')->nullable();
            $table->timestamps();
            $table->unique(['funcao_id','nome']);
            $table->index('funcao_id');
        });
    }
    public function down(): void
    {
        Schema::dropIfExists('subfuncoes');
    }
};
