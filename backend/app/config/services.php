<?php
declare(strict_types=1);

use Phalcon\Db\Adapter\Pdo\Postgresql;
use App\Services\JwtService;

/** @var \Phalcon\Di\FactoryDefault $di */

$di->setShared('db', function () use ($di) {
    $config = $di->get('config');

    if (($config['db']['driver'] ?? 'pgsql') !== 'pgsql') {
        throw new RuntimeException('Unsupported DB_DRIVER. Use pgsql.');
    }

    return new Postgresql([
        'host'     => $config['db']['host'],
        'username' => $config['db']['user'],
        'password' => $config['db']['pass'],
        'dbname'   => $config['db']['name'],
        'port'     => $config['db']['port'],
    ]);
});

$di->setShared('jwt', function () use ($di) {
    $config = $di->get('config');
    return new JwtService($config['jwt']['secret'], (int)$config['jwt']['ttl']);
});
