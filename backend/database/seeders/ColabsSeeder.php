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
                'id' => (string) Str::uuid(),
                'nome' => 'Administrador',
                'cpf' => '36435240051',
                'email' => 'admin@admin.com',
                'password' => Hash::make('Teste@123'),
                'celular' => '82999999999',
                'cep' => '57000000',
                'uf' => 'AL',
                'cidade' => 'Maceió',
                'bairro' => 'Centro',
                'logradouro' => 'Rua do Admin',
                'numero' => '100',
                'perfil_id' => PerfilType::Administrador,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => (string) Str::uuid(),
                'nome' => 'Usuario Elaborador de Itens',
                'cpf' => '69720064064',
                'email' => 'elaborador@itens.com',
                'password' => Hash::make('Teste@123'),
                'celular' => '82988888888',
                'cep' => '57000001',
                'uf' => 'AL',
                'cidade' => 'Maceió',
                'bairro' => 'Tabuleiro',
                'logradouro' => 'Avenida Elaborador de Itens',
                'numero' => '200',
                'perfil_id' => PerfilType::Elaborador,
                'created_at' => now(),
                'updated_at' => now(),
            ],

        ]);
    }
}
