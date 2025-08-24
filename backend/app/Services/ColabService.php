<?php

namespace App\Services;

use Hash;

use App\Enums\PerfilType;
use App\Models\Colab;
use Illuminate\Pagination\LengthAwarePaginator;

class ColabService{
    public function create(array $data): Colab{
        $data['perfil_id'] = PerfilType::ColaboradorComum;

        $colab = Colab::create($data);

        return $colab;
    }

    public function indexFilteredColabs($filters): LengthAwarePaginator{
        $query = Colab::query();

        if(isset($filtros['email'])){
            $query->where('email', 'like', '%' . $filters['email'] . '%');
        }

        if(isset($filtros['name'])){
            $query->where('name', 'like', '%' . $filters['name'] . '%');
        }

        if(isset($filtros['cpf'])){
            $query->where('cpf', 'like', '%' . $filters['cpf'] . '%');
        }

        $per_page = $filtros['per_page'] ?? 15;

        return $query->paginate($per_page);
    }

    public function getColabById(string $id): ?Colab{
        return Colab::find($id);
    }

    public function loginColab(string $cpf, string $senha): array | null{
        $user = Colab::where('cpf', $cpf)->first();
        if($user == null){
            return null;
        }

        if($user->password == null){
            return null;
        }

        if(!Hash::check($senha, $user->password)){
            return null;
        }

        $token = $user->createToken('api-token', ['access:menu-convidar', 'access:menu-gerencial']);
        $abilitiesString = implode( ',', $token->accessToken->abilities);

        $data = [
            "token" => $token->plainTextToken,
            "abilities" => $abilitiesString,
        ];
        return $data;
    }

    public function updateRoleColab(string $id, ?string $password = null, Colab $actor, PerfilType $new_profile): ?Colab{
        $permissions = [
            PerfilType::Administrador->value => [
                PerfilType::Administrador->value,
                PerfilType::GenteECultura->value,
                PerfilType::ColaboradorComum->value,
            ],
            PerfilType::GenteECultura->value => [
                PerfilType::GenteECultura->value,
                PerfilType::ColaboradorComum->value,
            ],
        ];

        $user = Colab::find($id);
        if($user == null){
            return null;
        }

        if (!isset($permissions[$actor->perfil_id]) ||
            !in_array($new_profile->value, $permissions[$actor->perfil_id]))
        {
            return null;
        }

        if($new_profile->value == PerfilType::ColaboradorComum->value){
            $user->password = null;
        }else if($user->perfil_id == PerfilType::ColaboradorComum->value){
            if($password == null){
                return null;
            }

            $user->password = Hash::make($password);
        }

        $user->perfil_id = $new_profile->value;
        $user->save();

        return $user;
    }
}