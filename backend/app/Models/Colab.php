<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Laravel\Sanctum\HasApiTokens;

use Illuminate\Foundation\Auth\User as Authenticatable;

class Colab extends Authenticatable
{
    use HasApiTokens, HasFactory, HasUuids;

    protected $table = 'colab';

    protected $primaryKey = 'id';

    protected $fillable = [
        'name',
        'cpf',
        'email',
        'celular',
        'cep',
        'estado',
        'cidade',
        'bairro',
        'logradouro',
        'numero',
        'perfil_id',
    ];

    protected $casts = [
        'id' => 'string',
    ];

    public function perfil(){
        return $this->belongsTo(Perfis::class, 'perfil_id', 'perfil_id');
    }
}
