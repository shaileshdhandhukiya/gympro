<?php

namespace App\Http\Controllers;

use App\Models\Equipment;
use App\Services\EquipmentService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class EquipmentController extends Controller
{
    public function __construct(
        private EquipmentService $equipmentService
    ) {}

    public function index(Request $request)
    {
        if (!auth()->user()->hasPermission('view_equipment')) {
            abort(403, 'Unauthorized');
        }

        $validated = $request->validate([
            'search'   => 'nullable|string|max:255',
            'status'   => 'nullable|in:active,maintenance,retired',
            'per_page' => 'nullable|integer|min:1|max:100',
        ]);

        $filters = [
            'search'   => $validated['search'] ?? null,
            'status'   => $validated['status'] ?? null,
            'per_page' => (int) ($validated['per_page'] ?? 10),
        ];

        $result = $this->equipmentService->getEquipment($filters);

        return Inertia::render('equipment/Index', [
            'equipment' => $result['equipment'],
            'stats'     => $result['stats'],
            'filters'   => $filters,
        ]);
    }

    public function store(Request $request)
    {
        if (!auth()->user()->hasPermission('create_equipment')) {
            abort(403, 'Unauthorized');
        }

        $validated = $request->validate($this->equipmentService->getValidationRules());

        if ($request->hasFile('photo')) {
            $validated['photo'] = $request->file('photo');
        }

        $this->equipmentService->createEquipment($validated);

        return redirect()->back()->with('success', 'Equipment created successfully');
    }

    public function update(Request $request, Equipment $equipment)
    {
        if (!auth()->user()->hasPermission('edit_equipment')) {
            abort(403, 'Unauthorized');
        }

        $validated = $request->validate($this->equipmentService->getValidationRules());

        if ($request->hasFile('photo')) {
            $validated['photo'] = $request->file('photo');
        }

        $this->equipmentService->updateEquipment($equipment, $validated);

        return redirect()->back()->with('success', 'Equipment updated successfully');
    }

    public function destroy(Equipment $equipment)
    {
        if (!auth()->user()->hasPermission('delete_equipment')) {
            abort(403, 'Unauthorized');
        }

        $this->equipmentService->deleteEquipment($equipment);

        return redirect()->back()->with('success', 'Equipment deleted successfully');
    }
}
