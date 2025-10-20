<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Item extends Model
{
    use HasFactory;
    use HasUuids;

    protected $table = 'itens';
    protected $primaryKey = 'id';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'curso_id',
        'matriz_id',
        'cruzamento_id',
        'comando',
        'contexto',
        'status',
        'dificuldade',
        'code',
    ];

    protected $casts = [
        'id' => 'string',
        'curso_id' => 'string',
        'status' => 'integer',
        'dificuldade' => 'integer',
    ];

    public function curso()
    {
        return $this->belongsTo(Curso::class, 'curso_id', 'id');
    }

    public function matriz()
    {
        return $this->belongsTo(Matriz::class, 'matriz_id', 'id');
    }

    public function alternativas()
    {
        return $this->belongsToMany(
            Alternativa::class,
            'item_alternativas',
            'item_id',
            'alternativa_id'
        )->withTimestamps();
    }
}
