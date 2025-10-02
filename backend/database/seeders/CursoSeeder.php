<?php

namespace Database\Seeders;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
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
                'carga_horaria' => 360,
                'status' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => (string) Str::uuid(),
                'nome' => 'Desenvolvimento Web Full Stack',
                'descricao' => 'Front-end, back-end e banco de dados',
                'carga_horaria' => 420,
                'status' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => (string) Str::uuid(),
                'nome' => 'Análise e Desenvolvimento de Sistemas',
                'descricao' => 'Modelagem, programação e bancos de dados',
                'carga_horaria' => 380,
                'status' => false,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => (string) Str::uuid(),
                'nome' => 'Ciência da Computação',
                'descricao' => 'Fundamentos teóricos e práticos de computação',
                'carga_horaria' => 480,
                'status' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => (string) Str::uuid(),
                'nome' => 'Engenharia de Software',
                'descricao' => 'Processos, qualidade e arquitetura de software',
                'carga_horaria' => 420,
                'status' => false,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => (string) Str::uuid(),
                'nome' => 'Tecnologia da Informação',
                'descricao' => 'Infraestrutura, suporte e serviços de TI',
                'carga_horaria' => 300,
                'status' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => (string) Str::uuid(),
                'nome' => 'Marketing Digital',
                'descricao' => 'Mídias sociais, SEO e tráfego pago',
                'carga_horaria' => 240,
                'status' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => (string) Str::uuid(),
                'nome' => 'Gestão de Projetos',
                'descricao' => 'PMBOK, ágil, métricas e liderança',
                'carga_horaria' => 200,
                'status' => false,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => (string) Str::uuid(),
                'nome' => 'Design UX/UI',
                'descricao' => 'Pesquisa, prototipação e usabilidade',
                'carga_horaria' => 180,
                'status' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => (string) Str::uuid(),
                'nome' => 'Ciência de Dados',
                'descricao' => 'Estatística, Python e aprendizado de máquina',
                'carga_horaria' => 420,
                'status' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => (string) Str::uuid(),
                'nome' => 'Segurança da Informação',
                'descricao' => 'Governança, criptografia e resposta a incidentes',
                'carga_horaria' => 240,
                'status' => false,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => (string) Str::uuid(),
                'nome' => 'Redes de Computadores',
                'descricao' => 'TCP/IP, roteamento e serviços de rede',
                'carga_horaria' => 260,
                'status' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => (string) Str::uuid(),
                'nome' => 'Computação em Nuvem',
                'descricao' => 'IaaS, PaaS, automação e custos',
                'carga_horaria' => 200,
                'status' => false,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => (string) Str::uuid(),
                'nome' => 'DevOps',
                'descricao' => 'CI/CD, containers e observabilidade',
                'carga_horaria' => 220,
                'status' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => (string) Str::uuid(),
                'nome' => 'IA & Machine Learning',
                'descricao' => 'Modelos, pipelines e validação',
                'carga_horaria' => 300,
                'status' => false,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}
