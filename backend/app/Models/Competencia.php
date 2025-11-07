<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Competencia extends Model
{
    use HasFactory;
    use HasUuids;

    public $incrementing = false;
    protected $keyType = 'string';
    protected $fillable = ['categoria_id','nome','descricao'];

    public function categoria()
    {
        return $this->belongsTo(Categoria::class);
    }

    public function matriz()
    {
        return $this->hasOneThrough(Matriz::class, Categoria::class, 'id', 'id', 'categoria_id', 'matriz_id');
    }

    public function conhecimentos()
    {
        return $this->belongsToMany(Conhecimento::class, 'competencia_conhecimento');
    }
}
