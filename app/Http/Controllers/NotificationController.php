<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use Illuminate\Http\Request;
use Inertia\Inertia;

class NotificationController extends Controller
{
    private function userNotificationsQuery()
    {
        $user     = auth()->user();
        $isMember = $user->isMember() && !$user->isAdmin();

        return Notification::forUser(
            $user->id,
            $isMember
        )->latest();
    }

    public function index(Request $request)
    {
        $perPage   = (int) $request->get('per_page', 15);
        $paginated = $this->userNotificationsQuery()->paginate($perPage);

        return Inertia::render('Notifications/Index', [
            'notifications' => [
                'data'  => $paginated->items(),
                'links' => $paginated->linkCollection(),
                'meta'  => [
                    'total'        => $paginated->total(),
                    'per_page'     => $paginated->perPage(),
                    'current_page' => $paginated->currentPage(),
                    'last_page'    => $paginated->lastPage(),
                ],
            ],
        ]);
    }

    public function getRecent(Request $request)
    {
        $notifications = $this->userNotificationsQuery()
            ->limit(10)
            ->get()
            ->map(fn($n) => [
                'id'         => $n->id,
                'type'       => $n->type,
                'title'      => $n->title,
                'message'    => $n->message,
                'data'       => $n->data,
                'priority'   => $n->priority,
                'color'      => $n->color,
                'read_at'    => $n->read_at,
                'created_at' => $n->created_at,
            ]);

        return response()->json($notifications);
    }

    public function getUnreadCount(Request $request)
    {
        $count = $this->userNotificationsQuery()->whereNull('read_at')->count();
        return response()->json(['count' => $count]);
    }

    public function markAsRead(Request $request, $id)
    {
        $notification = $this->userNotificationsQuery()->find($id);

        if ($notification) {
            $notification->update(['read_at' => now()]);
        }

        return response()->json(['success' => true]);
    }

    public function markAllAsRead(Request $request)
    {
        $this->userNotificationsQuery()->whereNull('read_at')->update(['read_at' => now()]);
        return response()->json(['success' => true]);
    }

    public function destroy(Request $request, $id)
    {
        $notification = $this->userNotificationsQuery()->find($id);

        if ($notification) {
            $notification->delete();
        }

        return response()->json(['success' => true]);
    }
}
