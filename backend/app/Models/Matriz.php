<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Matriz extends Model
{
    use HasUuids;
    use HasFactory;

    protected $table = 'matrizes';
    public $incrementing = false;
    protected $keyType = 'string';
    protected $fillable = ['curso_id','nome','versao','vigente_de','vigente_ate'];

    public function curso()
    {
        return $this->belongsTo(Curso::class);
    }

    public function categorias()
    {
        return $this->hasMany(Categoria::class);
    }

    public function funcoes()
    {
        return $this->hasMany(Funcao::class);
    }

    public function conhecimentos()
    {
        return $this->hasMany(Conhecimento::class);
    }
}
