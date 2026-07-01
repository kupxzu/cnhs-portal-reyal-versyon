<?php

namespace App\Exceptions;

use Illuminate\Foundation\Exceptions\Handler as ExceptionHandler;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Response;
use Symfony\Component\HttpKernel\Exception\HttpException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Throwable;

class Handler extends ExceptionHandler
{
    /**
     * The list of the inputs that are never flashed to the session on validation exceptions.
     *
     * @var array<int, string>
     */
    protected $dontFlash = [
        'current_password',
        'password',
        'password_confirmation',
    ];

    /**
     * Register the exception handling callbacks for the application.
     */
    public function register(): void
    {
        $this->reportable(function (Throwable $e) {
            //
        });
    }

    /**
     * Render an exception into a response.
     */
    public function render($request, Throwable $exception)
    {
        // Handle 404 Not Found exceptions
        if ($exception instanceof NotFoundHttpException) {
            if ($request->expectsJson() || $request->is('api/*')) {
                return response()->json([
                    'success' => false,
                    'status' => 404,
                    'message' => 'Resource not found',
                    'error' => 'The requested resource does not exist.',
                    'path' => $request->path(),
                ], Response::HTTP_NOT_FOUND);
            }
        }

        // Handle other HTTP exceptions
        if ($exception instanceof HttpException) {
            if ($request->expectsJson() || $request->is('api/*')) {
                return response()->json([
                    'success' => false,
                    'status' => $exception->getStatusCode(),
                    'message' => $exception->getMessage() ?: $this->getHttpExceptionMessage($exception->getStatusCode()),
                    'error' => class_basename($exception),
                    'path' => $request->path(),
                ], $exception->getStatusCode());
            }
        }

        // Handle validation exceptions (422)
        if ($exception instanceof \Illuminate\Validation\ValidationException) {
            if ($request->expectsJson() || $request->is('api/*')) {
                return response()->json([
                    'success' => false,
                    'status' => 422,
                    'message' => 'Validation error',
                    'errors' => $exception->errors(),
                ], Response::HTTP_UNPROCESSABLE_ENTITY);
            }
        }

        // Handle authentication exceptions (401)
        if ($exception instanceof \Illuminate\Auth\AuthenticationException) {
            if ($request->expectsJson() || $request->is('api/*')) {
                return response()->json([
                    'success' => false,
                    'status' => 401,
                    'message' => 'Unauthorized. Please log in.',
                    'error' => 'Authentication failed.',
                    'path' => $request->path(),
                ], Response::HTTP_UNAUTHORIZED);
            }
        }

        // Handle authorization exceptions (403)
        if ($exception instanceof \Illuminate\Auth\Access\AuthorizationException) {
            if ($request->expectsJson() || $request->is('api/*')) {
                return response()->json([
                    'success' => false,
                    'status' => 403,
                    'message' => 'Forbidden',
                    'error' => 'You do not have permission to access this resource.',
                    'path' => $request->path(),
                ], Response::HTTP_FORBIDDEN);
            }
        }

        return parent::render($request, $exception);
    }

    /**
     * Get HTTP exception message based on status code
     */
    private function getHttpExceptionMessage(int $statusCode): string
    {
        return match ($statusCode) {
            400 => 'Bad request',
            401 => 'Unauthorized',
            403 => 'Forbidden',
            404 => 'Not found',
            405 => 'Method not allowed',
            408 => 'Request timeout',
            429 => 'Too many requests',
            500 => 'Internal server error',
            501 => 'Not implemented',
            502 => 'Bad gateway',
            503 => 'Service unavailable',
            504 => 'Gateway timeout',
            default => 'HTTP Error',
        };
    }
}
