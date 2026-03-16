<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;
use App\Notifications\Channels\CustomDatabaseChannel;

class PaymentConfirmedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    private array $payload;

    public function __construct(array $payload)
    {
        $this->payload = $payload;
    }

    public function via($notifiable)
    {
        return [CustomDatabaseChannel::class];
    }

    public function toDatabase($notifiable)
    {
        $amount = $this->payload['amount'] ?? 0;
        $planName = $this->payload['plan_name'] ?? 'Plan';

        return [
            'type'     => 'payment_confirmed',
            'title'    => 'Payment Confirmed',
            'message'  => "Your payment of ₹{$amount} for {$planName} was successful.",
            'data'     => $this->payload,
            'priority' => 'normal',
            'color'    => '#10b981', // green
        ];
    }
}
