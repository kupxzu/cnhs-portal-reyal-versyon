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