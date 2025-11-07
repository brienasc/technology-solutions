<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('colab_curso', function (Blueprint $table) {
            $table->foreignUuid('colab_id')
            ->constrained('colab', 'id')
            ->cascadeOnDelete();

            $table->foreignUuid('curso_id')
            ->constrained('cursos', 'id')
            ->cascadeOnDelete();

            $table->timestamps();

            $table->primary(['colab_id', 'curso_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('colab_curso');
    }
};
;
