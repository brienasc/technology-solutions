<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Colab extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'colab';

    protected $primaryKey = 'id_colab';

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
        'id_colab' => 'string',
    ];

    public function perfil(){
        return $this->belongsTo(Perfis::class, 'perfil_id', 'perfil_id');
    }
}
