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
        Schema::create('colab', function (Blueprint $table) {
            $table->uuid('id')->primary();

            $table->string('nome')->nullable(false);
            $table->string('cpf', 11)->unique();
            $table->string('email', 50)->unique();
            $table->string('password')->nullable();

            $table->string('celular', 11)->nullable(false);

            $table->string('cep', 8)->nullable(false);
            $table->string('uf', 2)->nullable(false);
            $table->string('cidade', 30)->nullable(false);
            $table->string('bairro', 40)->nullable(false);
            $table->string('logradouro', 100)->nullable(false);
            $table->string('numero', 5)->nullable(false);
            
            $table->bigInteger('perfil_id')->nullable(false);
            $table->foreign('perfil_id')
            ->references('perfil_id')
            ->on('perfis')
            ->onDelete('restrict')
            ->onUpdate('cascade');

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('colab');
    }
};
