<?php
declare(strict_types=1);

namespace App\Controllers;

use App\Services\JwtService;
use Phalcon\Db\Enum as DbEnum;
use Phalcon\Http\Request;
use Phalcon\Http\Response;
use Phalcon\Db\Adapter\AdapterInterface;

class AuthController {
    public function register(Request $request, Response $response, AdapterInterface $db, JwtService $jwt): Response {
        $data = $request->getJsonRawBody(true) ?? [];
        $email = strtolower(trim((string)($data['email'] ?? '')));
        $password = (string)($data['password'] ?? '');

        if ($email === '' || $password === '') {
            return $this->json($response, 422, ['error' => 'email and password are required']);
        }

        $hash = password_hash($password, PASSWORD_BCRYPT);

        try {
            $row = $db->fetchOne(
                "SELECT api.create_user(:email, :hash) AS user_id",
                DbEnum::FETCH_ASSOC,
                ['email' => $email, 'hash' => $hash]
            );
        } catch (\Throwable $e) {
            error_log("REGISTER ERROR: " . $e->getMessage());
            $msg = $e->getMessage();

            // Mensajes del SP (email already exists, etc.)
            if (stripos($msg, 'email already exists') !== false) {
                return $this->json($response, 409, ['error' => 'email already registered']);
            }
            return $this->json($response, 400, ['error' => 'could not create user']);
        }

        $userId = (int)($row['user_id'] ?? 0);
        if ($userId <= 0) {
            return $this->json($response, 500, ['error' => 'could not create user']);
        }

        $token = $jwt->createToken($userId);

        return $this->json($response, 201, [
            'token' => $token,
            'user' => ['id' => $userId, 'email' => $email],
        ]);
    }

    public function login(Request $request, Response $response, AdapterInterface $db, JwtService $jwt): Response {
        $data = $request->getJsonRawBody(true) ?? [];
        $email = strtolower(trim((string)($data['email'] ?? '')));
        $password = (string)($data['password'] ?? '');

        if ($email === '' || $password === '') {
            return $this->json($response, 422, ['error' => 'email and password are required']);
        }

        $row = $db->fetchOne(
            "SELECT * FROM api.get_user_auth(:email)",
            DbEnum::FETCH_ASSOC,
            ['email' => $email]
        );

        if (!$row || empty($row['password_hash'])) {
            return $this->json($response, 401, ['error' => 'invalid credentials']);
        }

        if (!password_verify($password, (string)$row['password_hash'])) {
            return $this->json($response, 401, ['error' => 'invalid credentials']);
        }

        $userId = (int)$row['user_id'];
        $token = $jwt->createToken($userId);

        return $this->json($response, 200, [
            'token' => $token,
            'user' => ['id' => $userId, 'email' => (string)$row['email']],
        ]);
    }

    private function json(Response $res, int $code, array $data): Response {
        $res->setStatusCode($code);
        $res->setContentType('application/json', 'UTF-8');
        $res->setJsonContent($data);
        return $res;
    }
}
