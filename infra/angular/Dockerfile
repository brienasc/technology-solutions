ARG NODE_VERSION=22.14.0-alpine
ARG NGINX_VERSION=alpine3.21

FROM node:${NODE_VERSION} AS builder

WORKDIR /app

COPY ./frontend/package.json ./frontend/package-lock.json ./

RUN --mount=type=cache,target=/root/.npm npm ci

COPY ./frontend .

# RUN npm run build   