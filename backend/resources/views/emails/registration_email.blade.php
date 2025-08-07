<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>Faça seu Cadastro</title>
    <style>
        /* Estilos de reset e compatibilidade */
        body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
        table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
        img { -ms-interpolation-mode: bicubic; }
        
        /* Estilos do corpo */
        body { margin: 0; padding: 0; background-color: #f8f9fa; font-family: Arial, sans-serif; }
        
        /* Container principal */
        .container {
            max-width: 600px;
            background-color: #ffffff;
            border-radius: 12px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        }

        /* Estilos para o botão */
        .button {
            display: inline-block;
            background-color: #007bff; /* Azul primário */
            color: #ffffff;
            font-size: 16px;
            font-weight: bold;
            padding: 14px 28px;
            text-decoration: none;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            transition: background-color 0.3s;
        }
        .button:hover {
            background-color: #0056b3;
        }

        /* Estilos de link alternativo */
        .alt-link {
            color: #6c757d;
            font-size: 14px;
            text-decoration: none;
            word-break: break-all;
        }

        /* Responsividade */
        @media only screen and (max-width: 600px) {
            .container { width: 100% !important; padding: 10px !important; }
            .button { padding: 12px 24px !important; font-size: 15px !important; }
            .content-text { font-size: 15px !important; line-height: 22px !important; }
            .footer-text { font-size: 11px !important; }
        }
    </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f8f9fa;">

    <center style="width: 100%; padding: 20px 0;">
        <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);" class="container">
            <tr>
                <td align="center" style="padding: 40px 20px 20px 20px;">
                    <img src="http://localhost:8080/logo.ico" alt="Technology Solutions" width="150" style="display: block; border: 0; max-width: 100%;">
                </td>
            </tr>
            <tr>
                <td align="center" style="padding: 20px 20px 0 20px;">
                    <h1 style="color: #343a40; font-size: 26px; font-weight: bold; margin: 0;">Bem-vindo(a)!</h1>
                </td>
            </tr>
            <tr>
                <td align="left" style="padding: 20px 40px 10px 40px; color: #495057; font-size: 16px; line-height: 24px;" class="content-text">
                    <p style="margin: 0;">Olá, colaborador(a),</p>
                    <p style="margin: 20px 0 0 0;">Estamos muito felizes em ter você conosco. Para fazer seu cadastro, por favor, clique no botão abaixo.</p>
                </td>
            </tr>
            <tr>
                <td align="center" style="padding: 30px 20px;">
                    <a href="{{ $confirmationLink }}" class="button">
                        Fazer Cadastro
                    </a>
                </td>
            </tr>
            <tr>
                <td align="left" style="padding: 0 40px 20px 40px; color: #6c757d; font-size: 14px; line-height: 20px;">
                    <p style="margin: 0;">Caso o botão não funcione, você pode usar este link:</p>
                    <p style="margin: 10px 0 0 0;">
                        <a href="{{ $confirmationLink }}" class="alt-link">{{ $confirmationLink }}</a>
                    </p>
                </td>
            </tr>
            <tr>
                <td align="left" style="padding: 0 40px 40px 40px; color: #495057; font-size: 16px; line-height: 24px;" class="content-text">
                    <p style="margin: 0;">Aguardamos você,</p>
                    <p style="margin: 0;">Equipe Technology Solutions</p>
                </td>
            </tr>
            <tr>
                <td align="center" style="padding: 20px; background-color: #f1f3f5; border-bottom-left-radius: 12px; border-bottom-right-radius: 12px;">
                    <p style="margin: 0; font-size: 12px; color: #868e96;" class="footer-text">
                        Você recebeu este e-mail porque se cadastrou em nossa plataforma. <br>
                        Se não foi você, ignore esta mensagem.
                    </p>
                </td>
            </tr>
        </table>
    </center>
</body>
</html>