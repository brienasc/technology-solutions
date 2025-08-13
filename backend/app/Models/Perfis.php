<?php

namespace App\Models;

use App\Enums\PerfilType;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Perfis extends Model
{
    use HasFactory;

    protected $table = 'perfis';
    protected $primaryKey = 'perfil_id';

    protected $fillable = [
        'perfil_id',
        'perfil_name',
    ];

    protected $casts = [
        'perfil_id' => PerfilType::class,
    ];
}