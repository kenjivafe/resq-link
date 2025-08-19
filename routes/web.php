<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\IncidentController;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    // Dispatcher console: Incidents list
    Route::get('console/incidents', [IncidentController::class, 'index'])->name('incidents.index');

    // Create incident form
    Route::get('console/incidents/create', function () {
        return Inertia::render('incidents/create');
    })->name('incidents.create');

    // Store new incident
    Route::post('console/incidents', [IncidentController::class, 'store'])->name('incidents.store');

    // Incident detail
    Route::get('console/incidents/{id}', function (string $id) {
        return Inertia::render('incidents/show', [ 'id' => (int) $id ]);
    })->name('incidents.show');

    // Live feed page
    Route::get('console/feed', function () {
        return Inertia::render('feed/index');
    })->name('feed.index');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
