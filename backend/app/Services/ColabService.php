<?php

namespace App\Services;

use Hash;
use App\Enums\PerfilType;
use App\Models\Colab;
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

        if (isset($filtros['email'])) {
            $query->where('email', 'like', '%' . $filters['email'] . '%');
        }

        if (isset($filtros['name'])) {
            $query->where('name', 'like', '%' . $filters['name'] . '%');
        }

        if (isset($filtros['cpf'])) {
            $query->where('cpf', 'like', '%' . $filters['cpf'] . '%');
        }

        $per_page = $filtros['per_page'] ?? 15;

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

        $token = $user->createToken('api-token', ['access:menu-convidar', 'access:menu-gerencial']);
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
                'curso_id'   => $convite->curso_id,
                'perfil_id'  => $convite->perfil_id ?? 1,
            ];

            $colab = Colab::create($payload);

            if (!$this->conviteService->setAsUsed($convite)) {
                throw new \RuntimeException('Falha ao marcar o convite como usado.');
            }

            return $colab;
        });
    }
}
