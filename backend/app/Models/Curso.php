<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Curso extends Model
{
    use HasFactory;
    use HasUuids;

    protected $table = 'cursos';
    protected $primaryKey = 'id';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'nome',
        'descricao',
        'carga_horaria',
        'status',
    ];

    protected $casts = [
        'id' => 'string',
        'status' => 'boolean',
        'carga_horaria' => 'integer',
    ];

    public function colabs()
    {
        return $this->belongsToMany(
            Colab::class,
            'colab_curso',
            'curso_id',
            'colab_id'
        )->withTimestamps();
    }

    public function matrizes()
    {
        return $this->hasMany(Matriz::class, 'curso_id', 'id');
    }

    public function itens()
    {
        return $this->hasMany(Item::class, 'curso_id', 'id');
    }
}
