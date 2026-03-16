<?php

namespace App\Services;

use App\Models\Trainer;
use App\Models\User;
use App\Models\Role;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Hash;

class TrainerService
{
    /**
     * Get paginated trainers
     */
    public function getTrainers(array $filters = []): LengthAwarePaginator
    {
        $query = Trainer::with('user');

        // Apply search filter
        if (!empty($filters['search'])) {
            $query->whereHas('user', function($q) use ($filters) {
                $q->where('name', 'like', "%{$filters['search']}%")
                  ->orWhere('email', 'like', "%{$filters['search']}%");
            });
        }

        // Apply status filter
        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        $perPage = $filters['per_page'] ?? 10;
        return $query->latest()->paginate($perPage);
    }

    /**
     * Create a new trainer
     */
    public function createTrainer(array $data): Trainer
    {
        // Create user account first
        $user = User::create([
            'name'     => $data['name'],
            'email'    => $data['email'],
            'phone'    => $data['phone'],
            'password' => Hash::make($data['password']),
            'status'   => $data['status'],
        ]);

        $trainerRole = Role::where('name', 'Trainer')->first();
        if ($trainerRole) {
            $user->roles()->attach($trainerRole->id);
        }

        // Create trainer profile
        $trainer = Trainer::create([
            'user_id' => $user->id,
            'specialization' => $data['specialization'],
            'experience_years' => $data['experience_years'],
            'salary' => $data['salary'],
            'joining_date' => $data['joining_date'],
            'bio' => $data['bio'] ?? null,
            'status' => $data['status'],
        ]);

        return $trainer->fresh('user');
    }

    /**
     * Update trainer
     */
    public function updateTrainer(Trainer $trainer, array $data): Trainer
    {
        // Update user information
        $userData = [
            'name' => $data['name'],
            'email' => $data['email'],
            'status' => $data['status'],
        ];

        if (!empty($data['password'])) {
            $userData['password'] = Hash::make($data['password']);
        }

        $trainer->user->update($userData);

        // Update trainer profile
        $trainerData = [
            'specialization' => $data['specialization'] ?? $trainer->specialization,
            'experience_years' => $data['experience_years'] ?? $trainer->experience_years,
            'salary' => $data['salary'] ?? $trainer->salary,
            'joining_date' => $data['joining_date'] ?? $trainer->joining_date,
            'bio' => $data['bio'] ?? $trainer->bio,
            'status' => $data['status'],
        ];

        $trainer->update($trainerData);

        return $trainer->fresh('user');
    }

    /**
     * Delete trainer
     */
    public function deleteTrainer(Trainer $trainer): bool
    {
        return $trainer->delete();
    }

    /**
     * Get trainer by ID
     */
    public function getTrainerById(int $id): Trainer
    {
        return Trainer::with('user')->findOrFail($id);
    }

    /**
     * Get active trainers for dropdowns
     */
    public function getActiveTrainers(): Collection
    {
        return Trainer::with('user')
            ->where('status', 'active')
            ->get();
    }

    /**
     * Get trainer statistics
     */
    public function getTrainerStatistics(): array
    {
        return [
            'total_trainers' => Trainer::count(),
            'active_trainers' => Trainer::where('status', 'active')->count(),
            'avg_experience' => Trainer::whereNotNull('experience_years')->avg('experience_years'),
            'specializations' => Trainer::selectRaw('specialization, COUNT(*) as count')
                ->whereNotNull('specialization')
                ->groupBy('specialization')
                ->orderBy('count', 'desc')
                ->get(),
        ];
    }

    /**
     * Get trainers with subscription counts
     */
    public function getTrainersWithSubscriptionCounts(): Collection
    {
        return Trainer::with('user')
            ->withCount('subscriptions')
            ->orderBy('subscriptions_count', 'desc')
            ->get();
    }

    /**
     * Get validation rules for trainer
     */
    public function getValidationRules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:8',
            'phone' => 'required|string|max:20',
            'specialization' => 'required|string|max:255',
            'experience_years' => 'required|integer|min:0',
            'salary' => 'required|numeric|min:0',
            'joining_date' => 'required|date',
            'bio' => 'nullable|string',
            'status' => 'required|in:active,inactive',
        ];
    }

    /**
     * Update validation rules for existing trainer
     */
    public function getUpdateValidationRules(Trainer $trainer): array
    {
        return [
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $trainer->user_id,
            'phone' => 'nullable|string',
            'specialization' => 'nullable|string|max:255',
            'experience_years' => 'nullable|integer|min:0',
            'salary' => 'nullable|numeric|min:0',
            'joining_date' => 'nullable|date',
            'bio' => 'nullable|string',
            'status' => 'required|in:active,inactive',
        ];
    }
}
