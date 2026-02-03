<?php
declare(strict_types=1);

namespace App\Middleware;

use Phalcon\Http\Response;
use Throwable;

final class ErrorHandler
{
    /**
     * Registra handlers globales para convertir cualquier error en respuesta JSON.
     */
    public static function register(callable $getResponse, bool $debug): void
    {
        // 1) Convertir warnings/notices a ErrorException (para que pasen por exception handler)
        set_error_handler(function (int $severity, string $message, string $file, int $line) use ($debug) {
            // Si el error está silenciado con @, no hacemos nada
            if (!(error_reporting() & $severity)) {
                return false;
            }

            throw new \ErrorException($message, 0, $severity, $file, $line);
        });

        // 2) Handler de excepciones no capturadas
        set_exception_handler(function (Throwable $e) use ($getResponse, $debug) {
            /** @var Response $response */
            $response = $getResponse();

            $status = self::toHttpStatus($e);

            $payload = [
                'error' => self::publicMessage($e, $debug),
            ];

            if ($debug) {
                $payload['exception'] = [
                    'type' => get_class($e),
                    'message' => $e->getMessage(),
                    'file' => $e->getFile(),
                    'line' => $e->getLine(),
                    'trace' => explode("\n", $e->getTraceAsString()),
                ];
            }

            // Log server-side (siempre)
            error_log(sprintf(
                "[API ERROR] %s: %s in %s:%d",
                get_class($e),
                $e->getMessage(),
                $e->getFile(),
                $e->getLine()
            ));

            $response->setStatusCode($status);
            $response->setContentType('application/json', 'UTF-8');
            $response->setJsonContent($payload);

            // Importante: enviar y terminar (evita HTML fatal)
            $response->send();
            exit(1);
        });

        // 3) Capturar fatal errors (parse errors, etc.)
        register_shutdown_function(function () use ($getResponse, $debug) {
            $err = error_get_last();
            if (!$err) return;

            $fatalTypes = [E_ERROR, E_PARSE, E_CORE_ERROR, E_COMPILE_ERROR];
            if (!in_array($err['type'], $fatalTypes, true)) return;

            /** @var Response $response */
            $response = $getResponse();

            $payload = [
                'error' => $debug ? $err['message'] : 'Internal server error',
            ];

            if ($debug) {
                $payload['fatal'] = [
                    'type' => $err['type'],
                    'message' => $err['message'],
                    'file' => $err['file'],
                    'line' => $err['line'],
                ];
            }

            error_log(sprintf(
                "[API FATAL] %s in %s:%d",
                $err['message'],
                $err['file'],
                $err['line']
            ));

            $response->setStatusCode(500);
            $response->setContentType('application/json', 'UTF-8');
            $response->setJsonContent($payload);
            $response->send();
        });
    }

    private static function toHttpStatus(Throwable $e): int
    {
        if ($e instanceof \DomainException) return 400;
        if ($e instanceof \InvalidArgumentException) return 422;
        if ($e instanceof \RuntimeException) return 500;
        return 500;
    }

    private static function publicMessage(Throwable $e, bool $debug): string
    {
        if ($debug) {
            // En dev mostramos mensaje real
            return $e->getMessage();
        }
        // En prod, mensaje genérico
        return 'Internal server error';
    }
}
