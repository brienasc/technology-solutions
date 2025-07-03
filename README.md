# Technology Solutions

Repositório para o desenvolvimento da Avaliação Técnica em Angular e Laravel.

## Estrutura

- `/backend`: Laravel (API)
- `/frontend`: Angular (interface)
- `/infra`: Docker
- `/docs`: Documentação



## Arquitetura do Projeto

### Front-end
- **components**: Componentes reutilizáveis e independentes, como botões, modais, inputs, etc.
- **layouts**: Componentes estruturais como headers, footers, sidebars e o layout principal da aplicação.
- **pages**: Páginas principais da aplicação que possuem rotas próprias (ex: `login`, `home`, etc.)
- **services**: Serviços Angular usados para comunicação com APIs, autenticação e regras de negócio.
- **interfaces**: Arquivos TypeScript com definições de tipos e modelos utilizados no sistema.
- **utils**: Funções auxiliares reutilizáveis como formatação de dados, máscaras e validações.
- **app.config.ts**: Arquivo onde são configurados os providers globais e as rotas da aplicação.
- **app.routes.ts**: Declaração das rotas da aplicação usando `Routes[]`.
- **app.ts**: Arquivo principal do projeto que realiza o bootstrap da aplicação Angular (substitui o antigo `AppModule`).
- **app.css**: Estilos globais que afetam toda a aplicação.
- **app.html**: Template principal, geralmente com `<router-outlet />`.


### Back-end
- **app/Http/Controllers/**: Controladores responsáveis por receber e tratar requisições HTTP.
- **app/Http/Requests/**: Classes responsáveis por validações de entrada (formulários, APIs).
- **app/Models/**: Representações das tabelas do banco, usando Eloquent ORM.
- **routes**: Arquivo principal onde são definidas as rotas da API.
- **database/migrations/**: Migrations para criação e manutenção do schema do banco de dados.
- **database/seeders/**: Seeders para popular o banco com dados iniciais.
- **config/**: Configurações da aplicação (app, database, cors, etc).
- **storage/**: Logs, arquivos temporários e cache da aplicação.


## Como rodar (modo local)

### Backend
```bash
cd backend
php artisan serve