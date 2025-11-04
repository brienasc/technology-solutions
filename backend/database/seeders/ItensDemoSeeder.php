<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

class ItensDemoSeeder extends Seeder
{
    public function run(): void
    {
        // Quantidade maior para garantir itens suficientes
        $qtdItensPorCruzamento = 4; // 4 itens por cruzamento

        foreach (['cursos', 'matrizes', 'matriz_subfuncao_conhecimento'] as $tbl) {
            if (!Schema::hasTable($tbl)) {
                throw new \RuntimeException("A tabela '{$tbl}' não existe. Rode as migrations ou ajuste o seeder.");
            }
        }

        // Buscar curso e matriz específicos (ou usar os existentes)
        $cursoId = DB::table('cursos')->where('nome', 'Engenharia de Computação')->value('id');
        $matrizId = DB::table('matrizes')->where('nome', '2025.1')->value('id');

        if (!$cursoId) {
            $cursoId = DB::table('cursos')->inRandomOrder()->value('id');
        }
        if (!$matrizId) {
            $matrizId = DB::table('matrizes')->inRandomOrder()->value('id');
        }

        if (!$cursoId || !$matrizId) {
            throw new \RuntimeException("É necessário ter ao menos 1 curso e 1 matriz para semear itens.");
        }

        $cruzamentos = DB::table('matriz_subfuncao_conhecimento')
            ->where('matriz_id', $matrizId)
            ->pluck('id');

        if ($cruzamentos->isEmpty()) {
            throw new \RuntimeException("Não há registros em 'matriz_subfuncao_conhecimento' para a matriz selecionada.");
        }

        $totalItensCriados = 0;

        DB::transaction(function () use ($qtdItensPorCruzamento, $cursoId, $matrizId, $cruzamentos, &$totalItensCriados) {
            
            foreach ($cruzamentos as $cruzamentoId) {
                for ($i = 1; $i <= $qtdItensPorCruzamento; $i++) {
                    $itemId = (string) Str::uuid();

                    do {
                        $code = 'ITM-' . strtoupper(Str::random(8));
                    } while (DB::table('itens')->where('code', $code)->exists());

                    //Garantir status 1 ou 2 e distribuição balanceada de dificuldade
                    $status = $this->gerarStatusAproveitavel();
                    $dificuldade = $this->gerarDificuldadeBalanceada($i);

                    DB::table('itens')->insert([
                        'id'             => $itemId,
                        'code'           => $code,
                        'curso_id'       => $cursoId,
                        'matriz_id'      => $matrizId,
                        'cruzamento_id'  => $cruzamentoId,
                        'comando'        => $this->gerarComandoQuestao($dificuldade, $i),
                        'contexto'       => $this->gerarContexto($i),
                        'status'         => $status,
                        'dificuldade'    => $dificuldade,
                        'created_at'     => now(),
                        'updated_at'     => now(),
                    ]);

                    $this->criarAlternativas($itemId, $i);
                    $totalItensCriados++;
                }
            }

            // Atualizar contador no curso
            $count = DB::table('itens')->where('curso_id', $cursoId)->count();
            DB::table('cursos')->where('id', $cursoId)->update([
                'itens_count' => $count,
                'updated_at' => now(),
            ]);
        });

        $this->command->info("✅ {$totalItensCriados} itens criados para a matriz ({$cruzamentos->count()} cruzamentos x {$qtdItensPorCruzamento} itens cada)");
        
        // Mostrar estatísticas
        $this->mostrarEstatisticas($matrizId);
    }

    
    private function gerarStatusAproveitavel(): int
    {
        $random = rand(1, 10);
        // 80% de chance de status aproveitável, 20% de rascunho (0)
        return $random <= 8 ? [1, 2][array_rand([1, 2])] : 0;
    }

    /**
     * 🎯 Distribuição balanceada de dificuldades para garantir itens de todos os níveis
     */
    private function gerarDificuldadeBalanceada(int $indexItem): int
    {
        // Padrão: 1,2,3,4,5,1,2,3,4,5... para garantir distribuição
        $padrao = [1, 2, 3, 4, 5, 1, 2, 3, 2, 4, 3, 5, 1, 3, 2, 4];
        return $padrao[($indexItem - 1) % count($padrao)];
    }

    private function gerarComandoQuestao(int $dificuldade, int $numero): string
    {
        $comandosFaceis = [
            "Qual é o resultado da expressão 5 + 3 * 2?",
            "O que significa a sigla SQL?",
            "Qual linguagem é usada para estilizar páginas web?",
            "O que é uma variável em programação?",
            "Qual comando imprime texto no PHP?",
            "Quantos bits tem um byte?",
            "O que é um algoritmo?",
            "Qual a função do comando SELECT no SQL?"
        ];

        $comandosMedios = [
            "Explique o conceito de herança em POO.",
            "Como funciona o algoritmo de ordenação Bubble Sort?",
            "Qual a diferença entre INNER JOIN e LEFT JOIN?",
            "Descreva o padrão de projeto Singleton.",
            "O que é normalização de banco de dados?",
            "Como funciona o protocolo HTTP?",
            "Qual a diferença entre classe e objeto?",
            "Explique o conceito de polimorfismo."
        ];
        $comandosDificeis = [
            "Implemente uma função que detecte ciclos em um grafo direcionado.",
            "Explique o teorema CAP e suas implicações em sistemas distribuídos.",
            "Otimize a query: SELECT * FROM users WHERE name LIKE '%a%' AND age > 30",
            "Descreva a diferença entre mutex e semáforo em programação concorrente.",
            "Como implementaria um cache distribuído usando consistência eventual?",
            "Analise a complexidade do algoritmo QuickSort no pior caso.",
            "Explique o problema do consenso distribuído e a solução Paxos."
        ];

        if ($dificuldade <= 2) {
            return $comandosFaceis[array_rand($comandosFaceis)] . " [Item #{$numero}]";
        } elseif ($dificuldade == 3) {
            return $comandosMedios[array_rand($comandosMedios)] . " [Item #{$numero}]";
        } else {
            return $comandosDificeis[array_rand($comandosDificeis)] . " [Item #{$numero}]";
        }
    }

    private function gerarContexto(int $numero): ?string
    {
        if ($numero % 3 !== 0) { // Apenas 1/3 dos itens terão contexto
            return null;
        }

        $contextos = [
            "Considere um sistema de gerenciamento de biblioteca onde os livros são emprestados por 15 dias...",
            "Em um aplicativo de e-commerce, para processar pagamentos com cartão de crédito...",
            "Dado um cenário de IoT com sensores coletando dados de temperatura a cada 5 minutos...",
            "Em uma rede social, para recomendar conexões entre usuários com interesses similares...",
            "Num sistema bancário, para transferências entre contas de diferentes bancos..."
        ];

        return $contextos[array_rand($contextos)];
    }

    private function criarAlternativas(string $itemId, int $numeroItem): void
    {
        $correta = random_int(1, 5);
        $letras = ['A', 'B', 'C', 'D', 'E'];

        for ($ordem = 1; $ordem <= 5; $ordem++) {
            $altId = (string) Str::uuid();
            $isCorrect = ($ordem === $correta);

            DB::table('alternativas')->insert([
                'id'            => $altId,
                'item_id'       => $itemId,
                'ordem'         => $ordem,
                'texto'         => $this->gerarTextoAlternativa($letras[$ordem-1], $isCorrect, $numeroItem),
                'justificativa' => $isCorrect
                    ? "Correta: atende aos requisitos do enunciado e está alinhada ao contexto."
                    : "Incorreta: não contempla o critério principal ou contraria o contexto.",
                'is_correct'    => $isCorrect,
                'created_at'    => now(),
                'updated_at'    => now(),
            ]);
        }
    }

    private function gerarTextoAlternativa(string $letra, bool $ehCorreta, int $numeroItem): string
    {
        $respostasCorretas = [
            "Resposta que segue os princípios da lógica de programação",
            "Solução que atende todos os requisitos de desempenho",
            "Abordagem que considera as melhores práticas de segurança",
            "Implementação que otimiza o uso de recursos",
            "Método que garante a consistência dos dados"
        ];

        $respostasIncorretas = [
            "Resposta que ignora condições de contorno importantes",
            "Solução que causa vazamento de memória",
            "Abordagem com complexidade temporal muito alta",
            "Implementação vulnerável a ataques de injeção",
            "Método que não trata exceções adequadamente"
        ];

        if ($ehCorreta) {
            $base = $respostasCorretas[array_rand($respostasCorretas)];
            return "{$letra}) {$base} [CORRETA]";
        } else {
            $base = $respostasIncorretas[array_rand($respostasIncorretas)];
            return "{$letra}) {$base}";
        }
    }

    /**
     * Mostrar estatísticas dos itens criados
     */
    private function mostrarEstatisticas(string $matrizId): void
    {
        $stats = DB::table('itens')
            ->where('matriz_id', $matrizId)
            ->selectRaw('
                COUNT(*) as total,
                COUNT(CASE WHEN status IN (1, 2) THEN 1 END) as aproveitaveis,
                COUNT(CASE WHEN status IN (1, 2) AND dificuldade IN (1, 2) THEN 1 END) as faceis,
                COUNT(CASE WHEN status IN (1, 2) AND dificuldade = 3 THEN 1 END) as medios,
                COUNT(CASE WHEN status IN (1, 2) AND dificuldade IN (4, 5) THEN 1 END) as dificeis
            ')
            ->first();

        $this->command->info("📊 ESTATÍSTICAS DA MATRIZ:");
        $this->command->info("   Total de itens: {$stats->total}");
        $this->command->info("   Itens aproveitáveis (status 1 ou 2): {$stats->aproveitaveis}");
        $this->command->info("   Itens fáceis: {$stats->faceis}");
        $this->command->info("   Itens médios: {$stats->medios}");
        $this->command->info("   Itens difíceis: {$stats->dificeis}");
    }
}