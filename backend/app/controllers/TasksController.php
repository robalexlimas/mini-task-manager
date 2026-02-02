<?php
declare(strict_types=1);

namespace App\Controllers;

use Phalcon\Db\Enum as DbEnum;
use Phalcon\Http\Request;
use Phalcon\Http\Response;
use Phalcon\Db\Adapter\AdapterInterface;

class TasksController {
    private const ALLOWED_STATUS = ['pending', 'in_progress', 'done'];

    public function list(Request $request, Response $response, AdapterInterface $db, int $currentUserId): Response {
        $status = $request->getQuery('status', 'string', null);

        // Validar filtro status si viene
        if ($status !== null && $status !== '' && !in_array($status, self::ALLOWED_STATUS, true)) {
            return $this->json($response, 422, ['error' => 'invalid status filter']);
        }

        $rows = $db->fetchAll(
            "SELECT * FROM api.list_tasks(:uid, :status)",
            DbEnum::FETCH_ASSOC,
            [
                'uid' => $currentUserId,
                'status' => ($status === '' ? null : $status),
            ]
        );

        return $this->json($response, 200, ['tasks' => $rows]);
    }

    public function create(Request $request, Response $response, AdapterInterface $db, int $currentUserId): Response {
        $data = $request->getJsonRawBody(true) ?? [];

        $title = trim((string)($data['title'] ?? ''));
        $description = array_key_exists('description', $data) ? ($data['description'] !== null ? (string)$data['description'] : null) : null;
        $status = (string)($data['status'] ?? 'pending');

        if ($title === '') {
            return $this->json($response, 422, ['error' => 'title is required']);
        }
        if (!in_array($status, self::ALLOWED_STATUS, true)) {
            return $this->json($response, 422, ['error' => 'status must be pending, in_progress, or done']);
        }

        try {
            $row = $db->fetchOne(
                "SELECT * FROM api.create_task(:uid, :title, :description, :status)",
                DbEnum::FETCH_ASSOC,
                [
                    'uid' => $currentUserId,
                    'title' => $title,
                    'description' => $description,
                    'status' => $status,
                ]
            );
        } catch (\Throwable $e) {
            error_log("TASK CREATE ERROR: " . $e->getMessage());
            return $this->json($response, 400, ['error' => 'could not create task']);
        }

        return $this->json($response, 201, ['task' => $row]);
    }

    public function update(Request $request, Response $response, AdapterInterface $db, int $currentUserId, int $taskId): Response
    {
        $data = $request->getJsonRawBody(true) ?? [];

        $title = array_key_exists('title', $data) ? trim((string)$data['title'] ) : null;
        $description = array_key_exists('description', $data) ? ($data['description'] !== null ? (string)$data['description'] : null) : null;
        $status = array_key_exists('status', $data) ? (string)$data['status'] : null;

        if ($title !== null && $title === '') {
            return $this->json($response, 422, ['error' => 'title is required']);
        }
        if ($status !== null && !in_array($status, self::ALLOWED_STATUS, true)) {
            return $this->json($response, 422, ['error' => 'status must be pending, in_progress, or done']);
        }

        try {
            $row = $db->fetchOne(
                "SELECT * FROM api.update_task(:uid, :task_id, :title, :description, :status)",
                DbEnum::FETCH_ASSOC,
                [
                    'uid' => $currentUserId,
                    'task_id' => $taskId,
                    'title' => $title,
                    'description' => $description,
                    'status' => $status,
                ]
            );
        } catch (\Throwable $e) {
            $msg = $e->getMessage();
            error_log("TASK UPDATE ERROR: " . $msg);

            if (stripos($msg, 'task not found') !== false) {
                return $this->json($response, 404, ['error' => 'task not found']);
            }

            return $this->json($response, 400, ['error' => 'could not update task']);
        }

        return $this->json($response, 200, ['task' => $row]);
    }

    private function json(Response $res, int $code, array $data): Response
    {
        $res->setStatusCode($code);
        $res->setContentType('application/json', 'UTF-8');
        $res->setJsonContent($data);
        return $res;
    }
}
