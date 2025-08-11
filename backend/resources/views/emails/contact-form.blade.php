<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Novo Contato Recebido</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
        }
        .container {
            width: 100%;
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        .header {
            background-color: #007bff;
            color: #ffffff;
            padding: 20px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 24px;
        }
        .content {
            padding: 20px;
            line-height: 1.6;
            color: #333333;
        }
        .details {
            background-color: #f9f9f9;
            border-left: 4px solid #007bff;
            padding: 15px;
            margin: 20px 0;
        }
        .details strong {
            display: inline-block;
            width: 60px;
        }
        .footer {
            background-color: #eeeeee;
            color: #888888;
            text-align: center;
            padding: 15px;
            font-size: 12px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Novo Contato Recebido</h1>
        </div>

        <div class="content">
            <p>Olá,</p>
            <p>Você recebeu uma nova mensagem através do formulário de contato do seu site.</p>
            <p>Os detalhes são:</p>

            <div class="details">
                <p><strong>Nome:</strong> {{ $name }}</p>
                <p><strong>Email:</strong> {{ $email_from }}</p>
            </div>

            <h3>Mensagem:</h3>
            <p>{{ $user_message }}</p>
        </div>

        <div class="footer">
            <p>Este é um e-mail automático. Por favor, responda diretamente para o endereço de e-mail do remetente.</p>
        </div>
    </div>
</body>
</html>