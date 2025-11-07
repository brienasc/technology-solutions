<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('competencia_conhecimento', function (Blueprint $table) {
            $table->foreignUuid('competencia_id')
                  ->constrained('competencias')
                  ->cascadeOnDelete();

            $table->foreignUuid('conhecimento_id')
                  ->constrained('conhecimentos')
                  ->cascadeOnDelete();

            $table->primary(['competencia_id', 'conhecimento_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('competencia_conhecimento');
    }
};
