<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('conhecimentos', function (Blueprint $table) {
            $table->uuid('id')->primary();

            $table->foreignUuid('matriz_id')
                  ->constrained('matrizes')
                  ->cascadeOnDelete();

            $table->integer('codigo');

            $table->string('nome');
            $table->text('descricao')->nullable();
            $table->timestamps();

            $table->unique(['matriz_id', 'codigo']);
            $table->index('matriz_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('conhecimentos');
    }
};
