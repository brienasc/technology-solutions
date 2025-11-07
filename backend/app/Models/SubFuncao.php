<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SubFuncao extends Model
{
    use HasFactory;
    use HasUuids;

    protected $table = "subfuncoes";
    public $incrementing = false;
    protected $keyType = 'string';
    protected $fillable = ['funcao_id','nome','descricao'];

    public function funcao()
    {
        return $this->belongsTo(Funcao::class);
    }

    public function conhecimentosPivot()
    {
        return $this->belongsToMany(
            Conhecimento::class,
            'matriz_subfuncao_conhecimento',
            'subfuncao_id',
            'conhecimento_id'
        )
        ->withPivot(['matriz_id', 'competencia_id']);
    }
}
