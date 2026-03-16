import { useEffect, useState } from 'react';
import { Bell, Check, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { usePage, Link } from '@inertiajs/react';

interface Notification {
    id: string;
    type: string;
    title: string;
    message: string;
    data?: Record<string, any>;
    priority: string;
    color: string;
    read_at?: string;
    created_at: string;
}

export default function NotificationCenter() {
    const { props } = usePage();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 10000);
        return () => clearInterval(interval);
    }, []);

    const getCsrfToken = () => {
        return (props as any).csrf_token || document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
    };

    const fetchNotifications = async () => {
        try {
            const [notificationsRes, countRes] = await Promise.all([
                fetch('/api/notifications/recent'),
                fetch('/api/notifications/unread-count'),
            ]);

            const notificationsData = await notificationsRes.json();
            const countData = await countRes.json();

            setNotifications(notificationsData);
            setUnreadCount(countData.count);
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        }
    };

    const markAsRead = async (id: string) => {
        try {
            const response = await fetch(`/api/notifications/${id}/read`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': getCsrfToken(),
                },
            });

            if (response.ok) fetchNotifications();
        } catch (error) {
            console.error('Failed to mark notification as read:', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            const response = await fetch('/api/notifications/mark-all-read', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': getCsrfToken(),
                },
            });

            if (response.ok) fetchNotifications();
        } catch (error) {
            console.error('Failed to mark all as read:', error);
        }
    };

    const formatTime = (date: string) => {
        const d = new Date(date);
        const now = new Date();
        const diff = now.getTime() - d.getTime();
        const mins = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        
        if (mins < 1) return 'now';
        if (mins < 60) return `${mins}m`;
        if (hours < 24) return `${hours}h`;
        return `${Math.floor(diff / 86400000)}d`;
    };

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                        </span>
                    )}
                </Button>
            </PopoverTrigger>
            
            <PopoverContent className="w-96 p-0 mr-4" align="end" sideOffset={8}>
                <div className="flex items-center justify-between px-4 py-3 border-b">
                    <div className="flex items-center gap-2">
                        <h4 className="font-semibold leading-none">Notifications</h4>
                        {unreadCount > 0 && (
                            <Badge variant="secondary" className="px-1.5 rounded-sm">{unreadCount} new</Badge>
                        )}
                    </div>
                    {unreadCount > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground"
                            onClick={markAllAsRead}
                        >
                            Mark all read
                        </Button>
                    )}
                </div>
                
                <div className="max-h-[350px] overflow-y-auto w-full flex flex-col hide-scrollbar">
                    {notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-8 text-center px-4">
                            <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center mb-3">
                                <Bell className="h-5 w-5 text-muted-foreground/50" />
                            </div>
                            <p className="text-sm font-medium text-foreground">All caught up!</p>
                            <p className="text-xs text-muted-foreground mt-1">No new notifications.</p>
                        </div>
                    ) : (
                        notifications.map(notification => (
                            <div
                                key={notification.id}
                                className={`group flex gap-3 px-4 py-3 text-sm transition-colors border-b last:border-0 relative ${
                                    !notification.read_at ? 'bg-primary/5 hover:bg-primary/10' : 'hover:bg-muted/50'
                                }`}
                            >
                                {!notification.read_at && (
                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />
                                )}
                                <div className="flex-1 space-y-1">
                                    <div className="flex items-start justify-between gap-2">
                                        <p className="font-medium leading-none truncate">
                                            {notification.title}
                                        </p>
                                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                                            {formatTime(notification.created_at)}
                                        </span>
                                    </div>
                                    <p className="text-xs text-muted-foreground line-clamp-2">
                                        {notification.message}
                                    </p>
                                </div>
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-1 items-end">
                                    {!notification.read_at && (
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-6 w-6"
                                            onClick={(e) => { e.preventDefault(); markAsRead(notification.id); }}
                                            title="Mark as read"
                                        >
                                            <Check className="h-3 w-3" />
                                        </Button>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
                <div className="p-2 border-t text-center">
                    <Link 
                        href="/notifications" 
                        onClick={() => setIsOpen(false)}
                        className="text-xs font-medium text-primary hover:underline"
                    >
                        View all notifications
                    </Link>
                </div>
            </PopoverContent>
        </Popover>
    );
}
