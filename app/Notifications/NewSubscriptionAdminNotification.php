<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;
use App\Notifications\Channels\CustomDatabaseChannel;

class NewSubscriptionAdminNotification extends Notification implements ShouldQueue
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
        $memberName = $this->payload['member_name'] ?? 'A member';
        $planName = $this->payload['plan_name'] ?? 'a plan';
        $amount = $this->payload['amount'] ?? 0;

        return [
            'type'     => 'admin_subscription_created',
            'title'    => 'New Subscription Purchased',
            'message'  => "{$memberName} has purchased {$planName} for ₹{$amount}.",
            'data'     => $this->payload,
            'priority' => 'high',
            'color'    => '#3b82f6', // blue
        ];
    }
}
