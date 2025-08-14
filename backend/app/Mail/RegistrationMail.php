<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class RegistrationMail extends Mailable
{
    use Queueable, SerializesModels;

    /**
     * O nome do usuário.
     * @var string
     */
    public $name;

    /**
     * O link de cadastro único com o token.
     * @var string
     */
    public $confirmationLink;

    /**
     * Cria uma nova instância da mensagem.
     */
    public function __construct(string $name, string $confirmationLink)
    {
        $this->name = $name;
        $this->confirmationLink = $confirmationLink;
    }

    /**
     * Define o assunto do e-mail.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Faça seu Cadastro',
        );
    }

    /**
     * Define o conteúdo do e-mail (template e dados).
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.registration_email',
            with: [
                'name' => $this->name,
                'confirmationLink' => $this->confirmationLink,
            ]
        );
    }

    /**
     * Anexos para a mensagem.
     * @return array
     */
    public function attachments(): array
    {
        return [];
    }
}