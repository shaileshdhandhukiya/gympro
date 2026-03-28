<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Carbon\Carbon;

class Attendance extends Model
{
    protected $fillable = [
        'member_id',
        'date',
        'check_in_time',
        'check_out_time',
        'duration',
        'notes',
    ];

    protected $casts = [
        'date' => 'date',
    ];

    public function member(): BelongsTo
    {
        return $this->belongsTo(Member::class);
    }

    /**
     * Calculate and update duration when check_out_time is set
     */
    public function calculateDuration(): void
    {
        if ($this->check_in_time && $this->check_out_time) {
            $checkIn = Carbon::parse($this->date->format('Y-m-d') . ' ' . $this->check_in_time);
            $checkOut = Carbon::parse($this->date->format('Y-m-d') . ' ' . $this->check_out_time);
            $this->duration = $checkOut->diffInMinutes($checkIn);
            $this->save();
        }
    }
}
