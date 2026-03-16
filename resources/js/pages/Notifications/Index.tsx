import { Head, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { toast } from 'sonner';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bell, Check, Trash2, Archive, Clock } from 'lucide-react';
import { type BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Notifications', href: '/notifications' },
];

interface Notification {
    id: string;
    type: string;
    title: string;
    message: string;
    priority: string;
    read_at?: string;
    created_at: string;
    color?: string;
}

interface Props {
    notifications: {
        data: Notification[];
        links: any[];
        meta: {
            total: number;
            per_page: number;
            current_page: number;
            last_page: number;
        };
    };
}

export default function NotificationsIndex({ notifications }: Props) {
    const { props } = usePage();
    const [isLoading, setIsLoading] = useState(false);

    const getCsrfToken = () => (props as any).csrf_token || '';

    const markAsRead = async (id: string) => {
        setIsLoading(true);
        try {
            await fetch(`/api/notifications/${id}/read`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': getCsrfToken(),
                },
            });
            toast.success('Marked as read');
            router.reload();
        } catch {
            toast.error('Failed to mark as read');
        } finally {
            setIsLoading(false);
        }
    };

    const deleteNotification = async (id: string) => {
        setIsLoading(true);
        try {
            await fetch(`/api/notifications/${id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': getCsrfToken(),
                },
            });
            toast.success('Deleted');
            router.reload();
        } catch {
            toast.error('Failed to delete');
        } finally {
            setIsLoading(false);
        }
    };

    const markAllAsRead = async () => {
        setIsLoading(true);
        try {
            await fetch('/api/notifications/mark-all-read', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': getCsrfToken(),
                },
            });
            toast.success('All marked as read');
            router.reload();
        } catch {
            toast.error('Failed');
        } finally {
            setIsLoading(false);
        }
    };

    const hasUnread = notifications.data.some(n => !n.read_at);
    const formatTime = (date: string) => {
        const d = new Date(date);
        const now = new Date();
        const diff = now.getTime() - d.getTime();
        const mins = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        
        if (mins < 1) return 'just now';
        if (mins < 60) return `${mins}m ago`;
        if (hours < 24) return `${hours}h ago`;
        
        return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    // Grouping
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const isToday = (date: string) => new Date(date).getTime() >= today.getTime();
    const isYesterday = (date: string) => {
        const d = new Date(date).getTime();
        return d >= yesterday.getTime() && d < today.getTime();
    };

    const groupedNotifications = {
        today: notifications.data.filter(n => isToday(n.created_at)),
        yesterday: notifications.data.filter(n => isYesterday(n.created_at)),
        older: notifications.data.filter(n => !isToday(n.created_at) && !isYesterday(n.created_at)),
    };

    const renderGroup = (title: string, group: Notification[]) => {
        if (group.length === 0) return null;

        return (
            <div className="mb-6 space-y-3">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider pl-1">{title}</h3>
                <Card className="overflow-hidden border-2 shadow-sm rounded-xl py-0">
                    <CardContent className="p-0 flex flex-col divide-y">
                        {group.map((notification) => (
                            <div
                                key={notification.id}
                                className={`flex items-start gap-4 p-5 transition-all duration-200 group relative ${
                                    !notification.read_at
                                        ? 'bg-blue-50/50 dark:bg-blue-950/20'
                                        : 'bg-card hover:bg-muted/50'
                                }`}
                            >
                                {/* Indicator line for unread */}
                                {!notification.read_at && (
                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600 rounded-l-xl" />
                                )}

                                {/* Icon based on priority/color */}
                                <div className={`mt-1 flex items-center justify-center h-10 w-10 rounded-full bg-background border flex-shrink-0 shadow-sm`} style={{ borderColor: notification.color || '#e2e8f0', color: notification.color || '#3b82f6' }}>
                                    <Bell className="h-5 w-5" />
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0 pr-10">
                                    <div className="flex items-start justify-between gap-3 mb-1">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <p className={`font-semibold text-base leading-tight ${!notification.read_at ? 'text-foreground' : 'text-muted-foreground'}`}>
                                                {notification.title}
                                            </p>
                                            {notification.priority === 'high' && (
                                                <Badge variant="destructive" className="h-5 text-[10px] uppercase font-bold px-1.5">High</Badge>
                                            )}
                                        </div>
                                    </div>
                                    <p className={`text-sm mb-2 ${!notification.read_at ? 'text-foreground/90' : 'text-muted-foreground'} pr-4`}>
                                        {notification.message}
                                    </p>
                                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                        <Clock className="h-3 w-3" />
                                        <span>{formatTime(notification.created_at)}</span>
                                        {title === 'Older' && <span>• {new Date(notification.created_at).toLocaleDateString()}</span>}
                                    </div>
                                </div>

                                {/* Actions - fade in on group hover */}
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity bg-background/80 backdrop-blur-sm p-1.5 rounded-lg border shadow-sm">
                                    {!notification.read_at && (
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => markAsRead(notification.id)}
                                            disabled={isLoading}
                                            className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                            title="Mark as read"
                                        >
                                            <Check className="h-4 w-4" />
                                        </Button>
                                    )}
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => deleteNotification(notification.id)}
                                        disabled={isLoading}
                                        className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                        title="Delete"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Notifications" />

            <div className="max-w-4xl mx-auto px-4 py-10">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-primary/10 rounded-xl">
                            <Bell className="h-8 w-8 text-primary" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-extrabold tracking-tight">Notifications</h1>
                            <p className="text-muted-foreground mt-1 text-sm font-medium">
                                You have {notifications.data.filter(n => !n.read_at).length} unread out of {notifications.meta.total} total
                            </p>
                        </div>
                    </div>
                    {hasUnread && (
                        <Button
                            variant="secondary"
                            onClick={markAllAsRead}
                            disabled={isLoading}
                            className="shadow-sm font-medium"
                        >
                            <Check className="h-4 w-4 mr-2" />
                            Mark all as read
                        </Button>
                    )}
                </div>

                {/* Notifications List */}
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {notifications.data.length === 0 ? (
                        <Card className="border-dashed shadow-none py-16">
                            <CardContent className="flex flex-col items-center justify-center text-center">
                                <div className="p-4 bg-muted/50 rounded-full mb-4">
                                    <Bell className="h-10 w-10 text-muted-foreground opacity-30" />
                                </div>
                                <h3 className="text-lg font-semibold mb-1">You're all caught up!</h3>
                                <p className="text-muted-foreground max-w-sm">
                                    When you get important updates, activity, or mentions, they'll show up here.
                                </p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div>
                            {renderGroup('Today', groupedNotifications.today)}
                            {renderGroup('Yesterday', groupedNotifications.yesterday)}
                            {renderGroup('Older', groupedNotifications.older)}
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {notifications.meta.last_page > 1 && (
                    <div className="flex justify-center gap-2 mt-10">
                        {notifications.links.map((link: any, index: number) => (
                            <Button
                                key={index}
                                variant={link.active ? 'default' : 'outline'}
                                size="icon"
                                disabled={!link.url}
                                onClick={() => link.url && router.visit(link.url)}
                                className={link.active ? 'shadow-md' : ''}
                            >
                                <span dangerouslySetInnerHTML={{ __html: link.label.replace(/&laquo;|&raquo;/g, '').trim() || '...' }} />
                            </Button>
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
