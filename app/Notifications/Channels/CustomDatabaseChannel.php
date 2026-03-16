<?php

namespace App\Notifications\Channels;

use Illuminate\Notifications\Notification;
use App\Models\Notification as NotificationModel;

class CustomDatabaseChannel
{
    /**
     * Send the given notification.
     *
     * @param  mixed  $notifiable
     * @param  \Illuminate\Notifications\Notification  $notification
     * @return void
     */
    public function send($notifiable, Notification $notification)
    {
        $data = $notification->toDatabase($notifiable);

        NotificationModel::create([
            'user_id'  => $notifiable->id ?? null,
            'type'     => $data['type'] ?? get_class($notification),
            'title'    => $data['title'] ?? 'Notification',
            'message'  => $data['message'] ?? '',
            'data'     => $data['data'] ?? null,
            'priority' => $data['priority'] ?? 'normal',
            'icon'     => $data['icon'] ?? null,
            'color'    => $data['color'] ?? '#3b82f6',
        ]);
    }
}
