# Education Solutions

Plataforma de elaboração de itens e avaliações educacionais desenvolvida durante a **Residência em TIC**, programa realizado pelo **Easy** (Centro de Pesquisa em Engenharia e Sistemas), em parceria com a **UFAL** (Universidade Federal de Alagoas), **Instituto BRISA**, **Softex**, **SENAI** e o **Governo Federal**.

## 📋 Sobre o Projeto

O Education Solutions é uma aplicação web moderna que permite a criação, gerenciamento e aplicação de avaliações educacionais. A plataforma oferece uma interface intuitiva para educadores criarem itens de avaliação, organizarem cursos e acompanharem o desempenho dos estudantes.

### ✨ Funcionalidades

- 🔐 **Sistema de Autenticação** - Login seguro com validação de CPF
- 👥 **Gestão de Usuários** - Cadastro via convite e controle de acesso
- 📚 **Gerenciamento de Cursos** - Criação e administração de cursos
- 📝 **Elaboração de Itens** - Criação de questões e avaliações
- 🎨 **Múltiplos Temas** - Modo claro, escuro e alto contraste
- ♿ **Acessibilidade** - Interface inclusiva seguindo padrões WCAG
- 📱 **Design Responsivo** - Otimizado para desktop, tablet e mobile

## 🏗️ Arquitetura

### Frontend (Angular)
```
src/
├── app/
│   ├── components/          # Componentes reutilizáveis
│   ├── layouts/            # Estruturas de layout (header, footer, sidebar)
│   ├── pages/              # Páginas da aplicação
│   ├── services/           # Serviços para comunicação com API
│   ├── interfaces/         # Definições TypeScript
│   ├── utils/              # Funções auxiliares e validações
│   ├── app.config.ts       # Configuração global da aplicação
│   ├── app.routes.ts       # Definição das rotas
│   └── styles.css          # Estilos globais
```

### Backend (Laravel)
```
app/
├── Http/
│   ├── Controllers/        # Controladores da API
│   └── Requests/          # Validações de entrada
├── Models/                # Modelos Eloquent ORM
├── Services/              # Lógica de negócio
routes/                    # Definição das rotas da API
database/
├── migrations/            # Estrutura do banco de dados
└── seeders/              # Dados iniciais
```

## 🚀 Tecnologias Utilizadas

### Frontend
- **Angular 17+** - Framework principal
- **TypeScript** - Linguagem de programação
- **SCSS/CSS** - Estilização
- **Angular Material** - Componentes UI
- **RxJS** - Programação reativa

### Backend
- **Laravel 10+** - Framework PHP
- **MySQL** - Banco de dados
- **Eloquent ORM** - Mapeamento objeto-relacional
- **Laravel Sanctum** - Autenticação de API
- **PHPUnit** - Testes unitários

### Infraestrutura
- **Docker** - Containerização
- **Docker Compose** - Orquestração de containers
- **Nginx** - Servidor web
- **Git** - Controle de versão

## 🛠️ Como Executar o Projeto

### Pré-requisitos
- Node.js (v18+)
- PHP (8.1+)
- Composer
- MySQL
- Docker (opcional)

### Instalação Local

#### Backend (Laravel)
```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
php artisan db:seed
php artisan serve
```

#### Frontend (Angular)
```bash
cd frontend
npm install
ng serve
```

### Usando Docker
```bash
docker-compose up -d
```

## 🎯 Funcionalidades por Módulo

### Autenticação
- Login com CPF e senha
- Recuperação de senha
- Validação de convites
- Controle de sessão

### Gestão de Cursos
- Criação e edição de cursos
- Status: Ativo/Inativo
- Listagem e filtros

### Sistema de Convites
- Envio de convites por email
- Validação de tokens
- Controle de expiração
- Status de convites

### Acessibilidade
- Tema de alto contraste
- Navegação por teclado
- Leitores de tela compatíveis
- ARIA labels e roles

## 👥 Equipe de Desenvolvimento

### Residentes
- **Gabriella Maria Nascimento da Silva** - Desenvolvedora Full Stack
- **Higor de Lima Gomes** - Desenvolvedor Backend
- **Jacqueline Maria Barbosa Lima Santos** - Desenvolvedora Frontend
- **Janaine Ferreira dos Santos** - Desenvolvedora Frontend e UI/UX Designer

### Orientação
- **SENAI**

## 🏢 Instituições Parceiras

### BRISA (Sociedade para o Desenvolvimento da Tecnologia da Informação)
Organização responsável pelo programa de Residência em TIC, promovendo a formação de profissionais especializados em tecnologia da informação.

### UFAL (Universidade Federal de Alagoas)
Instituição de ensino superior federal que oferece suporte acadêmico e infraestrutura para o programa.

### Easy
Centro de Pesquisa ligado ao Instituto de Computação da Universidade Federal de Alagoas (UFAL), voltado à Pesquisa, Desenvolvimento e Inovação (PD&I) com sólida atuação em sistemas computacionais com foco em soluções inteligentes.

### Softex
Associação brasileira que promove a indústria de tecnologia da informação e comunicação (TIC) e a inovação no país.