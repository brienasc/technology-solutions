<?php

namespace App\Services;

use Hash;
use Illuminate\Database\Eloquent\Collection;

use App\Enums\PerfilType;
use App\Models\Colab;
use Illuminate\Http\JsonResponse;


class ColabService{
    public function create(array $data): Colab{
        $data['perfil_id'] = PerfilType::ColaboradorComum;

        $colab = Colab::create($data);

        return $colab;
    }

    public function indexAllColabs(): Collection{
        return Colab::all();
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
        $abilities = $token->accessToken->abilities;

        $data = [
            "token" => $token->plainTextToken,
            "abilities" => $abilities,
        ];
        return $data;
    }
}