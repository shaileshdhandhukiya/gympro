<?php

namespace App\Models;

// use App\Notifications\Events\SubscriptionCreatedEvent;
// use App\Notifications\Events\SubscriptionExpiredEvent;
// use App\Services\NotificationService;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\Log;

class Subscription extends Model
{
    protected $fillable = [
        'member_id',
        'plan_id',
        'trainer_id',
        'start_date',
        'end_date',
        'status',
        'notes',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
    ];

    protected $appends = ['total_paid', 'payment_status'];

    public function member(): BelongsTo
    {
        return $this->belongsTo(Member::class);
    }

    public function plan(): BelongsTo
    {
        return $this->belongsTo(Plan::class);
    }

    public function trainer(): BelongsTo
    {
        return $this->belongsTo(Trainer::class);
    }

    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }

    protected static function booted()
    {
        static::created(function (self $subscription) {
            // Notifications are now handled by service layer after commit
        });

        static::updating(function (self $subscription) {
            // Expiration notifications are now handled by service layer or scheduled commands
        });
    }



    // Computed attributes
    public function getTotalPaidAttribute()
    {
        return $this->payments()->where('status', 'completed')->sum('amount');
    }

    public function getPaymentStatusAttribute()
    {
        $totalPaid = $this->total_paid;

        if (!$this->relationLoaded('plan')) {
            $this->load('plan');
        }

        // Compare against plan price only — admission fee is tracked as a
        // separate payment_type='admission' and may not apply to renewals
        $totalRequired = $this->plan->price ?? 0;

        if ($totalPaid >= $totalRequired) return 'paid';
        if ($totalPaid > 0) return 'partial';
        if ($this->end_date < now()) return 'overdue';
        return 'pending';
    }

    public function checkAndActivate()
    {
        // Only relevant for manually-created subscriptions starting as 'pending'
        if ($this->status !== 'pending') {
            return;
        }

        $this->refresh();
        $this->load('plan', 'payments');

        if ($this->payment_status === 'paid') {
            $this->update(['status' => 'active']);
            Log::info('Subscription activated', ['subscription_id' => $this->id]);
        }
    }
}
