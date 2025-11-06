ARG NODE_ARG NODE_VERSION=22.14.0-alpine

FROM node:${NODE_VERSION} AS builder

WORKDIR /app

# 1. Copia arquivos de dependência
COPY ./frontend/package.json ./
COPY ./frontend/package-lock.json ./

# 2. Instala dependências
RUN --mount=type=cache,target=/root/.npm npm ci

# 3. Copia o código fonte (inclui o tsconfig.app.json)
COPY ./frontend .

# 4. Executa o build do Angular
RUN npm run build
# RUN npm run build   