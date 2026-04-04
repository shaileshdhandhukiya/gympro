<?php

namespace App\Http\Controllers;

use App\Models\Feature;
use App\Models\Plan;
use App\Services\PlanService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PlanController extends Controller
{
    public function __construct(
        private PlanService $planService
    ) {}

    public function index(Request $request)
    {
        if (!auth()->user()->hasPermission('view_plans')) {
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

        $result = $this->planService->getPlans($filters);
        $features = Feature::where('status', 'active')->get(['id', 'name', 'slug']);

        return Inertia::render('Plans/Index', [
            'plans' => $result['plans'],
            'stats' => $result['stats'],
            'filters' => $filters,
            'features' => $features,
        ]);
    }

    public function store(Request $request)
    {
        if (!auth()->user()->hasPermission('create_plans')) {
            abort(403, 'Unauthorized action.');
        }

        $validated = $request->validate($this->planService->getValidationRules());
        $features = $request->input('features', []);
        $this->planService->createPlan($validated, $features);

        return redirect()->back()->with('success', 'Plan created successfully');
    }

    public function update(Request $request, Plan $plan)
    {
        if (!auth()->user()->hasPermission('edit_plans')) {
            abort(403, 'Unauthorized action.');
        }

        $validated = $request->validate($this->planService->getValidationRules());
        $features = $request->input('features', []);
        $this->planService->updatePlan($plan, $validated, $features);

        return redirect()->back()->with('success', 'Plan updated successfully');
    }

    public function destroy(Plan $plan)
    {
        if (!auth()->user()->hasPermission('delete_plans')) {
            abort(403, 'Unauthorized action.');
        }

        if (!$this->planService->canDeletePlan($plan)) {
            return redirect()->back()->withErrors(['plan' => 'Cannot delete plan that has active subscriptions']);
        }

        $this->planService->deletePlan($plan);
        return redirect()->back()->with('success', 'Plan deleted successfully');
    }
}
