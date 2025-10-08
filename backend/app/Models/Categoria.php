<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Categoria extends Model
{
    public $incrementing = false;
    protected $keyType = 'string';
    protected $fillable = ['matriz_id','nome','descricao'];

    public function matriz()
    {
        return $this->belongsTo(Matriz::class);
    }
    public function competencias()
    {
        return $this->hasMany(Competencia::class);
    }
}
