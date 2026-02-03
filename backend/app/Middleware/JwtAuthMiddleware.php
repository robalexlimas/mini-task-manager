<?php
declare(strict_types=1);

namespace App\Middleware;

use App\Services\JwtService;
use Phalcon\Mvc\Micro;

class JwtAuthMiddleware {
    public function __construct(private JwtService $jwt) {}

    public function __invoke(Micro $app): bool {
        $auth = $app->request->getHeader('Authorization') ?? '';
        if (!str_starts_with($auth, 'Bearer ')) {
            return $this->deny($app, 401, 'Missing bearer token');
        }

        $token = trim(substr($auth, 7));
        try {
            $userId = $this->jwt->verify($token);
            $app->getDI()->setShared('currentUserId', fn () => $userId);
            return true;
        } catch (\Throwable) {
            return $this->deny($app, 401, 'Invalid token');
        }
    }

    private function deny(Micro $app, int $code, string $msg): bool {
        $app->response->setStatusCode($code);
        $app->response->setContentType('application/json', 'UTF-8');
        $app->response->setJsonContent(['error' => $msg]);
        // Importante: retornar false corta la request en Micro
        return false;
    }
}
