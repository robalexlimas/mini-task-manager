<?php
declare(strict_types=1);

require_once dirname(__DIR__) . '/vendor/autoload.php';

use Dotenv\Dotenv;
use Phalcon\Di\FactoryDefault;
use Phalcon\Mvc\Micro;
use Phalcon\Http\Response;

use App\Middleware\ErrorHandler;

$origin = $_SERVER['HTTP_ORIGIN'] ?? '*';
header("Access-Control-Allow-Origin: $origin");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept, Authorization");
header("Access-Control-Allow-Credentials: true");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$root = dirname(__DIR__);

// Load env
if (file_exists($root . '/.env')) {
    Dotenv::createImmutable($root)->safeLoad();
}

// DI
$di = new FactoryDefault();

// Inyectar cabeceras en el servicio de respuesta global
$di->setShared('response', function() use ($origin) {
    $response = new Response();
    $response->setHeader('Access-Control-Allow-Origin', $origin);
    $response->setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    $response->setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    $response->setHeader('Access-Control-Allow-Credentials', 'true');
    return $response;
});

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
