<?php
declare(strict_types=1);

use App\Controllers\AuthController;

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
