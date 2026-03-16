<?php

namespace App\Models;

// use App\Notifications\Events\PaymentReceivedEvent;
// use App\Services\NotificationService;
use Illuminate\Database\Eloquent\Model;

class Payment extends Model
{
    protected $fillable = [
        'subscription_id',
        'invoice_number',
        'amount',
        'payment_method',
        'payment_source',
        'payment_type',
        'payment_date',
        'status',
        'notes',
        'transaction_id',
    ];

    protected $casts = [
        'payment_date' => 'date',
        'amount' => 'decimal:2',
    ];

    protected static function boot()
    {
        parent::boot();
        
        static::creating(function ($payment) {
            if (!$payment->invoice_number) {
                $payment->invoice_number = self::generateInvoiceNumber();
            }
        });

        static::created(function ($payment) {
            if ($payment->status === 'completed') {
                \Log::info('Payment created, triggering activation', ['payment_id' => $payment->id, 'subscription_id' => $payment->subscription_id]);
                $payment->subscription->checkAndActivate();
            }
        });

        static::updated(function ($payment) {
            if ($payment->isDirty('status') && $payment->status === 'completed') {
                $payment->subscription->checkAndActivate();
            }
        });
    }



    public function subscription()
    {
        return $this->belongsTo(Subscription::class);
    }

    public function member()
    {
        return $this->hasOneThrough(
            Member::class,
            Subscription::class,
            'id',
            'id',
            'subscription_id',
            'member_id'
        );
    }

    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }

    public static function generateInvoiceNumber()
    {
        $lastPayment = self::latest('id')->first();
        $number = $lastPayment ? intval(substr($lastPayment->invoice_number, 4)) + 1 : 1;
        return 'INV-' . str_pad($number, 6, '0', STR_PAD_LEFT);
    }
}
