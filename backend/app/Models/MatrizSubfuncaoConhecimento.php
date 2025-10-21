<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class MatrizSubfuncaoConhecimento extends Model
{
    use HasUuids;

    protected $table = 'matriz_subfuncao_conhecimento';

    protected $fillable = [
        'matriz_id',
        'subfuncao_id',
        'conhecimento_id'
    ];

    public function matriz(): BelongsTo
    {
        return $this->belongsTo(Matriz::class);
    }

    public function subfuncao(): BelongsTo
    {
        return $this->belongsTo(Subfuncao::class);
    }

    public function conhecimento(): BelongsTo
    {
        return $this->belongsTo(Conhecimento::class);
    }
}