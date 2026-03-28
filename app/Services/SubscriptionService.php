<?php

namespace App\Services;

use App\Models\Subscription;
use App\Models\Member;
use App\Models\Plan;
use App\Models\Trainer;
use App\Models\Payment;
use App\Notifications\SubscriptionExpiringNotification;
use App\Services\NotificationService;
use Illuminate\Support\Facades\Log;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Carbon\Carbon;

class SubscriptionService
{
    public function __construct(
        private NotificationService $notificationService
    ) {}

    /**
     * Get paginated subscriptions with filtering
     */
    public function getSubscriptions(array $filters = []): array
    {
        $query = Subscription::with([
            'member.user',
            'plan.features',
            'payments',
            'trainer.user'
        ]) // ✅ Eager load all relationships to prevent N+1
            ->when(!empty($filters['search']), function ($q) use ($filters) {
                $search = htmlspecialchars($filters['search'], ENT_QUOTES, 'UTF-8');
                $q->whereHas('member.user', function ($query) use ($search) {
                    $query->where('name', 'like', "%{$search}%")
                          ->orWhere('email', 'like', "%{$search}%");
                })->orWhereHas('plan', function ($query) use ($search) {
                    $query->where('name', 'like', "%{$search}%");
                });
            })
            ->when(!empty($filters['status']), function ($q) use ($filters) {
                $q->where('status', $filters['status']);
            });

        $perPage = $filters['per_page'] ?? 10;
        $subscriptions = $query->latest()->paginate($perPage);

        $stats = [
            'total' => Subscription::count(),
            'active' => Subscription::where('status', 'active')->count(),
            'expired' => Subscription::where('status', 'expired')->count(),
            'cancelled' => Subscription::where('status', 'cancelled')->count(),
            'pending' => Subscription::where('status', 'pending')->count(),
        ];

        return [
            'subscriptions' => $subscriptions,
            'stats' => $stats,
        ];
    }

    /**
     * Create a new subscription
     */
    public function createSubscription(array $data): Subscription
    {
        $plan = Plan::findOrFail($data['plan_id']);
        $startDate = Carbon::parse($data['start_date']);
        $data['end_date'] = $startDate->copy()->addMonths($plan->duration_months);

        $subscription = Subscription::create($data);
        // Model event will trigger notification automatically

        if (!empty($data['payment_amount'])) {
            $this->createPaymentForSubscription($subscription, [
                'amount' => $data['payment_amount'],
                'payment_method' => $data['payment_method'] ?? 'cash',
                'payment_type' => $data['payment_type'] ?? 'plan',
                'payment_date' => $data['payment_date'] ?? now(),
                'status' => 'completed',
            ]);
        }

        return $subscription->fresh(['member.user', 'plan', 'payments']);
    }

    /**
     * Update subscription
     */
    public function updateSubscription(Subscription $subscription, array $data): Subscription
    {
        // Recalculate end date if plan or start date changed
        if (isset($data['plan_id']) || isset($data['start_date'])) {
            $planId = $data['plan_id'] ?? $subscription->plan_id;
            $startDateStr = $data['start_date'] ?? $subscription->start_date;

            $plan = Plan::findOrFail($planId);
            $startDate = Carbon::parse($startDateStr);
            $data['end_date'] = $startDate->copy()->addMonths($plan->duration_months);
        }

        $subscription->update($data);

        return $subscription->fresh(['member.user', 'plan', 'payments']);
    }

    /**
     * Delete subscription
     */
    public function deleteSubscription(Subscription $subscription): bool
    {
        return $subscription->delete();
    }

    /**
     * Create payment for subscription
     */
    public function createPaymentForSubscription(Subscription $subscription, array $paymentData): Payment
    {
        $paymentData['subscription_id'] = $subscription->id;
        $paymentData['payment_source'] = 'manual';

        $payment = Payment::create($paymentData);
        // Model event will trigger notification automatically

        return $payment;
    }

    /**
     * Get subscription by ID with relationships
     */
    public function getSubscriptionById(int $id): Subscription
    {
        return Subscription::with([
            'member.user',
            'plan.features',
            'trainer.user',
            'payments'
        ])->findOrFail($id); // ✅ Eager load all relationships
    }

    /**
     * Get active subscriptions for a member
     */
    public function getActiveSubscriptionsForMember(int $memberId): Collection
    {
        return Subscription::with(['plan', 'payments'])
            ->where('member_id', $memberId)
            ->where('status', 'active')
            ->where('end_date', '>=', now())
            ->get();
    }

    /**
     * Check and update expired subscriptions
     */
    public function updateExpiredSubscriptions(): int
    {
        $expiredCount = 0;
        $expiredSubscriptions = Subscription::where('status', 'active')
            ->where('end_date', '<', now())
            ->get();

        foreach ($expiredSubscriptions as $subscription) {
            $subscription->update(['status' => 'expired']);
            // Model event will trigger notification automatically
            $expiredCount++;
        }

        return $expiredCount;
    }

    /**
     * Send notifications for subscriptions expiring soon
     */
    public function notifyExpiringSubscriptions(int $days = 7): int
    {
        $expiringSubscriptions = Subscription::with(['member.user', 'plan'])
            ->where('status', 'active')
            ->whereBetween('end_date', [now(), now()->addDays($days)])
            ->get();

        $notifiedCount = 0;

        foreach ($expiringSubscriptions as $subscription) {
            if (!$subscription->member->user) {
                continue;
            }

            $payload = [
                'subscription_id' => $subscription->id,
                'plan_name' => $subscription->plan->name,
                'end_date' => $subscription->end_date->format('Y-m-d'),
            ];

            $subscription->member->user->notify(new SubscriptionExpiringNotification($payload));
            $notifiedCount++;
        }

        return $notifiedCount;
    }

    /**
     * Get validation rules for subscription
     */
    public function getValidationRules(): array
    {
        return [
            'member_id' => 'required|exists:members,id',
            'plan_id' => 'required|exists:plans,id',
            'trainer_id' => 'nullable|exists:trainers,id',
            'start_date' => 'required|date',
            'status' => 'required|in:pending,active,expired,cancelled',
            'notes' => 'nullable|string',
        ];
    }

    /**
     * Get lazy-loaded data for subscription forms
     */
    public function getFormData(): array
    {
        return [
            'members' => Member::with('user')->where('status', 'active')->get(),
            'plans' => Plan::where('status', 'active')->get(),
            'trainers' => Trainer::with('user')->where('status', 'active')->get(),
        ];
    }
}
