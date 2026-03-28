<?php

namespace App\Services;

use App\Models\Attendance;
use App\Models\Member;
use Illuminate\Database\Eloquent\Collection;
use Carbon\Carbon;

class AttendanceService
{
    /**
     * Get attendance data for a specific date or month
     */
    public function getAttendance(array $filters = []): array
    {
        $date = $filters['date'] ?? null;
        $month = $filters['month'] ?? null;

        if ($month) {
            return $this->getMonthlyAttendance($month);
        }

        $date = $date ?? Carbon::today()->toDateString();
        return $this->getDailyAttendance($date);
    }

    /**
     * Get daily attendance
     */
    private function getDailyAttendance(string $date): array
    {
        $attendances = Attendance::with('member.user')
            ->whereDate('date', $date)
            ->latest('check_in_time')
            ->get();

        $stats = [
            'today_count' => Attendance::whereDate('date', Carbon::today())->count(),
            'checked_in' => Attendance::whereDate('date', Carbon::today())
                ->whereNull('check_out_time')
                ->count(),
        ];

        return [
            'attendances' => $attendances,
            'monthlyData' => null,
            'daysInMonth' => null,
            'members' => Member::with('user')->where('status', 'active')->get(),
            'stats' => $stats,
            'selectedDate' => $date,
            'selectedMonth' => null,
        ];
    }

    /**
     * Get monthly attendance view
     */
    private function getMonthlyAttendance(string $month): array
    {
        $year = Carbon::parse($month)->year;
        $monthNum = Carbon::parse($month)->month;
        $daysInMonth = Carbon::parse($month)->daysInMonth;

        $attendances = Attendance::with('member.user')
            ->whereYear('date', $year)
            ->whereMonth('date', $monthNum)
            ->get()
            ->groupBy('member_id');

        $members = Member::with('user')->where('status', 'active')->get();

        $monthlyData = $members->map(function ($member) use ($attendances, $year, $monthNum, $daysInMonth) {
            $memberAttendances = $attendances->get($member->id, collect());
            $dates = [];

            for ($day = 1; $day <= $daysInMonth; $day++) {
                $dateString = Carbon::create($year, $monthNum, $day)->toDateString();
                $isPresent = $memberAttendances->contains(function ($attendance) use ($dateString) {
                    return Carbon::parse($attendance->date)->toDateString() === $dateString;
                });
                $dates[$day] = $isPresent ? 'present' : 'absent';
            }

            return [
                'member' => $member,
                'dates' => $dates,
                'total_present' => collect($dates)->filter(fn($v) => $v === 'present')->count(),
            ];
        });

        $stats = [
            'today_count' => Attendance::whereDate('date', Carbon::today())->count(),
            'checked_in' => Attendance::whereDate('date', Carbon::today())
                ->whereNull('check_out_time')
                ->count(),
        ];

        return [
            'attendances' => [],
            'monthlyData' => $monthlyData,
            'daysInMonth' => $daysInMonth,
            'members' => $members,
            'stats' => $stats,
            'selectedDate' => null,
            'selectedMonth' => $month,
        ];
    }

    /**
     * Record manual attendance
     */
    public function recordAttendance(array $data): Attendance
    {
        $data['check_in_time'] = Carbon::parse($data['check_in_time'])->format('H:i:s');

        return Attendance::create($data);
    }

    /**
     * Update attendance record
     */
    public function updateAttendance(Attendance $attendance, array $data): Attendance
    {
        if (isset($data['check_in_time'])) {
            $data['check_in_time'] = Carbon::parse($data['check_in_time'])->format('H:i:s');
        }

        if (isset($data['check_out_time']) && $data['check_out_time']) {
            $data['check_out_time'] = Carbon::parse($data['check_out_time'])->format('H:i:s');
        }

        $attendance->update($data);
        
        // Calculate duration if both times are present
        if ($attendance->check_in_time && $attendance->check_out_time) {
            $attendance->calculateDuration();
        }
        
        return $attendance->fresh(['member.user']);
    }

    /**
     * Delete attendance record
     */
    public function deleteAttendance(Attendance $attendance): bool
    {
        return $attendance->delete();
    }

    /**
     * Handle QR code check-in/check-out (SESSION-BASED)
     */
    public function handleQrCheckIn(int $memberId, ?int $userId = null): array
    {
        // If user is authenticated and has member dashboard permission,
        // they can only check-in themselves
        if ($userId && auth()->user()->hasPermission('view_member_dashboard')) {
            $member = Member::where('user_id', $userId)->first();
            if (!$member || $member->id != $memberId) {
                return [
                    'success' => false,
                    'message' => 'Unauthorized. You can only check-in yourself.',
                    'type' => 'error'
                ];
            }
        }

        // Get the LAST attendance record for this member (regardless of date)
        $lastRecord = Attendance::where('member_id', $memberId)
            ->orderBy('id', 'desc')
            ->first();

        // CASE 2: Last record exists AND check_out IS NULL
        if ($lastRecord && !$lastRecord->check_out_time) {
            // User is currently checked in, so CHECK OUT
            $lastRecord->update(['check_out_time' => Carbon::now()->format('H:i:s')]);
            $lastRecord->calculateDuration();
            
            return [
                'success' => true,
                'message' => 'Checked out successfully',
                'type' => 'checkout',
                'attendance' => $lastRecord->fresh(['member.user'])
            ];
        }

        // CASE 1 & 3: No record exists OR last record has check_out
        // Create NEW check-in session
        $attendance = Attendance::create([
            'member_id' => $memberId,
            'date' => Carbon::today(),
            'check_in_time' => Carbon::now()->format('H:i:s'),
        ]);

        return [
            'success' => true,
            'message' => 'Checked in successfully',
            'type' => 'checkin',
            'attendance' => $attendance->fresh(['member.user'])
        ];
    }

    /**
     * Get attendance reports
     */
    public function getAttendanceReports(array $filters = []): array
    {
        $type = $filters['type'] ?? 'daily';
        $startDate = $filters['start_date'] ?? Carbon::today()->toDateString();
        $endDate = $filters['end_date'] ?? Carbon::today()->toDateString();

        $attendances = Attendance::with('member')
            ->whereBetween('date', [$startDate, $endDate])
            ->get();

        $peakHours = Attendance::whereBetween('date', [$startDate, $endDate])
            ->selectRaw('HOUR(check_in_time) as hour, COUNT(*) as count')
            ->groupBy('hour')
            ->orderBy('count', 'desc')
            ->get();

        $stats = [
            'total' => $attendances->count(),
            'unique_members' => $attendances->unique('member_id')->count(),
            'avg_per_day' => $attendances->count() / max(1, Carbon::parse($startDate)->diffInDays($endDate) + 1),
        ];

        return [
            'attendances' => $attendances,
            'peakHours' => $peakHours,
            'stats' => $stats,
        ];
    }

    /**
     * Get member attendance history
     */
    public function getMemberAttendanceHistory(int $memberId, int $limit = 30): Collection
    {
        return Attendance::where('member_id', $memberId)
            ->orderBy('date', 'desc')
            ->orderBy('id', 'desc')
            ->limit($limit)
            ->get();
    }

    /**
     * Get last attendance session for a member
     */
    public function getLastAttendanceSession(int $memberId): ?Attendance
    {
        return Attendance::where('member_id', $memberId)
            ->orderBy('id', 'desc')
            ->first();
    }

    /**
     * Get attendance statistics for dashboard
     */
    public function getAttendanceStats(): array
    {
        $today = Carbon::today();
        $thisWeek = Carbon::now()->startOfWeek();
        $thisMonth = Carbon::now()->startOfMonth();

        return [
            'today' => [
                'total' => Attendance::whereDate('date', $today)->count(),
                'checked_in' => Attendance::whereDate('date', $today)->whereNull('check_out_time')->count(),
            ],
            'this_week' => [
                'total' => Attendance::whereBetween('date', [$thisWeek, $today])->count(),
                'avg_daily' => round(Attendance::whereBetween('date', [$thisWeek, $today])
                    ->selectRaw('DATE(date) as date, COUNT(*) as count')
                    ->groupBy('date')
                    ->get()
                    ->avg('count'), 2),
            ],
            'this_month' => [
                'total' => Attendance::whereBetween('date', [$thisMonth, $today])->count(),
                'avg_daily' => round(Attendance::whereBetween('date', [$thisMonth, $today])
                    ->selectRaw('DATE(date) as date, COUNT(*) as count')
                    ->groupBy('date')
                    ->get()
                    ->avg('count'), 2),
            ],
        ];
    }

    /**
     * Get validation rules for attendance
     */
    public function getValidationRules(): array
    {
        return [
            'member_id' => 'required|exists:members,id',
            'date' => 'required|date',
            'check_in_time' => 'required',
            'check_out_time' => 'nullable',
            'notes' => 'nullable|string',
        ];
    }
}
