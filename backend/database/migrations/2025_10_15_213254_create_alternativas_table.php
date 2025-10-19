<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('alternativas', function (Blueprint $table) {
            $table->uuid('id')->primary();

            $table->foreignUuid('item_id')
                ->constrained('itens')
                ->cascadeOnDelete();

            $table->smallInteger('ordem');
            $table->text('texto');
            $table->text('justificativa');
            $table->boolean('is_correct')->default(false);

            $table->timestamps();

            $table->unique(['item_id', 'ordem']);
            $table->index(['item_id', 'is_correct']);
        });

        DB::statement("ALTER TABLE alternativas
            ADD CONSTRAINT alternativas_ordem_check
            CHECK (ordem BETWEEN 1 AND 5)");

        DB::statement("
            CREATE UNIQUE INDEX alternativas_one_correct_per_item
            ON alternativas (item_id)
            WHERE is_correct = true
        ");
    }

    public function down(): void
    {
        DB::statement("DROP INDEX IF EXISTS alternativas_one_correct_per_item");
        Schema::dropIfExists('alternativas');
    }
};
