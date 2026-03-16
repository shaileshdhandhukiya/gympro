<?php

namespace App\Services;

use App\Models\Member;
use App\Models\Payment;
use App\Models\Subscription;
use App\Models\Attendance;
use App\Models\Plan;
use App\Models\Expense;
use App\Models\Equipment;
use App\Exports\ReportsExport;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use Excel;

class ReportService
{
    /**
     * Generate comprehensive reports
     */
    public function generateReports(array $filters = []): array
    {
        $startDate = $filters['start_date'] ?? Carbon::now()->startOfMonth()->toDateString();
        $endDate = $filters['end_date'] ?? Carbon::now()->toDateString();

        return [
            'revenueStats' => $this->getRevenueStats($startDate, $endDate),
            'attendanceStats' => $this->getAttendanceStats($startDate, $endDate),
            'memberStats' => $this->getMemberStats(),
            'subscriptionStats' => $this->getSubscriptionStats(),
            'planStats' => $this->getPlanStats($startDate, $endDate),
            'expenseStats' => $this->getExpenseStats($startDate, $endDate),
            'equipmentStats' => $this->getEquipmentStats(),
        ];
    }

    /**
     * Get revenue statistics
     */
    private function getRevenueStats(string $startDate, string $endDate): array
    {
        $paymentQuery = Payment::where('status', 'completed')
            ->whereBetween('payment_date', [$startDate, $endDate]);

        return [
            'total' => $paymentQuery->sum('amount'),
            'by_method' => (clone $paymentQuery)->selectRaw('payment_method, SUM(amount) as total, COUNT(*) as count')
                ->groupBy('payment_method')
                ->get(),
            'by_type' => (clone $paymentQuery)->selectRaw('payment_type, SUM(amount) as total, COUNT(*) as count')
                ->groupBy('payment_type')
                ->get(),
            'daily' => (clone $paymentQuery)->selectRaw('DATE(payment_date) as date, SUM(amount) as total')
                ->groupBy('date')
                ->orderBy('date')
                ->get(),
        ];
    }

    /**
     * Get attendance statistics
     */
    private function getAttendanceStats(string $startDate, string $endDate): array
    {
        $attendanceQuery = Attendance::whereBetween('date', [$startDate, $endDate]);

        return [
            'total' => $attendanceQuery->count(),
            'unique_members' => (clone $attendanceQuery)->distinct('member_id')->count('member_id'),
            'avg_daily' => round((clone $attendanceQuery)->selectRaw('DATE(date) as date, COUNT(*) as count')
                ->groupBy('date')
                ->get()
                ->avg('count'), 2),
            'daily' => (clone $attendanceQuery)->selectRaw('DATE(date) as date, COUNT(*) as count')
                ->groupBy('date')
                ->orderBy('date')
                ->get(),
            'peak_hours' => (clone $attendanceQuery)->selectRaw('HOUR(check_in_time) as hour, COUNT(*) as count')
                ->groupBy('hour')
                ->orderBy('count', 'desc')
                ->get(),
        ];
    }

    /**
     * Get member statistics
     */
    private function getMemberStats(): array
    {
        return [
            'total' => Member::count(),
            'active' => Member::where('status', 'active')->count(),
            'inactive' => Member::where('status', 'inactive')->count(),
            'expired' => Member::where('status', 'expired')->count(),
            'new' => Member::whereBetween('join_date', [
                Carbon::now()->startOfMonth(),
                Carbon::now()->endOfMonth()
            ])->count(),
            'by_gender' => Member::selectRaw('gender, COUNT(*) as count')
                ->groupBy('gender')
                ->get(),
            'age_distribution' => $this->getMemberAgeDistribution(),
        ];
    }

    /**
     * Get subscription statistics
     */
    private function getSubscriptionStats(): array
    {
        return [
            'total' => Subscription::count(),
            'active' => Subscription::where('status', 'active')->count(),
            'expired' => Subscription::where('status', 'expired')->count(),
            'cancelled' => Subscription::where('status', 'cancelled')->count(),
            'pending' => Subscription::where('status', 'pending')->count(),
            'expiring_soon' => Subscription::where('status', 'active')
                ->whereBetween('end_date', [Carbon::now(), Carbon::now()->addDays(7)])
                ->count(),
            'by_plan' => Subscription::join('plans', 'subscriptions.plan_id', '=', 'plans.id')
                ->selectRaw('plans.name, COUNT(subscriptions.id) as count')
                ->groupBy('plans.id', 'plans.name')
                ->get()
                ->map(fn($s) => ['name' => $s->name, 'count' => $s->count]),
            'monthly_trends' => $this->getSubscriptionTrends(),
        ];
    }

    /**
     * Get plan statistics
     */
    private function getPlanStats(string $startDate, string $endDate): array
    {
        return [
            'total' => Plan::count(),
            'active' => Plan::where('status', 'active')->count(),
            'popular' => Subscription::with('plan')
                ->whereBetween('start_date', [$startDate, $endDate])
                ->selectRaw('plan_id, COUNT(*) as count')
                ->groupBy('plan_id')
                ->orderByDesc('count')
                ->limit(5)
                ->get()
                ->map(fn($s) => ['name' => $s->plan?->name ?? 'Unknown', 'count' => $s->count]),
            'revenue_by_plan' => $this->getRevenueByPlan($startDate, $endDate),
        ];
    }

    /**
     * Get expense statistics
     */
    private function getExpenseStats(string $startDate, string $endDate): array
    {
        $expenseQuery = Expense::whereBetween('expense_date', [$startDate, $endDate]);

        return [
            'total' => $expenseQuery->sum('amount'),
            'by_category' => (clone $expenseQuery)->selectRaw('category, SUM(amount) as total, COUNT(*) as count')
                ->groupBy('category')
                ->get(),
            'monthly' => (clone $expenseQuery)->selectRaw('DATE_FORMAT(expense_date, "%Y-%m") as month, SUM(amount) as total')
                ->groupBy('month')
                ->orderBy('month')
                ->get(),
            'recent' => (clone $expenseQuery)->orderBy('expense_date', 'desc')
                ->limit(10)
                ->get(),
        ];
    }

    /**
     * Get equipment statistics
     */
    private function getEquipmentStats(): array
    {
        return [
            'total' => Equipment::count(),
            'active' => Equipment::where('status', 'active')->count(),
            'maintenance' => Equipment::where('status', 'maintenance')->count(),
            'by_category' => Equipment::selectRaw('category, COUNT(*) as count, SUM(quantity) as total_quantity')
                ->groupBy('category')
                ->get(),
            'total_value' => Equipment::sum(DB::raw('purchase_price * quantity')),
        ];
    }

    /**
     * Get member age distribution
     */
    private function getMemberAgeDistribution(): array
    {
        return Member::selectRaw('
                TIMESTAMPDIFF(YEAR, date_of_birth, CURDATE()) as age,
                COUNT(*) as count
            ')
            ->whereNotNull('date_of_birth')
            ->groupBy('age')
            ->orderBy('age')
            ->get()
            ->map(function ($item) {
                $ageGroup = match(true) {
                    $item->age < 18 => 'Under 18',
                    $item->age < 25 => '18-24',
                    $item->age < 35 => '25-34',
                    $item->age < 45 => '35-44',
                    $item->age < 55 => '45-54',
                    $item->age < 65 => '55-64',
                    default => '65+'
                };
                return [
                    'age_group' => $ageGroup,
                    'count' => $item->count,
                ];
            })
            ->groupBy('age_group')
            ->map(function ($group) {
                return $group->sum('count');
            })
            ->toArray();
    }

    /**
     * Get subscription trends
     */
    private function getSubscriptionTrends(): Collection
    {
        return Subscription::selectRaw('DATE_FORMAT(created_at, "%Y-%m") as month, COUNT(*) as count')
            ->where('created_at', '>=', Carbon::now()->subMonths(12))
            ->groupBy('month')
            ->orderBy('month')
            ->get();
    }

    /**
     * Get revenue by plan
     */
    private function getRevenueByPlan(string $startDate, string $endDate): Collection
    {
        return Payment::join('subscriptions', 'payments.subscription_id', '=', 'subscriptions.id')
            ->join('plans', 'subscriptions.plan_id', '=', 'plans.id')
            ->where('payments.status', 'completed')
            ->whereBetween('payments.payment_date', [$startDate, $endDate])
            ->selectRaw('plans.name, SUM(payments.amount) as revenue, COUNT(payments.id) as payment_count')
            ->groupBy('plans.id', 'plans.name')
            ->orderByDesc('revenue')
            ->get();
    }

    /**
     * Export reports to Excel
     */
    public function exportReports(string $type, string $startDate, string $endDate)
    {
        return Excel::download(new ReportsExport($type, $startDate, $endDate), "report-{$type}-{$startDate}-to-{$endDate}.xlsx");
    }

    /**
     * Get dashboard summary
     */
    public function getDashboardSummary(): array
    {
        $today = Carbon::today();
        $thisMonth = Carbon::now()->startOfMonth();

        return [
            'members' => [
                'total' => Member::count(),
                'active' => Member::where('status', 'active')->count(),
                'new_this_month' => Member::where('join_date', '>=', $thisMonth)->count(),
            ],
            'subscriptions' => [
                'total' => Subscription::count(),
                'active' => Subscription::where('status', 'active')->count(),
                'expiring_soon' => Subscription::where('status', 'active')
                    ->whereBetween('end_date', [Carbon::now(), Carbon::now()->addDays(7)])
                    ->count(),
            ],
            'revenue' => [
                'this_month' => Payment::where('status', 'completed')
                    ->where('payment_date', '>=', $thisMonth)
                    ->sum('amount'),
                'today' => Payment::where('status', 'completed')
                    ->whereDate('payment_date', $today)
                    ->sum('amount'),
            ],
            'attendance' => [
                'today' => Attendance::whereDate('date', $today)->count(),
                'this_month_avg' => round(Attendance::where('date', '>=', $thisMonth)
                    ->selectRaw('DATE(date) as date, COUNT(*) as count')
                    ->groupBy('date')
                    ->get()
                    ->avg('count'), 2),
            ],
            'expenses' => [
                'this_month' => Expense::where('expense_date', '>=', $thisMonth)->sum('amount'),
            ],
        ];
    }

    /**
     * Get custom report data
     */
    public function getCustomReport(array $config): array
    {
        $data = [];

        if (in_array('members', $config['modules'])) {
            $data['members'] = $this->getMemberStats();
        }

        if (in_array('revenue', $config['modules'])) {
            $data['revenue'] = $this->getRevenueStats(
                $config['start_date'] ?? Carbon::now()->startOfMonth()->toDateString(),
                $config['end_date'] ?? Carbon::now()->toDateString()
            );
        }

        if (in_array('attendance', $config['modules'])) {
            $data['attendance'] = $this->getAttendanceStats(
                $config['start_date'] ?? Carbon::now()->startOfMonth()->toDateString(),
                $config['end_date'] ?? Carbon::now()->toDateString()
            );
        }

        if (in_array('expenses', $config['modules'])) {
            $data['expenses'] = $this->getExpenseStats(
                $config['start_date'] ?? Carbon::now()->startOfMonth()->toDateString(),
                $config['end_date'] ?? Carbon::now()->toDateString()
            );
        }

        return $data;
    }
}
