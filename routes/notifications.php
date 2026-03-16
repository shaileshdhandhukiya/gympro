<?php

use App\Http\Controllers\NotificationController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/notifications', [NotificationController::class, 'index'])->name('notifications.index');

    // mark-all-read MUST be before /{id} wildcard routes
    Route::patch('/notifications/mark-all-read', [NotificationController::class, 'markAllAsRead'])->name('notifications.mark-all-read');
    Route::patch('/api/notifications/mark-all-read', [NotificationController::class, 'markAllAsRead'])->name('notifications.api.mark-all-read');

    Route::patch('/notifications/{id}/read', [NotificationController::class, 'markAsRead'])->name('notifications.read');
    Route::delete('/notifications/{id}', [NotificationController::class, 'destroy'])->name('notifications.destroy');

    // API endpoints
    Route::get('/api/notifications/unread-count', [NotificationController::class, 'getUnreadCount'])->name('notifications.unread-count');
    Route::get('/api/notifications/recent', [NotificationController::class, 'getRecent'])->name('notifications.recent');
    Route::patch('/api/notifications/{id}/read', [NotificationController::class, 'markAsRead'])->name('notifications.api.read');
    Route::delete('/api/notifications/{id}', [NotificationController::class, 'destroy'])->name('notifications.api.destroy');
});
