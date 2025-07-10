<?php

namespace App\Services;

use App\Models\Convites;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Collection;

use App\Enums\ConviteStatus;

class ConviteService{
    public function enviarConvite(string $email): Convites{
        $convite = Convites::create([
            "email_colab" => $email,
            'status_code' => ConviteStatus::PENDENTE,
            'expires_at' => Carbon::now()->addDay(),
        ]);

        // Tratar o envio do convite por email

        return $convite;
    }

    public function indexAllConvites(): Collection{
        return Convites::all();
    }
}