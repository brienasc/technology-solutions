#!/bin/sh

# infra/php/entrypoint.sh

echo "Definindo permissões para storage e bootstrap/cache..."
chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache
chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache
echo "Permissões definidas"

if [ ! -f /var/www/html/.env ]; then
    echo "Copiando .env.example para .env..."
    cp /var/www/html/.env.example /var/www/html/.env
    echo ".env copiado!"
fi

echo "Verificando e gerando APP_KEY..."
php artisan key:generate --ansi --force
echo "APP_KEY verificada/gerada."

echo "Iniciando PHP-FPM..."
exec php-fpm -F