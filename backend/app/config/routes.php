<?php
declare(strict_types=1);

/** @var \Phalcon\Mvc\Micro $app */
$di = $app->getDI();

$app->get('/api/health', function () use ($di) {
    $res = $di->get('response');
    $res->setContentType('application/json', 'UTF-8');
    $res->setJsonContent(['ok' => true, 'env' => $di->get('config')['app']['env']]);
    return $res;
});
