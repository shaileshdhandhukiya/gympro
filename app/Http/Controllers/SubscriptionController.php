<?php

namespace App\Http\Controllers;

use App\Models\Subscription;
use App\Models\Member;
use App\Models\Plan;
use App\Models\Trainer;
use App\Services\SubscriptionService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SubscriptionController extends Controller
{
    public function __construct(
        private SubscriptionService $subscriptionService
    ) {}

    public function index(Request $request)
    {
        if (!auth()->user()->hasPermission('view_subscriptions')) {
            abort(403, 'Unauthorized action.');
        }

        $validated = $request->validate([
            'search' => 'nullable|string|max:255',
            'status' => 'nullable|string',
            'per_page' => 'nullable|integer|min:1|max:100',
        ]);

        $search = $validated['search'] ?? null;
        $statusFilter = $validated['status'] ?? null;
        $perPage = $validated['per_page'] ?? 10;

        $filters = [
            'search' => $search,
            'status' => $statusFilter,
            'per_page' => $perPage,
        ];

        $result = $this->subscriptionService->getSubscriptions($filters);
        $formData = $this->subscriptionService->getFormData();

        return Inertia::render('Subscriptions/Index', [
            'subscriptions' => $result['subscriptions'],
            'members' => $formData['members'],
            'plans' => $formData['plans'],
            'trainers' => $formData['trainers'],
            'stats' => $result['stats'],
            'filters' => $filters,
        ]);
    }

    public function store(Request $request)
    {
        if (!auth()->user()->hasPermission('create_subscriptions')) {
            abort(403, 'Unauthorized action.');
        }

        $validated = $request->validate($this->subscriptionService->getValidationRules());

        // Add payment details if provided
        if ($request->filled('payment_amount')) {
            $validated['payment_amount'] = $request->payment_amount;
            $validated['payment_method'] = $request->payment_method ?? 'cash';
            $validated['payment_type'] = $request->payment_type ?? 'plan';
            $validated['payment_date'] = $request->payment_date ?? now();
        }

        $this->subscriptionService->createSubscription($validated);

        return redirect()->back()->with('success', 'Subscription created successfully');
    }

    public function update(Request $request, Subscription $subscription)
    {
        if (!auth()->user()->hasPermission('edit_subscriptions')) {
            abort(403, 'Unauthorized action.');
        }

        $validated = $request->validate($this->subscriptionService->getValidationRules());
        $this->subscriptionService->updateSubscription($subscription, $validated);

        return redirect()->back()->with('success', 'Subscription updated successfully');
    }

    public function destroy(Subscription $subscription)
    {
        if (!auth()->user()->hasPermission('delete_subscriptions')) {
            abort(403, 'Unauthorized action.');
        }

        $this->subscriptionService->deleteSubscription($subscription);
        return redirect()->back()->with('success', 'Subscription deleted successfully');
    }
}
