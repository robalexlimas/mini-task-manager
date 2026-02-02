FROM php:8.4-cli

RUN apt-get update && apt-get install -y --no-install-recommends \
  git unzip curl \
  autoconf build-essential pkg-config re2c \
  libpq-dev \
  && rm -rf /var/lib/apt/lists/*

RUN docker-php-ext-install pdo_pgsql

# Workaround: evitar que ciertos warnings se traten como error al compilar Phalcon
ENV CFLAGS="-Wno-error=incompatible-pointer-types"

# Instalar Phalcon (extensión PHP)
RUN pecl channel-update pecl.php.net \
  && pecl install phalcon-5.9.2 \
  && docker-php-ext-enable phalcon

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/backend

COPY backend/composer.json backend/composer.lock ./
RUN composer install --no-interaction --prefer-dist

COPY backend/ ./

EXPOSE 8000
CMD ["php", "-S", "0.0.0.0:8000", "-t", "public"]
