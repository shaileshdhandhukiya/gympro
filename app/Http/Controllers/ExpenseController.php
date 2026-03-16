<?php

namespace App\Http\Controllers;

use App\Models\Expense;
use App\Services\ExpenseService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ExpenseController extends Controller
{
    public function __construct(
        private ExpenseService $expenseService
    ) {}

    public function index(Request $request)
    {
        if (!auth()->user()->hasPermission('view_expenses')) {
            abort(403, 'Unauthorized');
        }

        $validated = $request->validate([
            'search'   => 'nullable|string|max:255',
            'category' => 'nullable|in:equipment,maintenance,utilities,salaries,rent,marketing,other',
            'per_page' => 'nullable|integer|min:1|max:100',
        ]);

        $filters = [
            'search'   => $validated['search'] ?? null,
            'category' => $validated['category'] ?? null,
            'per_page' => (int) ($validated['per_page'] ?? 10),
        ];

        $expenses = $this->expenseService->getExpenses($filters);

        return Inertia::render('Expenses/Index', [
            'expenses' => $expenses,
            'filters'  => $filters,
        ]);
    }

    public function store(Request $request)
    {
        if (!auth()->user()->hasPermission('create_expenses')) {
            abort(403, 'Unauthorized');
        }

        $validated = $request->validate($this->expenseService->getValidationRules());
        $this->expenseService->createExpense($validated);

        return redirect()->back()->with('success', 'Expense created successfully');
    }

    public function update(Request $request, Expense $expense)
    {
        if (!auth()->user()->hasPermission('edit_expenses')) {
            abort(403, 'Unauthorized');
        }

        $validated = $request->validate($this->expenseService->getValidationRules());
        $this->expenseService->updateExpense($expense, $validated);

        return redirect()->back()->with('success', 'Expense updated successfully');
    }

    public function destroy(Expense $expense)
    {
        if (!auth()->user()->hasPermission('delete_expenses')) {
            abort(403, 'Unauthorized');
        }

        $this->expenseService->deleteExpense($expense);

        return redirect()->back()->with('success', 'Expense deleted successfully');
    }
}
