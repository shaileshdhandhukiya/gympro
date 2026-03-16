<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;
use App\Notifications\Channels\CustomDatabaseChannel;

class SubscriptionExpiringNotification extends Notification implements ShouldQueue
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
        $planName = $this->payload['plan_name'] ?? 'your plan';
        $endDate = $this->payload['end_date'] ?? 'soon';

        return [
            'type'     => 'subscription_expiring',
            'title'    => 'Subscription Expiring Soon',
            'message'  => "Your subscription for {$planName} is expiring on {$endDate}. Please renew soon to avoid interruption.",
            'data'     => $this->payload,
            'priority' => 'high',
            'color'    => '#f59e0b', // amber
        ];
    }
}
