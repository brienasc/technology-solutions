<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Conhecimento extends Model
{
    public $incrementing = false;
    protected $keyType = 'string';
    protected $fillable = ['competencia_id','nome','descricao'];

    public function competencia()
    {
        return $this->belongsTo(Competencia::class);
    }
}
