<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PerfisSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('perfis')->insert([
            [
                'perfil_name' => 'Administrador',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'perfil_name' => 'Gente e Cultura',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'perfil_name' => 'Colaborador Comum',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}
