<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Alternativa extends Model
{
    use HasUuids;

    protected $fillable = [
        'item_id',
        'ordem',
        'texto',
        'justificativa',
        'is_correct'
    ];

    protected $casts = [
        'is_correct' => 'boolean',
        'ordem' => 'integer'
    ];

    public function item(): BelongsTo
    {
        return $this->belongsTo(Item::class);
    }
}