FROM php:8.4-fpm

RUN apt-get update && apt-get install -y \
  git \
  curl \
  libpng-dev \
  libonig-dev \
  libxml2-dev \
  libzip-dev \
  unzip \
  libpq-dev \
  acl \
  && docker-php-ext-install pdo_pgsql pgsql mbstring xml zip gd iconv \
  && apt-get clean && rm -rf /var/lib/apt/lists/*

WORKDIR /var/www/html

COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

COPY backend/composer.json backend/composer.lock ./

RUN composer install --no-dev --optimize-autoloader --no-scripts --prefer-dist --ignore-platform-reqs

# COPY backend/. .
