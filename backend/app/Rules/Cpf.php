<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

class Cpf implements ValidationRule
{
    /**
     * Run the validation rule.
     *
     * @param  \Closure(string, ?string=): \Illuminate\Translation\PotentiallyTranslatedString  $fail
     */
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        $cpf = preg_replace('/[^0-9]/is', '', $value);

        if (strlen($cpf) != 11) {
            $fail('O CPF deve conter exatamente 11 dígitos.');
            return;
        }

        if (preg_match('/(\d)\1{10}/', $cpf)) {
            $fail('O CPF possui um formato inválido.');
            return;
        }

        for ($i = 0, $j = 10, $sum = 0; $i < 9; $i++, $j--) {
            $sum += (int)$cpf[$i] * $j;
        }
        $first_digit = (($sum % 11) < 2) ? 0 : 11 - ($sum % 11);

        if ($first_digit != (int)$cpf[9]) {
            $fail('CPF inválido.');
            return;
        }

        for ($i = 0, $j = 11, $sum = 0; $i < 10; $i++, $j--) {
            $sum += (int)$cpf[$i] * $j;
        }
        $second_digit = (($sum % 11) < 2) ? 0 : 11 - ($sum % 11);

        if ($second_digit != (int)$cpf[10]) {
            $fail('CPF inválido.');
            return;
        }
    }
}
