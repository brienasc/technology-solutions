<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Support\Str;

class Item extends Model
{
    use HasUuids;

    protected $table = 'itens';

    protected $fillable = [
        'code',
        'curso_id',
        'matriz_id',
        'cruzamento_id',
        'comando',
        'contexto',
        'status',
        'dificuldade'
    ];

    protected $casts = [
        'status' => 'integer',
        'dificuldade' => 'integer'
    ];

    // Auto-gerar código único
    protected static function boot()
    {
        parent::boot();
        
        static::creating(function ($item) {
            if (empty($item->code)) {
                $item->code = 'ITEM_' . strtoupper(Str::random(8));
            }
        });
    }

    // Relacionamentos
    public function curso(): BelongsTo
    {
        return $this->belongsTo(Curso::class);
    }

    public function matriz(): BelongsTo
    {
        return $this->belongsTo(Matriz::class);
    }

    public function cruzamento(): BelongsTo
    {
        return $this->belongsTo(MatrizSubfuncaoConhecimento::class, 'cruzamento_id');
    }

    public function alternativas(): HasMany
    {
        return $this->hasMany(Alternativa::class)->orderBy('ordem');
    }
}
