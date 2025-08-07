<?php

namespace App\Services;

use Exception;
use Carbon\Carbon;

use App\Enums\ConviteStatus;
use App\Mail\RegistrationMail;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;

use App\Models\Convites;

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

    
    public function indexFilteredConvites($filtros): LengthAwarePaginator{
        $query = Convites::query();

        if(isset($filtros['email'])){
            $query->where('email_colab', 'like', '%' . $filtros['email'] . '%');
        }

        if(isset($filtros['status'])){
            $query->where('status_code', $filtros['status']);
        }

        $query->latest();

        $per_page = $filtros['per_page'] ?? 15;

        return $query->paginate($per_page);
    }

    public function getConviteById(string $id): ?Convites{
        return Convites::find($id);
    }
}