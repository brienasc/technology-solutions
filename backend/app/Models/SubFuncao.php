<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SubFuncao extends Model
{
    protected $table = "subfuncoes";
    public $incrementing = false;
    protected $keyType = 'string';
    protected $fillable = ['funcao_id','nome','descricao'];

    public function funcao()
    {
        return $this->belongsTo(Funcao::class);
    }
}
