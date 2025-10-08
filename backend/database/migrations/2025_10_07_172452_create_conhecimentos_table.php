<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('conhecimentos', function (Blueprint $table) {
            $table->uuid('id')->primary()->default(DB::raw('gen_random_uuid()'));
            $table->foreignUuid('competencia_id')->constrained('competencias')->cascadeOnDelete();
            $table->string('nome');
            $table->text('descricao')->nullable();
            $table->timestamps();
            $table->unique(['competencia_id','nome']);
            $table->index('competencia_id');
        });
    }
    public function down(): void
    {
        Schema::dropIfExists('conhecimentos');
    }
};
