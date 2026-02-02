<?php
declare(strict_types=1);

require_once dirname(__DIR__) . '/vendor/autoload.php';

use Dotenv\Dotenv;
use Phalcon\Di\FactoryDefault;
use Phalcon\Mvc\Micro;
use Phalcon\Http\Response;

use App\Middleware\ErrorHandler;

$root = dirname(__DIR__);

// Load env
if (file_exists($root . '/.env')) {
    Dotenv::createImmutable($root)->safeLoad();
}

// DI
$di = new FactoryDefault();

// Config
$config = require $root . '/app/config/config.php';
$di->setShared('config', fn () => $config);

$debug = (bool)($config['app']['debug'] ?? false);

ErrorHandler::register(
    fn () => $di->get('response'),
    $debug
);

// Services
require $root . '/app/config/services.php';

// App
$app = new Micro($di);

function json(Response $res, int $code, array $data): Response {
    $res->setStatusCode($code);
    $res->setContentType('application/json', 'UTF-8');
    $res->setJsonContent($data);
    return $res;
}

// Routes
require $root . '/app/config/routes.php';

// 404
$app->notFound(function () use ($app) {
    return json($app->response, 404, ['error' => 'Not found']);
});

$app->handle($_SERVER['REQUEST_URI']);
