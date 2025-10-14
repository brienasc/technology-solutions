<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Funcao extends Model
{
    protected $table = 'funcoes';
    public $incrementing = false;
    protected $keyType = 'string';
    protected $fillable = ['matriz_id','nome','descricao', 'codigo'];

    public function matriz()
    {
        return $this->belongsTo(Matriz::class);
    }
    public function subfuncoes()
    {
        return $this->hasMany(SubFuncao::class);
    }
}
