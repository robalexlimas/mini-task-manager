<?php
declare(strict_types=1);

use App\Controllers\AuthController;
use App\Controllers\TasksController;
use App\Middleware\JwtAuthMiddleware;

/** @var \Phalcon\Mvc\Micro $app */
$di = $app->getDI();

// Health
$app->get('/api/health', function () use ($di) {
    $res = $di->get('response');
    $res->setContentType('application/json', 'UTF-8');
    $res->setJsonContent(['ok' => true, 'env' => $di->get('config')['app']['env']]);
    return $res;
});

// Auth
$app->post('/api/register', function () use ($di) {
    $c = new AuthController();
    return $c->register($di->get('request'), $di->get('response'), $di->get('db'), $di->get('jwt'));
});

$app->post('/api/login', function () use ($di) {
    $c = new AuthController();
    return $c->login($di->get('request'), $di->get('response'), $di->get('db'), $di->get('jwt'));
});

// Middleware global: protege solo /api/tasks*
$auth = new JwtAuthMiddleware($di->get('jwt'));

$app->before(function () use ($app, $auth) {
    $path = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?? '/';

    if (str_starts_with($path, '/api/tasks')) {
        // Si retorna false, Micro debe cortar
        return $auth($app);
    }

    return true;
});

// Asegura que, si middleware llenó response (401), se devuelva consistentemente
$app->after(function () use ($app) {
    return $app->response;
});

// Helper local para obtener user id o responder 401
$getUidOr401 = function () use ($di) {
    if (!$di->has('currentUserId')) {
        $res = $di->get('response');
        $res->setStatusCode(401);
        $res->setContentType('application/json', 'UTF-8');
        $res->setJsonContent(['error' => 'Unauthorized']);
        return [$res, null];
    }
    return [null, (int)$di->get('currentUserId')];
};

// Tasks
$app->get('/api/tasks', function () use ($di, $getUidOr401) {
    [$res401, $uid] = $getUidOr401();
    if ($res401) return $res401;

    $c = new TasksController();
    return $c->list($di->get('request'), $di->get('response'), $di->get('db'), $uid);
});

$app->post('/api/tasks', function () use ($di, $getUidOr401) {
    [$res401, $uid] = $getUidOr401();
    if ($res401) return $res401;

    $c = new TasksController();
    return $c->create($di->get('request'), $di->get('response'), $di->get('db'), $uid);
});

$app->put('/api/tasks/{id:[0-9]+}', function ($id) use ($di, $getUidOr401) {
    [$res401, $uid] = $getUidOr401();
    if ($res401) return $res401;

    $c = new TasksController();
    return $c->update($di->get('request'), $di->get('response'), $di->get('db'), $uid, (int)$id);
});
