<?php

namespace App\Services;

use Hash;
use App\Enums\PerfilType;
use App\Models\Colab;
use App\Models\Curso;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

class ColabService
{
    public function __construct(
        private ConviteService $conviteService
    ) {
    }

    public function indexFilteredColabs($filters): LengthAwarePaginator
    {
        $query = Colab::query();

        if (isset($filters['email'])) {
            $query->where('email', 'like', '%' . $filters['email'] . '%');
        }

        if (isset($filters['nome'])) {
            $query->where('nome', 'like', '%' . $filters['nome'] . '%');
        }

        if (isset($filters['cpf'])) {
            $query->where('cpf', 'like', '%' . $filters['cpf'] . '%');
        }

        $per_page = $filters['per_page'] ?? 15;

        return $query->paginate($per_page);
    }

    public function getColabById(string $id): ?Colab
    {
        return Colab::find($id);
    }

    public function loginColab(string $cpf, string $senha): array | null
    {
        $user = Colab::where('cpf', $cpf)->first();
        if ($user == null) {
            return null;
        }

        if ($user->password == null) {
            return null;
        }

        if (!Hash::check($senha, $user->password)) {
            return null;
        }

        $perfil = $user->perfil->perfil_id;

        $abilities = [];
        $abilities = match ($perfil) {
            PerfilType::Administrador => ['access:all'],
            PerfilType::Elaborador    => ['access:menu-itens', 'access:menu-criar-item'],
            default                   => [],
        };

        $token = $user->createToken('api-token', $abilities);
        $abilitiesString = implode(',', $token->accessToken->abilities);

        $data = [
            "token" => $token->plainTextToken,
            "abilities" => $abilitiesString,
        ];
        return $data;
    }

    public function updateRoleColab(string $id, Colab $actor, PerfilType $new_profile): ?Colab
    {
        $permissions = [
            PerfilType::Administrador->value => [
                PerfilType::Administrador->value,
                PerfilType::Elaborador->value,
            ],
        ];

        if (
            !isset($permissions[$actor->perfil_id])
            || !in_array($new_profile->value, $permissions[$actor->perfil_id])
        ) {
            return null;
        }

        $user = Colab::find($id);
        if ($user == null) {
            return null;
        }

        $user->perfil_id = $new_profile->value;
        $user->save();

        return $user;
    }

    public function createColab(array $data)
    {
        return DB::transaction(function () use ($data) {
            $convite = $this->conviteService->getConviteById($data['token']);
            if (!$convite) {
                throw new \DomainException('Convite inválido.');
            }

            if (!$this->conviteService->isValid($convite)) {
                throw new \DomainException('Convite expirado.');
            }

            if ($convite->email_colab !== $data['email']) {
                throw new \DomainException('E-mail não corresponde ao convite.');
            }

            $payload = [
                'nome'       => $data['nome'],
                'email'      => $data['email'],
                'password'   => Hash::make($data['password']),
                'cpf'        => $data['cpf'],
                'celular'    => $data['celular'],
                'cep'        => $data['cep'],
                'uf'         => $data['uf'],
                'cidade'     => $data['cidade'],
                'bairro'     => $data['bairro'],
                'logradouro' => $data['logradouro'],
                'numero'     => $data['numero'],
                'perfil_id'  => $convite->perfil_id ?? 1,
            ];

            $colab = Colab::create($payload);

            $colab->cursos()->syncWithoutDetaching($convite->curso_id);

            if (!$this->conviteService->setAsUsed($convite)) {
                throw new \RuntimeException('Falha ao marcar o convite como usado.');
            }

            return $colab;
        });
    }

    // Busca colaborador com seus cursos associados
    public function getColabWithCursos(string $id): ?Colab
    {
        return Colab::with('cursos')->find($id);
    }

    // Associa um curso a um colaborador
    public function addCursoToColab(string $colabId, string $cursoId): bool
    {
        try {
            $colab = Colab::findOrFail($colabId);
            $curso = Curso::findOrFail($cursoId);

            // Verifica se já não está associado
            if ($colab->cursos()->where('curso_id', $cursoId)->exists()) {
                return false; // Já associado
            }

            // Associa o curso
            $colab->cursos()->attach($cursoId);
            
            return true;
        } catch (\Exception $e) {
            Log::error('Erro ao associar curso ao colaborador: ' . $e->getMessage());
            return false;
        }
    }

    // Remove um curso de um colaborador
    public function removeCursoFromColab(string $colabId, string $cursoId): bool
    {
        try {
            $colab = Colab::findOrFail($colabId);
            
            // Remove a associação
            $colab->cursos()->detach($cursoId);
            
            return true;
        } catch (\Exception $e) {
            Log::error('Erro ao remover curso do colaborador: ' . $e->getMessage());
            return false;
        }
    }

    // Atualiza todos os cursos de um colaborador
    public function syncCursosToColab(string $colabId, array $cursoIds): bool
    {
        try {
            $colab = Colab::findOrFail($colabId);
            
            // Sincroniza os cursos (remove os antigos e adiciona os novos)
            $colab->cursos()->sync($cursoIds);
            
            return true;
        } catch (\Exception $e) {
            Log::error('Erro ao sincronizar cursos do colaborador: ' . $e->getMessage());
            return false;
        }
    }

    // Lista colaboradores com seus cursos (para o index)
    public function indexFilteredColabsWithCursos($filters): LengthAwarePaginator
    {
        $query = Colab::with('cursos');

        if (isset($filters['email'])) {
            $query->where('email', 'like', '%' . $filters['email'] . '%');
        }

        if (isset($filters['nome'])) {
            $query->where('nome', 'like', '%' . $filters['nome'] . '%');
        }

        if (isset($filters['cpf'])) {
            $query->where('cpf', 'like', '%' . $filters['cpf'] . '%');
        }

        $per_page = $filters['per_page'] ?? 15;

        return $query->paginate($per_page);
    }
}
