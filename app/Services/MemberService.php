<?php

namespace App\Services;

use App\Models\Member;
use App\Models\User;
use App\Models\Role;
use App\Services\NotificationService;
use Illuminate\Support\Facades\Hash;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class MemberService
{
    public function __construct(
        private NotificationService $notificationService
    ) {}

    /**
     * Get paginated members with filtering and stats
     */
    public function getMembers(array $filters = []): array
    {
        $query = Member::with(['user', 'subscriptions' => function($q) {
            $q->where('status', 'active')
              ->where('end_date', '>=', now())
              ->with('plan')
              ->latest();
        }]);

        // Apply search filter
        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->whereHas('user', function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        // Apply status filter
        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        $perPage = $filters['per_page'] ?? 10;
        $members = $query->latest()->paginate($perPage);

        $stats = [
            'total' => Member::count(),
            'active' => Member::where('status', 'active')->count(),
            'inactive' => Member::where('status', 'inactive')->count(),
        ];

        return [
            'members' => $members,
            'stats' => $stats,
        ];
    }

    /**
     * Create a new member with user account
     */
    public function createMember(array $data): Member
    {
        // Create user account
        $user = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'phone' => $data['phone'],
            'password' => Hash::make($data['password']),
            'status' => 'active',
        ]);

        // Assign member role
        $memberRole = Role::where('name', 'Member')->first();
        if ($memberRole) {
            $user->roles()->attach($memberRole->id);
        }

        // Create member profile
        $member = Member::create([
            'user_id' => $user->id,
            'gender' => $data['gender'],
            'date_of_birth' => $data['date_of_birth'],
            'address' => $data['address'] ?? null,
            'join_date' => $data['join_date'],
            'status' => $data['status'],
            'notes' => $data['notes'] ?? null,
        ]);

        // Notify admins only — this is an admin-facing alert, not for the member
        $adminMessage = "New member {$data['name']} has been registered";
        User::whereHas('roles', fn($q) => $q->whereIn('name', ['Admin', 'Manager']))
            ->get()
            ->each(fn($admin) => $this->notificationService->create([
                'type'     => 'member_registered',
                'title'    => 'New Member Registered',
                'message'  => $adminMessage,
                'data'     => ['member_id' => $member->id],
                'user_id'  => $admin->id,
                'priority' => 'normal',
                'color'    => '#10b981',
            ]));

        return $member;
    }

    /**
     * Update member information
     */
    public function updateMember(Member $member, array $data): Member
    {
        // Update user information
        $member->user->update([
            'name' => $data['name'],
            'email' => $data['email'],
            'phone' => $data['phone'],
        ]);

        // Update member profile
        $member->update([
            'gender' => $data['gender'],
            'date_of_birth' => $data['date_of_birth'],
            'address' => $data['address'],
            'join_date' => $data['join_date'],
            'status' => $data['status'],
            'notes' => $data['notes'],
        ]);

        return $member->fresh(['user']);
    }

    /**
     * Delete a member
     */
    public function deleteMember(Member $member): bool
    {
        // Note: This will also delete associated user due to cascade
        return $member->delete();
    }

    /**
     * Get active members for dropdowns
     */
    public function getActiveMembers(): Collection
    {
        return Member::with('user')
            ->where('status', 'active')
            ->get();
    }

    /**
     * Get member by ID with relationships
     */
    public function getMemberById(int $id): Member
    {
        return Member::with(['user', 'subscriptions.plan', 'subscriptions.payments'])
            ->findOrFail($id);
    }
}
