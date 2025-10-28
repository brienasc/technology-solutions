#!/usr/bin/env sh
set -e

export COMPOSER_ALLOW_SUPERUSER=1
cd /var/www/html

if [ ! -f .env ] && [ -f .env.example ]; then
  cp .env.example .env
fi

if [ ! -f vendor/autoload.php ] || [ composer.lock -nt vendor/autoload.php ]; then
  echo "Instalando dependências com Composer..."
  composer install --no-interaction --prefer-dist --no-progress
fi


php artisan key:generate --ansi --force || true

mkdir -p storage bootstrap/cache

# Permissões (ver seção 2 para explicação do HOST_UID/HOST_GID)
=======

php artisan key:generate --ansi --force || true

mkdir -p storage bootstrap/cache


if [ -n "${HOST_UID}" ] && [ -n "${HOST_GID}" ]; then
  addgroup --gid "${HOST_GID}" hostgroup 2>/dev/null || true
  adduser --uid "${HOST_UID}" --gid "${HOST_GID}" --disabled-password --gecos "" hostuser 2>/dev/null || true
  chown -R hostuser:hostgroup storage bootstrap/cache
  chown -R hostuser:hostgroup vendor || true
  chmod -R 775 storage bootstrap/cache
  chmod -R g+s storage bootstrap/cache
  command -v setfacl >/dev/null 2>&1 &&
    setfacl -R -m u:www-data:rwx -m u:hostuser:rwx storage bootstrap/cache &&
    setfacl -R -d -m u:www-data:rwx -m u:hostuser:rwx storage bootstrap/cache || true
else
  chown -R www-data:www-data storage bootstrap/cache
  chmod -R 775 storage bootstrap/cache
  chmod -R g+s storage bootstrap/cache
fi

php artisan config:clear || true
php artisan cache:clear || true
php artisan view:clear || true


exec php-fpm -F



exec php-fpm -F

