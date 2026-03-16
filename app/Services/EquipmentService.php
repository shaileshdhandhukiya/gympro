<?php

namespace App\Services;

use App\Models\Equipment;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Carbon\Carbon;

class EquipmentService
{
    /**
     * Get paginated equipment with filtering
     */
    public function getEquipment(array $filters = []): array
    {
        $query = Equipment::query();

        // Apply search filter
        if (!empty($filters['search'])) {
            $query->where('name', 'like', "%{$filters['search']}%")
                  ->orWhere('category', 'like', "%{$filters['search']}%");
        }

        // Apply status filter
        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        $perPage = $filters['per_page'] ?? 10;
        $equipment = $query->latest()->paginate($perPage);

        $stats = [
            'total' => Equipment::count(),
            'active' => Equipment::where('status', 'active')->count(),
            'maintenance' => Equipment::where('status', 'maintenance')->count(),
            'retired' => Equipment::where('status', 'retired')->count(),
        ];

        return [
            'equipment' => $equipment,
            'stats' => $stats,
        ];
    }

    /**
     * Create new equipment
     */
    public function createEquipment(array $data): Equipment
    {
        // Handle photo upload
        if (isset($data['photo']) && $data['photo']) {
            $data['photo'] = $data['photo']->store('equipment', 'public');
        }

        return Equipment::create($data);
    }

    /**
     * Update equipment
     */
    public function updateEquipment(Equipment $equipment, array $data): Equipment
    {
        // Handle photo upload
        if (isset($data['photo']) && $data['photo']) {
            // Delete old photo if exists
            if ($equipment->photo) {
                Storage::disk('public')->delete($equipment->photo);
            }
            $data['photo'] = $data['photo']->store('equipment', 'public');
        }

        $equipment->update($data);
        return $equipment->fresh();
    }

    /**
     * Delete equipment
     */
    public function deleteEquipment(Equipment $equipment): bool
    {
        // Delete photo if exists
        if ($equipment->photo) {
            Storage::disk('public')->delete($equipment->photo);
        }

        return $equipment->delete();
    }

    /**
     * Get equipment by ID
     */
    public function getEquipmentById(int $id): Equipment
    {
        return Equipment::findOrFail($id);
    }

    /**
     * Get equipment statistics
     */
    public function getEquipmentStatistics(): array
    {
        return [
            'total_equipment' => Equipment::count(),
            'active_equipment' => Equipment::where('status', 'active')->count(),
            'maintenance_equipment' => Equipment::where('status', 'maintenance')->count(),
            'by_category' => Equipment::selectRaw('category, COUNT(*) as count, SUM(quantity) as total_quantity')
                ->groupBy('category')
                ->get(),
            'by_condition' => Equipment::selectRaw('condition, COUNT(*) as count')
                ->groupBy('condition')
                ->get(),
            'total_value'      => Equipment::sum(DB::raw('purchase_price * quantity')),
            'recent_purchases' => Equipment::where('purchase_date', '>=', now()->subMonths(3))
                ->sum(DB::raw('purchase_price * quantity')),
        ];
    }

    /**
     * Get equipment needing maintenance
     */
    public function getEquipmentNeedingMaintenance(): Collection
    {
        return Equipment::where('status', 'maintenance')
            ->orWhere('condition', 'poor')
            ->get();
    }

    /**
     * Get equipment by category
     */
    public function getEquipmentByCategory(): Collection
    {
        return Equipment::selectRaw('category, COUNT(*) as count, SUM(quantity) as total_quantity')
            ->groupBy('category')
            ->orderBy('count', 'desc')
            ->get();
    }

    /**
     * Bulk update equipment status
     */
    public function bulkUpdateStatus(array $equipmentIds, string $status): int
    {
        return Equipment::whereIn('id', $equipmentIds)
            ->update(['status' => $status]);
    }

    /**
     * Get equipment purchase history
     */
    public function getPurchaseHistory(int $months = 12): Collection
    {
        return Equipment::where('purchase_date', '>=', now()->subMonths($months))
            ->orderBy('purchase_date', 'desc')
            ->get()
            ->groupBy(function($item) {
                return $item->purchase_date->format('Y-m');
            });
    }

    /**
     * Get validation rules for equipment
     */
    public function getValidationRules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'category' => 'required|string|max:255',
            'photo' => 'nullable|image|max:2048',
            'quantity' => 'required|integer|min:1',
            'purchase_price' => 'required|numeric|min:0',
            'purchase_date' => 'required|date',
            'condition' => 'required|in:excellent,good,fair,poor',
            'status' => 'required|in:active,maintenance,retired',
            'notes' => 'nullable|string',
        ];
    }

    /**
     * Calculate depreciation for equipment
     */
    public function calculateDepreciation(Equipment $equipment, int $usefulLifeYears = 5): array
    {
        $purchaseDate = Carbon::parse($equipment->purchase_date);
        $currentDate = now();
        $ageInYears = $purchaseDate->diffInYears($currentDate);

        $depreciationRate = 1 / $usefulLifeYears;
        $accumulatedDepreciation = min($ageInYears * $depreciationRate, 1);
        $currentValue = $equipment->purchase_price * (1 - $accumulatedDepreciation);

        return [
            'original_value' => $equipment->purchase_price,
            'current_value' => round($currentValue, 2),
            'accumulated_depreciation' => round($equipment->purchase_price * $accumulatedDepreciation, 2),
            'depreciation_rate' => $depreciationRate * 100,
            'age_years' => $ageInYears,
            'remaining_life_years' => max(0, $usefulLifeYears - $ageInYears),
        ];
    }
}
