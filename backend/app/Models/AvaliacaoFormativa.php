<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AvaliacaoFormativa extends Model
{
    protected $table = 'avaliacoes_formativas';

    protected $fillable = [
        'curso',
        'matriz',
        'quantidade_itens',
        'distribuicao_dificuldade'
    ];

    protected $casts = [
        'distribuicao_dificuldade' => 'array'
    ];
}
