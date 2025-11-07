<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;

class Avaliacao extends Model
{
    use HasUuids;

    protected $table = 'avaliacoes';

    protected $fillable = [
        'nome',
        'curso_id',
        'matriz_id',
        'quantidade_itens',
        'status',
        'tipo',
        'data_agendada',
        'tempo_duracao',
        'alunos_previstos',
        'alunos_realizados',
        'facil_muito_facil_qtd',
        'media_qtd',
        'dificil_muito_dificil_qtd',
        'facil_muito_facil_percent',
        'media_percent',
        'dificil_muito_dificil_percent',
    ];

    protected $casts = [
        'data_agendada' => 'datetime',
    ];

    protected $appends = ['distribuicao', 'data_criacao'];

    public function curso(): BelongsTo
    {
        return $this->belongsTo(Curso::class, 'curso_id');
    }

    public function matriz(): BelongsTo
    {
        return $this->belongsTo(Matriz::class, 'matriz_id');
    }

    // Relacionamento através da tabela pivot avaliacao_itens
    public function avaliacaoItens(): HasMany
    {
        return $this->hasMany(AvaliacaoItem::class, 'avaliacao_id');
    }

    // Relacionamento muitos-para-muitos com itens através da tabela pivot
    public function itens(): BelongsToMany
    {
        return $this->belongsToMany(Item::class, 'avaliacao_itens', 'avaliacao_id', 'item_id')
                    ->withPivot('ordem')
                    ->withTimestamps()
                    ->orderBy('avaliacao_itens.ordem');
    }

    public function getDistribuicaoAttribute(): array
    {
        return [
            'facil_muito_facil_qtd' => $this->facil_muito_facil_qtd,
            'media_qtd' => $this->media_qtd,
            'dificil_muito_dificil_qtd' => $this->dificil_muito_dificil_qtd,
        ];
    }

    public function getDataCriacaoAttribute(): string
    {
        return $this->created_at->toISOString();
    }
}