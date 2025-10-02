<?php

namespace Database\Seeders;

use DB;
use Hash;
use Str;
use App\Enums\PerfilType;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class CursoSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('cursos')->insert([
        [
            'id' => (string) Str::uuid(),
            'nome' => 'Administração',
            'descricao' => 'Curso de administração de empresas',
            'status' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ],
        [
            'id' => (string) Str::uuid(),
            'nome' => 'Desenvolvimento Web Full Stack',
            'descricao' => 'Front-end, back-end e banco de dados',
            'status' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ],
        [
            'id' => (string) Str::uuid(),
            'nome' => 'Análise e Desenvolvimento de Sistemas',
            'descricao' => 'Modelagem, programação e bancos de dados',
            'status' => false,
            'created_at' => now(),
            'updated_at' => now(),
        ],
        [
            'id' => (string) Str::uuid(),
            'nome' => 'Ciência da Computação',
            'descricao' => 'Fundamentos teóricos e práticos de computação',
            'status' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ],
        [
            'id' => (string) Str::uuid(),
            'nome' => 'Engenharia de Software',
            'descricao' => 'Processos, qualidade e arquitetura de software',
            'status' => false,
            'created_at' => now(),
            'updated_at' => now(),
        ],
        [
            'id' => (string) Str::uuid(),
            'nome' => 'Tecnologia da Informação',
            'descricao' => 'Infraestrutura, suporte e serviços de TI',
            'status' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ],
        [
            'id' => (string) Str::uuid(),
            'nome' => 'Marketing Digital',
            'descricao' => 'Mídias sociais, SEO e tráfego pago',
            'status' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ],
        [
            'id' => (string) Str::uuid(),
            'nome' => 'Gestão de Projetos',
            'descricao' => 'PMBOK, ágil, métricas e liderança',
            'status' => false,
            'created_at' => now(),
            'updated_at' => now(),
        ],
        [
            'id' => (string) Str::uuid(),
            'nome' => 'Design UX/UI',
            'descricao' => 'Pesquisa, prototipação e usabilidade',
            'status' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ],
        [
            'id' => (string) Str::uuid(),
            'nome' => 'Ciência de Dados',
            'descricao' => 'Estatística, Python e aprendizado de máquina',
            'status' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ],
        [
            'id' => (string) Str::uuid(),
            'nome' => 'Segurança da Informação',
            'descricao' => 'Governança, criptografia e resposta a incidentes',
            'status' => false,
            'created_at' => now(),
            'updated_at' => now(),
        ],
        [
            'id' => (string) Str::uuid(),
            'nome' => 'Redes de Computadores',
            'descricao' => 'TCP/IP, roteamento e serviços de rede',
            'status' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ],
        [
            'id' => (string) Str::uuid(),
            'nome' => 'Computação em Nuvem',
            'descricao' => 'IaaS, PaaS, automação e custos',
            'status' => false,
            'created_at' => now(),
            'updated_at' => now(),
        ],
        [
            'id' => (string) Str::uuid(),
            'nome' => 'DevOps',
            'descricao' => 'CI/CD, containers e observabilidade',
            'status' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ],
        [
            'id' => (string) Str::uuid(),
            'nome' => 'IA & Machine Learning',
            'descricao' => 'Modelos, pipelines e validação',
            'status' => false,
            'created_at' => now(),
            'updated_at' => now(),
        ],
        ]);
    }
}
