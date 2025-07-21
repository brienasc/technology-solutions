Estrutura do nosso Projeto Angular:

frontend/
└── src/
    └── app/
        ├── app-routing.module.ts       <-- Módulo de rotas principal
        ├── app.component.ts            <-- Componente raiz do aplicativo
        ├── app.component.html
        ├── app.component.css
        │
        ├── pages/                      <-- Pasta para os componentes que representam telas inteiras
        │   ├── landing-page/
        │   │   ├── landing-page.component.ts
        │   │   ├── landing-page.component.html
        │   │   └── landing-page.component.css
        │   │
        │   ├── login/
        │   │   ├── login.component.ts
        │   │   ├── login.component.html
        │   │   └── login.component.css
        │   │
        │   ├── cadastro/
        │   │   ├── cadastro.component.ts
        │   │   ├── cadastro.component.html
        │   │   └── cadastro.component.css
        │   │
        │   ├── convidar-colaboradores/
        │   │   ├── convidar-colaboradores.component.ts
        │   │   ├── convidar-colaboradores.component.html
        │   │   └── convidar-colaboradores.component.css
        │   │
        │   └── menu-gerencial/
        │       ├── menu-gerencial.component.ts
        │       ├── menu-gerencial.component.html
        │       └── menu-gerencial.component.css
        │
        ├── components/                 <-- Pasta para componentes menores e reutilizáveis
        │   ├── tabs-painel/            <-- Componente para as abas na tela de convites
        │   │   ├── tabs-painel.component.ts
        │   │   ├── tabs-painel.component.html
        │   │   └── tabs-painel.component.css
        │   │
        │   ├── modal-detalhes/         <-- Componente de modal reutilizável para detalhes do colaborador
        │   │   ├── modal-detalhes.component.ts
        │   │   ├── modal-detalhes.component.html
        │   │   └── modal-detalhes.component.css
        │   │
        │   ├── lista-convites/         <-- Componente para a listagem de convites (reutilizável)
        │   │   ├── lista-convites.component.ts
        │   │   ├── lista-convites.component.html
        │   │   └── lista-convites.component.css
        │   │
        │   ├── lista-colaboradores/    <-- Componente para a listagem de colaboradores
        │   │   ├── lista-colaboradores.component.ts
        │   │   ├── lista-colaboradores.component.html
        │   │   └── lista-colaboradores.component.css
        │   │
        │   └── shared/                 <-- (Opcional) Para componentes de UI como botões, inputs, etc.
        │       ├── button/
        │       ├── input/
        │       └── ...
        │
        ├── services/                   <-- Pasta para a lógica de negócios e chamadas de API
        │   ├── auth.service.ts
        │   ├── colaboradores.service.ts
        │   └── convites.service.ts
        │
        ├── models/                     <-- Pasta para interfaces e modelos de dados
        │   ├── colaborador.model.ts
        │   └── convite.model.ts
        │
        ├── guards/                     <-- Pasta para "Guards" de rotas (controle de acesso)
        │   └── auth.guard.ts
        │
        └── assets/
            ├── images/


Explicação da Estrutura:
pages/: Esta é a pasta mais importante para o seu caso. Ela contém os componentes que representam as "páginas" navegáveis do seu aplicativo, como a landing-page, login, cadastro, etc. Eles são os componentes que você irá usar diretamente no seu roteamento.

components/: Esta pasta é para componentes menores e reutilizáveis que não são páginas. Por exemplo, a listagem de convites (lista-convites) e a listagem de colaboradores (lista-colaboradores) são componentes que podem ser usados dentro de outras páginas. O modal de detalhes também é um excelente candidato a ser um componente reutilizável.

services/: Aqui você coloca a lógica para se comunicar com a API. Por exemplo, o colaboradores.service.ts seria responsável por fazer a chamada GET para buscar a lista de colaboradores e a chamada POST para convidar um novo. Isso mantém a lógica de negócios separada da interface do usuário.

models/: É uma boa prática ter uma pasta para definir os formatos de dados (interfaces) que você vai usar, como Colaborador e Convite.

app-routing.module.ts: Aqui você vai definir as rotas para as suas páginas. Por exemplo: