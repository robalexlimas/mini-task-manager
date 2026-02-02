<?php
declare(strict_types=1);

require_once __DIR__ . '/env.php';

return [
    'app' => [
        'env'   => env('APP_ENV', 'local'),
        'debug' => env_bool('APP_DEBUG', false),
        'url'   => env('APP_URL', 'http://localhost:8000'),
    ],
    'db' => [
        'driver' => env('DB_DRIVER', 'pgsql'),
        'host'   => env('DB_HOST', '127.0.0.1'),
        'port'   => env_int('DB_PORT', 5432),
        'name'   => env_required('DB_NAME'),
        'user'   => env_required('DB_USER'),
        'pass'   => env_required('DB_PASS'),
    ],
    'jwt' => [
        'secret' => env_required('JWT_SECRET'),
        'ttl'    => env_int('JWT_TTL_MINUTES', 60),
    ],
];
