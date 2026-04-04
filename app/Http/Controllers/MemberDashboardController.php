<?php

namespace App\Http\Controllers;

use App\Models\Member;
use App\Models\Subscription;
use App\Models\Attendance;
use App\Models\Payment;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class MemberDashboardController extends Controller
{
    public function index()
    {
        // Check if user has member role
        if (!auth()->user()->hasPermission('view_member_dashboard')) {
            abort(403, 'Unauthorized. Member access only.');
        }

        $user = auth()->user();
        $member = Member::where('user_id', $user->id)->first();

        if (!$member) {
            abort(404, 'Member profile not found. Please contact admin.');
        }

        // Current Subscription with payments
        $currentSubscription = Subscription::with(['plan', 'payments'])
            ->where('member_id', $member->id)
            ->where('status', 'active')
            ->where('end_date', '>=', now())
            ->latest()
            ->first();

        // Attendance Stats - count unique dates
        $attendanceThisMonth = Attendance::where('member_id', $member->id)
            ->whereMonth('date', Carbon::now()->month)
            ->whereYear('date', Carbon::now()->year)
            ->distinct('date')
            ->count('date');

        $lastCheckIn = Attendance::where('member_id', $member->id)
            ->orderBy('id', 'desc')
            ->first();

        // Recent Payments - all subscriptions
        $allSubscriptions = Subscription::where('member_id', $member->id)
            ->pluck('id');
        
        $recentPayments = Payment::whereIn('subscription_id', $allSubscriptions)
            ->with('subscription.plan')
            ->latest('payment_date')
            ->limit(5)
            ->get();

        // Calculate days remaining
        $daysRemaining = null;
        $subscriptionStatus = 'none';
        if ($currentSubscription) {
            $endDate = Carbon::parse($currentSubscription->end_date);
            $now = Carbon::now();
            $daysRemaining = (int) $now->diffInDays($endDate, false);
            
            if ($daysRemaining < 0) {
                $subscriptionStatus = 'expired';
                $daysRemaining = abs($daysRemaining);
            } elseif ($daysRemaining <= 7) {
                $subscriptionStatus = 'expiring';
            } else {
                $subscriptionStatus = 'active';
            }
        }

        return Inertia::render('member/Dashboard', [
            'member' => $member->load('user'),
            'currentSubscription' => $currentSubscription,
            'daysRemaining' => $daysRemaining,
            'subscriptionStatus' => $subscriptionStatus,
            'attendanceThisMonth' => $attendanceThisMonth,
            'lastCheckIn' => $lastCheckIn,
            'recentPayments' => $recentPayments,
        ]);
    }

    public function attendance(Request $request)
    {
        // Check if user has member role
        if (!auth()->user()->hasPermission('view_member_dashboard')) {
            abort(403, 'Unauthorized. Member access only.');
        }

        $user = auth()->user();
        $member = Member::where('user_id', $user->id)->first();

        if (!$member) {
            abort(404, 'Member profile not found. Please contact admin.');
        }

        $year = $request->input('year', Carbon::now()->year);
        $month = $request->input('month', Carbon::now()->month);

        // Get all attendance dates for the selected month (unique dates)
        $attendances = Attendance::where('member_id', $member->id)
            ->whereYear('date', $year)
            ->whereMonth('date', $month)
            ->get()
            ->pluck('date')
            ->map(fn($date) => Carbon::parse($date)->format('Y-m-d'))
            ->unique()
            ->values()
            ->toArray();

        // Stats - count unique dates for this month
        $stats = [
            'total_this_month' => count($attendances),
            'total_all_time' => Attendance::where('member_id', $member->id)
                ->select('date')
                ->distinct()
                ->count(),
            'current_streak' => $this->calculateStreak($member->id),
        ];

        return Inertia::render('member/Attendance', [
            'member' => $member,
            'attendances' => $attendances,
            'stats' => $stats,
            'year' => $year,
            'month' => $month,
        ]);
    }

    public function orders(Request $request)
    {
        // Check if user has member role
        if (!auth()->user()->hasPermission('view_member_dashboard')) {
            abort(403, 'Unauthorized. Member access only.');
        }

        $user = auth()->user();
        $member = Member::where('user_id', $user->id)->first();

        if (!$member) {
            abort(404, 'Member profile not found. Please contact admin.');
        }

        // Get all subscriptions for this member
        $allSubscriptions = Subscription::where('member_id', $member->id)
            ->pluck('id');
        
        // Get all payments with pagination
        $payments = Payment::whereIn('subscription_id', $allSubscriptions)
            ->with(['subscription.plan'])
            ->orderBy('payment_date', 'desc')
            ->paginate(10);

        // Calculate stats
        $stats = [
            'total_spent' => Payment::whereIn('subscription_id', $allSubscriptions)
                ->where('status', 'completed')
                ->sum('amount'),
            'total_orders' => Payment::whereIn('subscription_id', $allSubscriptions)->count(),
            'pending_payments' => Payment::whereIn('subscription_id', $allSubscriptions)
                ->where('status', 'pending')
                ->count(),
        ];

        return Inertia::render('member/Orders', [
            'member' => $member,
            'payments' => $payments,
            'stats' => $stats,
        ]);
    }

    private function calculateStreak($memberId)
    {
        // Get unique attendance dates
        $attendances = Attendance::where('member_id', $memberId)
            ->select('date')
            ->distinct()
            ->orderBy('date', 'desc')
            ->pluck('date')
            ->map(fn($date) => Carbon::parse($date)->format('Y-m-d'))
            ->toArray();

        if (empty($attendances)) {
            return 0;
        }

        $streak = 1;
        $today = Carbon::today()->format('Y-m-d');
        $yesterday = Carbon::yesterday()->format('Y-m-d');

        // Check if last attendance is today or yesterday
        if ($attendances[0] !== $today && $attendances[0] !== $yesterday) {
            return 0;
        }

        for ($i = 0; $i < count($attendances) - 1; $i++) {
            $current = Carbon::parse($attendances[$i]);
            $next = Carbon::parse($attendances[$i + 1]);

            if ($current->diffInDays($next) === 1) {
                $streak++;
            } else {
                break;
            }
        }

        return $streak;
    }
}
