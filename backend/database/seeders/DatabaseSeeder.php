<?php

namespace Database\Seeders;

use App\Models\Colab;
use App\Models\Curso;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            PerfisSeeder::class,
            ColabsSeeder::class,
            CursoSeeder::class,
            MatrizDemoSeeder::class,
            ItensAlternativasSeeder::class,
            ItensDemoSeeder::class
        ]);

        $cursoIds = Curso::pluck('id')->all();

        Colab::all()->each(function ($colab) use ($cursoIds) {
            $ids = collect($cursoIds)->shuffle()->take(2)->all();
            $colab->cursos()->syncWithoutDetaching($ids);
        });
    }
}