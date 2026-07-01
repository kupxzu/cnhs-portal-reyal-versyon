<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    // Kukunin ang lahat ng routes, ififilter ang may 'api', at aayusin ang format
    $apiRoutes = collect(Route::getRoutes())->filter(function ($route) {
        return str_contains($route->uri(), 'api');
    })->map(function ($route) {
        return [
            'methods' => $route->methods(),
            'uri'     => $route->uri(),
            'name'    => $route->getName() ?? 'N/A',
            'action'  => ltrim($route->getActionName(), '\\'),
        ];
    });

    return view('welcome', compact('apiRoutes'));
});

// Fallback route for SPA - redirect to frontend for client-side routing
Route::fallback(function () {
    if (request()->expectsJson() || request()->is('api/*')) {
        return response()->json([
            'success' => false,
            'status' => 404,
            'message' => 'Endpoint not found',
            'error' => 'The requested API endpoint does not exist.',
            'path' => request()->path(),
        ], 404);
    }
    
    // For web requests, let the frontend handle 404
    return view('index');
});