<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Address;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ContactFormMail extends Mailable
{
    use Queueable, SerializesModels;

    public $name;
    public $email_from;
    public $user_message;    

    public function __construct(string $name, string $email_from, string $message)
    {
        $this->name = $name;
        $this->email_from = $email_from;
        $this->user_message = $message;
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            from: new Address($this->email_from, $this->name),
            
            replyTo: [
                new Address($this->email_from, $this->name),
            ],
            
            subject: 'Contato de ' . $this->name,
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.contact-form',
            with: [
                'name' => $this->name,
                'email_from' => $this->email_from,
                'message' => $this->user_message,
            ],
        );
    }
    
    public function attachments(): array
    {
        return [];
    }
}