<?php

namespace App\Services;

use App\Models\Convites;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Collection;

use App\Enums\ConviteStatus;
use App\Mail\RegistrationMail;
use Exception;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;


class ConviteService{
    public function enviarConvite(string $email): Convites | null{
        $convite_ativo = Convites::where("email_colab", $email)
                                 ->where("status_code", ConviteStatus::PENDENTE)
                                 ->where('expires_at', '>', Carbon::now())
                                 ->first();

        if($convite_ativo){
            return null;
        }

        DB::beginTransaction();
        try {
            $convite = Convites::create([
                "email_colab" => $email,
                'status_code' => ConviteStatus::PENDENTE,
                'expires_at' => Carbon::now()->addDay(),
            ]);

            $frontendUrl = config('app.frontend_url');
            $confirmationLink = "{$frontendUrl}/cadastro/{$convite->id_convite}";

            Mail::to($email)->send(new RegistrationMail('Convidado', confirmationLink: $confirmationLink));

            DB::commit();
            return $convite;
        } catch (Exception $e) {
            DB::rollBack();
            return null;
        }
    }

    
    public function indexAllConvites(): Collection{
        return Convites::all();
    }

    public function getConviteById(string $id): ?Convites{
        return Convites::find($id);
    }
}