<?php

namespace App\Http\Controllers;

use App\Http\Requests\ExerciseRequest;
use App\Models\Exercise;
use App\Services\ExerciseService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ExerciseController extends Controller
{
    public function __construct(private ExerciseService $exerciseService) {}

    public function index(Request $request): Response
    {
        if (!auth()->user()->hasPermission('view_exercises')) {
            abort(403);
        }

        $validated = $request->validate([
            'search' => 'nullable|string|max:255',
            'category' => 'nullable|string',
            'difficulty' => 'nullable|string',
            'muscle_group' => 'nullable|string',
            'status' => 'nullable|string',
            'per_page' => 'nullable|integer|min:1|max:100',
        ]);

        $search = $validated['search'] ?? null;
        $category = $validated['category'] ?? null;
        $difficulty = $validated['difficulty'] ?? null;
        $muscleGroup = $validated['muscle_group'] ?? null;
        $status = $validated['status'] ?? null;
        $perPage = $validated['per_page'] ?? 10;

        $filters = [
            'search' => $search,
            'category' => $category,
            'difficulty' => $difficulty,
            'muscle_group' => $muscleGroup,
            'status' => $status,
            'per_page' => $perPage,
        ];

        $data = $this->exerciseService->getExercises($filters);

        return Inertia::render('Exercises/Index', [
            'exercises' => $data['exercises'],
            'stats' => $data['stats'],
            'filters' => $filters,
        ]);
    }

    public function store(ExerciseRequest $request)
    {
        if (!auth()->user()->hasPermission('create_exercises')) {
            abort(403);
        }

        $validated = $request->validated();
        $validated['created_by'] = auth()->id();

        $this->exerciseService->createExercise($validated);

        return redirect()->route('exercises.index')
            ->with('success', 'Exercise created successfully');
    }

    public function update(ExerciseRequest $request, Exercise $exercise)
    {
        if (!auth()->user()->hasPermission('edit_exercises')) {
            abort(403);
        }

        $validated = $request->validated();
        $this->exerciseService->updateExercise($exercise, $validated);

        return redirect()->route('exercises.index')
            ->with('success', 'Exercise updated successfully');
    }

    public function destroy(Exercise $exercise)
    {
        if (!auth()->user()->hasPermission('delete_exercises')) {
            abort(403);
        }

        $this->exerciseService->deleteExercise($exercise);

        return redirect()->route('exercises.index')
            ->with('success', 'Exercise deleted successfully');
    }

    public function toggleStatus(Exercise $exercise)
    {
        if (!auth()->user()->hasPermission('edit_exercises')) {
            abort(403);
        }

        $newStatus = $exercise->status === 'active' ? 'inactive' : 'active';
        $exercise->update(['status' => $newStatus]);

        return redirect()->route('exercises.index')
            ->with('success', "Exercise {$newStatus} successfully");
    }
}
