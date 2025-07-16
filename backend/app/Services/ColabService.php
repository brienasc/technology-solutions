<?php

namespace App\Services;

use Illuminate\Database\Eloquent\Collection;

use App\Enums\PerfilType;
use App\Models\Colab;


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
}