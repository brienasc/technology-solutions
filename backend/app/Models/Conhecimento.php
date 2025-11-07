<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Conhecimento extends Model
{
    use HasFactory;
    use HasUuids;

    protected $fillable = ['matriz_id', 'codigo', 'nome', 'descricao'];

    public function matriz()
    {
        return $this->belongsTo(Matriz::class);
    }

    public function competencias()
    {
        return $this->belongsToMany(Competencia::class, 'competencia_conhecimento');
    }
}
