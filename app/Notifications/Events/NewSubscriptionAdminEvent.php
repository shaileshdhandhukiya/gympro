<?php

namespace App\Notifications\Events;

class NewSubscriptionAdminEvent extends NotificationEvent
{
    public function getNotificationData(): array
    {
        return [
            'type'     => 'new_subscription',
            'title'    => 'New Subscription',
            'message'  => "New subscription purchased: {$this->data['plan_name']} by {$this->data['member_name']} (₹{$this->data['amount']})",
            'data'     => [
                'subscription_id' => $this->data['subscription_id'],
                'payment_id'      => $this->data['payment_id'] ?? null,
                'amount'          => $this->data['amount'],
                'member_name'     => $this->data['member_name'],
            ],
            'priority' => 'high',
            'color'    => '#3b82f6',
        ];
    }

    public function getPreferredChannels(): array
    {
        return ['push', 'email'];
    }
}
