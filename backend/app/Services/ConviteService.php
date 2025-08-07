<?php

namespace App\Services;

use App\Models\Convites;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Collection;

use App\Enums\ConviteStatus;
use App\Mail\RegistrationMail;
use Illuminate\Support\Facades\Mail;


class ConviteService{
    public function enviarConvite(string $email): Convites{
        $convite = Convites::create([
            "email_colab" => $email,
            'status_code' => ConviteStatus::PENDENTE,
            'expires_at' => Carbon::now()->addDay(),
        ]);

        $frontendUrl = config('app.frontend_url');

        $confirmationLink = "{$frontendUrl}/cadastro/{$convite->id_convite}";

        Mail::to($email)->send(new RegistrationMail('Convidado', confirmationLink: $confirmationLink));

        return $convite;
    }

    public function indexAllConvites(): Collection{
        return Convites::all();
    }

    public function getConviteById(string $id): ?Convites{
        return Convites::find($id);
    }
}