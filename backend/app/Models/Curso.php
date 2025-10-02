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

    protected $fillable = [
        'nome',
        'descricao',
        'status',
    ];

    protected $casts = [
        'id' => 'string',
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
}
