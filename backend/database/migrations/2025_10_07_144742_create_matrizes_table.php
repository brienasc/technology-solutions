<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('matrizes', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('curso_id')->constrained('cursos')->cascadeOnDelete();
            $table->string('nome');
            $table->string('versao')->nullable();
            $table->date('vigente_de')->nullable();
            $table->date('vigente_ate')->nullable();
            $table->timestamps();
            $table->unique(['curso_id','nome','versao']);
        });
    }
    public function down(): void
    {
        Schema::dropIfExists('matrizes');
    }
};
