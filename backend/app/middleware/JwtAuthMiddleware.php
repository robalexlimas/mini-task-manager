<?php
declare(strict_types=1);

namespace App\Middleware;

use App\Services\JwtService;
use Phalcon\Mvc\Micro;
use Phalcon\Http\Response;

class JwtAuthMiddleware {
    public function __construct(private JwtService $jwt) {}

    public function __invoke(Micro $app): bool {
        $auth = $app->request->getHeader('Authorization') ?? '';
        if (!str_starts_with($auth, 'Bearer ')) {
            return $this->deny($app->response, 401, 'Missing bearer token');
        }

        $token = trim(substr($auth, 7));
        try {
            $userId = $this->jwt->verify($token);
            // Guardar user id en DI para handlers
            $app->getDI()->setShared('currentUserId', fn () => $userId);
            return true;
        } catch (\Throwable) {
            return $this->deny($app->response, 401, 'Invalid token');
        }
    }

    private function deny(Response $res, int $code, string $msg): bool {
        $res->setStatusCode($code);
        $res->setContentType('application/json', 'UTF-8');
        $res->setJsonContent(['error' => $msg]);
        $res->send();
        return false;
    }
}
