<?php

namespace App\Http\Requests;

use App\Rules\Cpf;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Contracts\Validation\Validator;

use App\Http\Responses\ApiResponse;

class ColabsRequest extends FormRequest
{
    protected $stopOnFirstFailure = true;

    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'nome' => 'required|max:255',
            'email' => '|required|email|max:255|unique:colab,email',
            'cpf' => ['required','digits:11', new Cpf(), 'unique:colab,cpf'],
            'celular' => 'required|digits:11',
            'cep' => 'required|digits:8',
            'uf' => 'required|max:2',
            'cidade' => 'required|max:30',
            'bairro' => 'required|max:40',
            'logradouro' => 'required|max:100',
            'numero' => 'required|max:5',
            'token' => 'requeired'
        ];
    }

    public function messages(): array{
        return [
            'required' => 'O campo :attribute é obrigatório.',
            'max' => 'O campo :attribute deve ter no máximo :max caracteres.',
            'email' => 'O campo :attribute deve ser um e-mail válido.',
            'unique' => 'O :attribute já está cadastrado.',
            'digits' => 'O campo :attribute deve conter apenas :digits digitos.'
        ];
    }

    protected function failedValidation(Validator $validator)
    {
        $apiResponse = new ApiResponse();

        throw new HttpResponseException(
            $apiResponse->badRequest($validator->errors()->all(), 'Erro de validação')
        );
    }
}
