<?php
declare(strict_types=1);

namespace App\Services;

use Firebase\JWT\JWT;
use Firebase\JWT\Key;

class JwtService {
    public function __construct(
        private string $secret,
        private int $ttlMinutes
    ) {}

    public function createToken(int $userId): string {
        $now = time();
        $payload = [
            'sub' => $userId,
            'iat' => $now,
            'exp' => $now + ($this->ttlMinutes * 60),
        ];
        return JWT::encode($payload, $this->secret, 'HS256');
    }

    public function verify(string $token): int {
        $decoded = JWT::decode($token, new Key($this->secret, 'HS256'));
        return (int) $decoded->sub;
    }
}
