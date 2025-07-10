<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Convites extends Model{
    use HasFactory, HasUuids;

    protected $table = 'convites';

    protected $primaryKey = 'id_convite';

    protected $fillable = [
        'email_colab',
        'status_code',
        'expires_at',
    ];

    protected $casts = [
        'expires_at' => 'datetime',
    ];
}