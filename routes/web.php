<?php

use App\Http\Controllers\AttendanceController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\EquipmentController;
use App\Http\Controllers\ExerciseController;
use App\Http\Controllers\ExpenseController;
use App\Http\Controllers\FeatureController;
use App\Http\Controllers\MemberController;
use App\Http\Controllers\MemberDashboardController;
use App\Http\Controllers\MemberPlanController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\PlanController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\SettingController;
use App\Http\Controllers\SubscriptionController;
use App\Http\Controllers\TrainerController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', function () {
    return Inertia::render('Landing', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

Route::get('/privacy-policy', fn() => inertia('PrivacyPolicy'));
Route::get('/terms-of-service', fn() => inertia('TermsOfService'));
Route::get('/refund-policy', fn() => inertia('RefundPolicy'));
Route::get('/about', fn() => inertia('About'));
Route::get('/contact', fn() => inertia('Contact'));

// PhonePe server-to-server webhook — POST only, no auth, no CSRF
Route::post('phonepe/webhook/{orderId}', [\App\Http\Controllers\PhonePePaymentController::class, 'webhook'])
    ->name('phonepe.webhook')
    ->withoutMiddleware([\Illuminate\Foundation\Http\Middleware\VerifyCsrfToken::class]);

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');
    Route::get('member/dashboard', [MemberDashboardController::class, 'index'])->name('member.dashboard');
    Route::get('member/attendance', [MemberDashboardController::class, 'attendance'])->name('member.attendance');
    Route::get('member/orders', [MemberDashboardController::class, 'orders'])->name('member.orders');
    Route::get('member/plans', [MemberPlanController::class, 'index'])->name('member.plans');
    Route::get('member/plans/{plan}/checkout', [\App\Http\Controllers\PhonePePaymentController::class, 'checkout'])->name('member.plans.checkout');
    Route::get('member/plans/{plan}/pay', [\App\Http\Controllers\PhonePePaymentController::class, 'initiatePayment'])->name('member.plans.pay');
    // Browser return after payment — read-only, shows status only
    Route::get('phonepe/redirect/{orderId}', [\App\Http\Controllers\PhonePePaymentController::class, 'redirect'])->name('phonepe.redirect');

    Route::resource('members', MemberController::class)->except(['show', 'create', 'edit']);
    Route::resource('plans', PlanController::class)->except(['show', 'create', 'edit']);
    Route::resource('features', FeatureController::class)->except(['show', 'create', 'edit']);
    Route::resource('subscriptions', SubscriptionController::class)->except(['show', 'create', 'edit']);
    Route::resource('attendances', AttendanceController::class)->except(['show', 'create', 'edit']);
    Route::post('attendances/qr-checkin', [AttendanceController::class, 'qrCheckIn'])->name('attendances.qr-checkin')->withoutMiddleware([
        \Illuminate\Foundation\Http\Middleware\VerifyCsrfToken::class,
    ]);
    Route::get('attendances-reports', [AttendanceController::class, 'reports'])->name('attendances.reports');
    Route::get('qr-checkin', fn() => Inertia::render('Attendances/QRCheckIn'))->name('qr-checkin');
    Route::resource('users', UserController::class)->except(['show', 'create', 'edit']);
    Route::get('trainers', [TrainerController::class, 'index'])->name('trainers.index');
    Route::post('trainers', [TrainerController::class, 'store'])->name('trainers.store');
    Route::post('trainers/filter', [TrainerController::class, 'index']);
    Route::put('trainers/{trainer}', [TrainerController::class, 'update'])->name('trainers.update');
    Route::delete('trainers/{trainer}', [TrainerController::class, 'destroy'])->name('trainers.destroy');
    Route::resource('payments', PaymentController::class)->except(['show', 'create', 'edit']);
    Route::get('payments/{payment}/invoice', [PaymentController::class, 'invoice'])->name('payments.invoice');
    Route::resource('expenses', ExpenseController::class)->except(['show', 'create', 'edit']);
    Route::resource('exercises', ExerciseController::class)->except(['show', 'create', 'edit']);
    Route::patch('exercises/{exercise}/toggle-status', [ExerciseController::class, 'toggleStatus'])->name('exercises.toggle-status');
    Route::resource('equipment', EquipmentController::class)->except(['show', 'create', 'edit']);
    
    Route::get('reports', [ReportController::class, 'index'])->name('reports.index');
    Route::get('reports/export', [ReportController::class, 'export'])->name('reports.export');
    
    Route::middleware('can:view_roles')->group(function () {
        Route::get('roles', [RoleController::class, 'index'])->name('roles.index');
    });
    
    Route::middleware('can:create_roles')->post('roles', [RoleController::class, 'store'])->name('roles.store');
    Route::middleware('can:edit_roles')->put('roles/{role}', [RoleController::class, 'update'])->name('roles.update');
    Route::middleware('can:delete_roles')->delete('roles/{role}', [RoleController::class, 'destroy'])->name('roles.destroy');

    Route::middleware('can:view_settings')->get('settings/general', [SettingController::class, 'index'])->name('settings.general');
    Route::middleware('can:edit_settings')->post('settings/general', [SettingController::class, 'update'])->name('settings.update');
    Route::middleware('can:view_settings')->get('settings/payment-gateways', [SettingController::class, 'paymentGateways'])->name('settings.payment-gateways');
    Route::middleware('can:edit_settings')->post('settings/payment-gateways', [SettingController::class, 'updatePaymentGateways'])->name('settings.payment-gateways.update');
});

require __DIR__.'/settings.php';
require __DIR__.'/notifications.php';
require __DIR__.'/auth.php';
