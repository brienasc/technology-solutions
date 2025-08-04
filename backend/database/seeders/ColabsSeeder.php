<?php

namespace Database\Seeders;

use App\Enums\PerfilType;
use DB;
use Hash;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Str;

class ColabsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('colab')->insert([
            [
                'id_colab' => (string) Str::uuid(),
                'name' => 'Administrador',
                'cpf' => '36435240051',
                'email' => 'admin@admin.com',
                'password' => Hash::make('Teste@123'),
                'celular' => '82999999999',
                'cep' => '57000000',
                'estado' => 'AL',
                'cidade' => 'Maceió',
                'bairro' => 'Centro',
                'logradouro' => 'Rua do Admin',
                'numero' => '100',
                'perfil_id' => PerfilType::Administrador,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id_colab' => (string) Str::uuid(),
                'name' => 'Gente e Cultura',
                'cpf' => '69720064064',
                'email' => 'gentecultura@gente.com',
                'password' => Hash::make('Teste@123'),
                'celular' => '82988888888',
                'cep' => '57000001',
                'estado' => 'AL',
                'cidade' => 'Maceió',
                'bairro' => 'Tabuleiro',
                'logradouro' => 'Avenida Gente e Cultura',
                'numero' => '200',
                'perfil_id' => PerfilType::GenteECultura,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id_colab' => (string) Str::uuid(),
                'name' => 'Usuário Colaborador Comum',
                'cpf' => '98475933025',
                'email' => 'colaborador@comum.com',
                'password' => null,
                'celular' => '82977777777',
                'cep' => '57000000',
                'estado' => 'AL',
                'cidade' => 'Maceió',
                'bairro' => 'Ponta Verde',
                'logradouro' => 'Travessa Colaborador',
                'numero' => '300',
                'perfil_id' => PerfilType::ColaboradorComum,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}
