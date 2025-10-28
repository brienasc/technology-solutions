<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class AvaliacaoItem extends Model
{
    use HasUuids;
    
    protected $table = 'avaliacao_itens';
    
    protected $fillable = [
        'avaliacao_id',
        'item_id',
        'ordem',
    ];

    // Relacionamentos
    public function avaliacao()
    {
        return $this->belongsTo(Avaliacao::class);
    }

    public function item()
    {
        return $this->belongsTo(Item::class);
    }
}