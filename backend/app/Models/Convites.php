<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use App\Enums\ConviteStatus;

class Convites extends Model
{
    use HasFactory;
    use HasUuids;

    protected $table = 'convites';

    protected $primaryKey = 'id_convite';

    protected $fillable = [
        'email_colab',
        'perfil_id',
        'curso_id',
        'status_code',
        'expires_at',
    ];

    protected $casts = [
        'expires_at' => 'datetime',
        'status_code' => ConviteStatus::class,
    ];
}
