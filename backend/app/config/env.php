<?php
declare(strict_types=1);

function env(string $key, mixed $default = null): mixed {
    if (array_key_exists($key, $_ENV)) return $_ENV[$key];
    if (array_key_exists($key, $_SERVER)) return $_SERVER[$key];

    $v = getenv($key);
    if ($v !== false) return $v;

    return $default;
}

function env_required(string $key): string {
    $v = env($key);
    if ($v === null || $v === '') {
        throw new RuntimeException("Missing env var: {$key}");
    }
    return (string) $v;
}

function env_int(string $key, int $default): int {
    return (int) env($key, (string)$default);
}

function env_bool(string $key, bool $default): bool {
    $v = env($key, $default ? 'true' : 'false');
    return filter_var($v, FILTER_VALIDATE_BOOLEAN);
}
