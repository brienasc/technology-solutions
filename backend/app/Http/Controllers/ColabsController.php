<?php

namespace App\Http\Controllers;

use App\Enums\PerfilType;
use App\Models\Colab;
use App\Models\Curso;
use App\Rules\Cpf;
use Illuminate\Validation\ValidationException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use App\Http\Responses\ApiResponse;
use App\Http\Requests\ColabsRequest;
use App\Services\ColabService;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;
use Exception;
use Str;

class ColabsController extends Controller
{
    protected ApiResponse $apiResponse;
    protected ColabService $colabService;

    public function __construct(ApiResponse $apiResponse, ColabService $colabService)
    {
        $this->apiResponse = $apiResponse;
        $this->colabService = $colabService;
    }

    public function store(ColabsRequest $request): JsonResponse
    {
        try {
            $validated = $request->validated();

            $colab = $this->colabService->createColab($validated);
            if ($colab == null) {
                return $this->apiResponse->badRequest(null, 'Falha ao cadastrar usuário');
            }

            return $this->apiResponse->success(null, 'Usuário cadastrado com sucesso.');
        } catch (Exception $e) {
            return $this->apiResponse->error($e->getMessage(), 'Erro ao criar usuário.');
        }
    }

    public function index(Request $request): JsonResponse
    {
        try {
            $filters = $request->only(['email', 'nome', 'cpf', 'page', 'per_page']);

            $colabsPaginate = $this->colabService->indexFilteredColabsWithCursos($filters);

            // Mapear os dados para incluir cursos
            $colabsCollection = $colabsPaginate->getCollection()->map(function ($colab) {
                $enum = PerfilType::from($colab['perfil_id']);

                return [
                    'id' => $colab->id,
                    'nome' => $colab->nome,
                    'email' => $colab->email,
                    'cpf' => $colab->cpf,
                    'celular' => $colab->celular,
                    'cep' => $colab->cep,
                    'uf' => $colab->uf,
                    'cidade' => $colab->cidade,
                    'bairro' => $colab->bairro,
                    'logradouro' => $colab->logradouro,
                    'numero' => $colab->numero,
                    'perfil_id' => $colab->perfil_id,
                    'perfil_name' => $enum->label(),
                    'cursos' => $colab->cursos->map(function ($curso) {
                        return [
                            'id' => $curso->id,
                            'nome' => $curso->nome,
                            'status' => $curso->status
                        ];
                    })
                ];
            });

            $responseData = [
                'colabs' => $colabsCollection,
                'current_page' => $colabsPaginate->currentPage(),
                'per_page' => $colabsPaginate->perPage(),
                'total' => $colabsPaginate->total(),
                'last_page' => $colabsPaginate->lastPage(),
            ];

            return $this->apiResponse->success($responseData, 'Lista de colaboradores retornada com sucesso.');
        } catch (Exception $e) {
            return $this->apiResponse->badRequest(null, 'Erro ao buscar colaboradores.');
        }
    }

    // Buscar cursos de um colaborador específico
    public function getCursos(string $id): JsonResponse
    {
        try {
            if (!Str::isUuid($id)) {
                return $this->apiResponse->badRequest(null, 'O ID do colaborador fornecido é inválido.');
            }

            $colab = $this->colabService->getColabWithCursos($id);

            if ($colab == null) {
                return $this->apiResponse->badRequest(null, 'Colaborador não encontrado');
            }

            $cursosData = $colab->cursos->map(function ($curso) {
                return [
                    'id' => $curso->id,
                    'nome' => $curso->nome,
                    'status' => $curso->status,
                    'descricao' => $curso->descricao,
                    'carga_horaria' => $curso->carga_horaria
                ];
            });

            return $this->apiResponse->success($cursosData, 'Cursos do colaborador retornados com sucesso.');
        } catch (Exception $e) {
            return $this->apiResponse->badRequest(null, 'Erro ao buscar cursos do colaborador');
        }
    }

    // Associar curso a um colaborador
    public function addCurso(Request $request, string $id): JsonResponse
    {
        try {
            $validateData = $request->validate([
                'curso_id' => ['required', 'string', 'exists:cursos,id'],
            ]);

            if (!Str::isUuid($id)) {
                return $this->apiResponse->badRequest(null, 'O ID do colaborador fornecido é inválido.');
            }

            $success = $this->colabService->addCursoToColab($id, $validateData['curso_id']);

            if (!$success) {
                return $this->apiResponse->badRequest(null, 'Erro ao associar curso. Possivelmente já está associado.');
            }

            return $this->apiResponse->success(null, 'Curso associado com sucesso.');
        } catch (ValidationException $e) {
            return $this->apiResponse->badRequest($e->errors(), 'Dados inválidos');
        } catch (Exception $e) {
            return $this->apiResponse->badRequest(null, 'Erro ao associar curso ao colaborador');
        }
    }

    // Remover curso de um colaborador
    public function removeCurso(string $id, string $cursoId): JsonResponse
    {
        try {
            if (!Str::isUuid($id) || !Str::isUuid($cursoId)) {
                return $this->apiResponse->badRequest(null, 'IDs fornecidos são inválidos.');
            }

            $success = $this->colabService->removeCursoFromColab($id, $cursoId);

            if (!$success) {
                return $this->apiResponse->badRequest(null, 'Erro ao remover curso.');
            }

            return $this->apiResponse->success(null, 'Curso removido com sucesso.');
        } catch (Exception $e) {
            return $this->apiResponse->badRequest(null, 'Erro ao remover curso do colaborador');
        }
    }

    // Sincronizar todos os cursos de um colaborador
    public function syncCursos(Request $request, string $id): JsonResponse
    {
        try {
            $validateData = $request->validate([
                'curso_ids' => ['required', 'array'],
                'curso_ids.*' => ['string', 'exists:cursos,id'],
            ]);

            if (!Str::isUuid($id)) {
                return $this->apiResponse->badRequest(null, 'O ID do colaborador fornecido é inválido.');
            }

            $success = $this->colabService->syncCursosToColab($id, $validateData['curso_ids']);

            if (!$success) {
                return $this->apiResponse->badRequest(null, 'Erro ao sincronizar cursos.');
            }

            return $this->apiResponse->success(null, 'Cursos sincronizados com sucesso.');
        } catch (ValidationException $e) {
            return $this->apiResponse->badRequest($e->errors(), 'Dados inválidos');
        } catch (Exception $e) {
            return $this->apiResponse->badRequest(null, 'Erro ao sincronizar cursos do colaborador');
        }
    }

    public function show($id)
    {
        try {
            if (!Str::isUuid($id)) {
                return $this->apiResponse->badRequest(null, 'O ID do colaborador fornecido é inválido.');
            }

            $colab = $this->colabService->getColabById($id);

            if ($colab == null) {
                return $this->apiResponse->badRequest(null, 'Colaborador não encontrado');
            }

            return $this->apiResponse->success($colab, 'Colaborador retornado com sucesso.');
        } catch (Exception $e) {
            return $this->apiResponse->badRequest(null, 'Erro ao buscar colaborador');
        }
    }

    public function login(Request $request): JsonResponse
    {
        try {
            $validateData = $request->validate(
                [
                    'cpf' => ['required', 'digits:11', new Cpf()],
                    'password' => ['required', 'min:8'],
                ],
                [
                    'required' => 'O :attribute é obrigatório',
                    'digits' => 'O campo :attribute deve conter apenas :digits digitos.',
                    'min' => 'O campo :attribute deve ter no mínimo :min caracteres.',
                ]
            );

            $dataResponse = $this->colabService->loginColab($validateData['cpf'], $validateData['password']);
            if ($dataResponse == null) {
                return $this->apiResponse->badRequest(null, 'Usuario ou senha inválido!');
            }

            return $this->apiResponse->success($dataResponse, 'Login com sucesso');
        } catch (ValidationException $e) {
            return $this->apiResponse->badRequest($e->errors(), 'Bad request');
        } catch (Exception $e) {
            return $this->apiResponse->badRequest($e->getMessage(), 'Bad request');
        }
    }

    public function export(Request $request)
    {
        try {
            set_time_limit(300);

            Log::info('🚀 Export iniciado');
            Log::info('📦 Parâmetros recebidos: ' . json_encode($request->all()));

            // Iniciar query
            $query = Colab::query();

            // APLICAR FILTRO DE PESQUISA se fornecido
            if ($request->has('search') && !empty($request->search)) {
                $searchTerm = $request->search;
                Log::info("🔍 Aplicando filtro de pesquisa: '{$searchTerm}'");

                $query->where(
                    function ($q) use ($searchTerm) {
                        $q->where('nome', 'LIKE', "%{$searchTerm}%")
                            ->orWhere('email', 'LIKE', "%{$searchTerm}%")
                            ->orWhere('cpf', 'LIKE', "%{$searchTerm}%")
                            ->orWhere('celular', 'LIKE', "%{$searchTerm}%");
                    }
                );
            } else {
                Log::info('📋 Nenhum filtro aplicado - exportando todos');
            }

            // Buscar colaboradores
            $colaboradores = $query->get();

            Log::info("📊 Colaboradores encontrados: {$colaboradores->count()}");

            if ($colaboradores->isEmpty()) {
                Log::warning('⚠️ Nenhum colaborador encontrado com os filtros aplicados');

                // Retornar arquivo vazio com mensagem
                $csvContent = "Nome,Email,CPF,Celular,Perfil\n";
                $csvContent .= "Nenhum colaborador encontrado com os filtros aplicados,,,,\n";

                return response(
                    $csvContent,
                    200,
                    [
                    'Content-Type' => 'text/csv; charset=UTF-8',
                    'Content-Disposition' => 'attachment; filename="colaboradores_filtrado.csv"'
                    ]
                );
            }

            // Preparar CSV
            $csvData = [];
            $csvData[] = ['Nome', 'Email', 'CPF', 'Celular', 'Perfil', 'CEP', 'Estado', 'Cidade', 'Bairro', 'Endereço'];

            foreach ($colaboradores as $colab) {
                $endereco = ($colab->logradouro ?? '') . ($colab->numero ? ", {$colab->numero}" : '');

                $csvData[] = [
                    $colab->nome ?? '',
                    $colab->email ?? '',
                    $colab->cpf ?? '',
                    $colab->celular ?? '',
                    $this->mapearPerfil($colab->perfil_id ?? 0),
                    $colab->cep ?? '',
                    $colab->uf ?? '',
                    $colab->cidade ?? '',
                    $colab->bairro ?? '',
                    $endereco
                ];
            }

            // Gerar CSV
            $csvContent = "\xEF\xBB\xBF"; // BOM para UTF-8
            foreach ($csvData as $row) {
                $csvContent .= implode(';', $row) . "\n";
            }

            Log::info('✅ CSV gerado com sucesso');

            // Nome do arquivo indica se teve filtro
            $filename = 'colaboradores_' . date('Y-m-d_H-i-s');
            if ($request->has('search') && !empty($request->search)) {
                $filename .= '_filtrado';
            }
            $filename .= '.csv';

            return response(
                $csvContent,
                200,
                [
                'Content-Type' => 'text/csv; charset=UTF-8',
                'Content-Disposition' => "attachment; filename=\"{$filename}\""
                ]
            );
        } catch (\Exception $e) {
            Log::error('❌ Erro: ' . $e->getMessage());
            return $this->responseError(
                [
                'success' => false,
                'message' => 'Erro ao exportar',
                'error' => $e->getMessage()
                ],
                500
            );
        }
    }

    private function mapearPerfil($perfilId)
    {
        $perfis = [
            1 => 'Administrador',
            2 => 'Elaborador de Itens',
        ];

        return $perfis[$perfilId] ?? "Perfil {$perfilId}";
    }

    public function update(Request $request, $id): JsonResponse
    {
        try {
            $validateData = $request->validate(
                [
                    'perfil' => ['required', 'integer', Rule::in(array_column(PerfilType::cases(), 'value'))],
                ],
                [
                    'required' => 'O :attribute é obrigatório',
                    'password.mixed' => 'A senha deve conter letras maiúsculas e minúsculas.',
                    'password.numbers' => 'A senha deve conter pelo menos um número.',
                    'password.symbols' => 'A senha deve conter pelo menos um caractere especial.',
                    'min' => 'O campo :attribute deve ter no mínimo :min caracteres.',
                ]
            );

            $new_perfil = PerfilType::from($validateData['perfil']);
            $actor = $request->user();

            $user = $this->colabService->updateRoleColab(
                $id,
                $actor,
                $new_perfil
            );

            if ($user == null) {
                return $this->apiResponse->badRequest(
                    null,
                    "Falha ao atualizar usuário"
                );
            }

            return $this->apiResponse->success($user, 'Usuario atualizado!');
        } catch (ValidationException $e) {
            return $this->apiResponse->badRequest($e->errors(), 'Bad request');
        } catch (Exception $e) {
            return $this->apiResponse->badRequest(null, 'Bad request');
        }
    }
}
