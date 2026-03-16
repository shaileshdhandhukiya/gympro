<?php

namespace App\Notifications\Events;

class PaymentConfirmedEvent extends NotificationEvent
{
    public function getNotificationData(): array
    {
        return [
            'type'     => 'payment_confirmed',
            'title'    => 'Payment Confirmed',
            'message'  => "Your payment of ₹{$this->data['amount']} for {$this->data['plan_name']} has been confirmed.",
            'data'     => [
                'subscription_id' => $this->data['subscription_id'],
                'payment_id'      => $this->data['payment_id'] ?? null,
                'amount'          => $this->data['amount'],
            ],
            'priority' => 'high',
            'color'    => '#10b981',
        ];
    }

    public function getPreferredChannels(): array
    {
        return ['push', 'email'];
    }
}
