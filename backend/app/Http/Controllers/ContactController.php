<?php

namespace App\Http\Controllers;

use App\Http\Responses\ApiResponse;
use App\Mail\ContactFormMail;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Validation\ValidationException;

class ContactController extends Controller
{
    private ApiResponse $apiResponse;

    public function __construct(ApiResponse $apiResponse) {
        $this->apiResponse = $apiResponse;
    }

    public function recv(Request $request): JsonResponse{
        try{
            $validateData = $request->validate([
                'email' => 'required|email|max:255',
                'name' => 'required|max:255',
                'message' => 'required',
            ],
            [
                'required' => 'O campo :attribute é obrigatório.',
                'max'      => 'O :attribute não pode ter mais de :max caracteres.',
                'email'    => 'O e-mail deve ter um formato válido.',
            ]);

            $email_to = "contact@techsolutions.com";
            $email_from = $validateData['email'];
            $name = $validateData['name'];
            $message = $validateData['message'];

            Mail::to($email_to)->send(new ContactFormMail($name, $email_from, $message));

            return $this->apiResponse->success(null, 'Mensagem enviada com sucesso!');
        } catch (ValidationException $e) {
            return $this->apiResponse->badRequest($e->errors(), 'Bad request');
        } catch (Exception $e){
            return $this->apiResponse->badRequest(null, $e->getMessage());
        }
    }
}
