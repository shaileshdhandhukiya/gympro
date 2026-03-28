import { Head, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { toast } from 'sonner';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bell, Check, Trash2, Clock, CheckCheck, Inbox, AlertCircle } from 'lucide-react';
import { type BreadcrumbItem } from '@/types';
import StatusBadge from '@/components/shared/status-badge';

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
    const [activeTab, setActiveTab] = useState('all');

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
    const unreadCount = notifications.data.filter(n => !n.read_at).length;
    
    const formatTime = (date: string) => {
        const d = new Date(date);
        const now = new Date();
        const diff = now.getTime() - d.getTime();
        const mins = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);
        
        if (mins < 1) return 'Just now';
        if (mins < 60) return `${mins}m ago`;
        if (hours < 24) return `${hours}h ago`;
        if (days < 7) return `${days}d ago`;
        
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    // Filter notifications based on active tab
    const filteredNotifications = activeTab === 'unread' 
        ? notifications.data.filter(n => !n.read_at)
        : notifications.data;

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
        today: filteredNotifications.filter(n => isToday(n.created_at)),
        yesterday: filteredNotifications.filter(n => isYesterday(n.created_at)),
        older: filteredNotifications.filter(n => !isToday(n.created_at) && !isYesterday(n.created_at)),
    };

    const getPriorityIcon = (priority: string) => {
        if (priority === 'high') return <AlertCircle className="h-5 w-5" />;
        return <Bell className="h-5 w-5" />;
    };

    const renderGroup = (title: string, group: Notification[]) => {
        if (group.length === 0) return null;

        return (
            <div className="mb-6 space-y-2">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1">{title}</h3>
                <div className="space-y-2">
                    {group.map((notification) => (
                        <Card
                            key={notification.id}
                            className={`group relative overflow-hidden transition-all duration-200 hover:shadow-md ${
                                !notification.read_at
                                    ? 'border-l-4 border-l-primary bg-primary/5'
                                    : 'hover:bg-muted/50'
                            }`}
                        >
                            <CardContent className="p-4">
                                <div className="flex items-start gap-4">
                                    {/* Icon */}
                                    <div 
                                        className="mt-0.5 flex items-center justify-center h-10 w-10 rounded-full flex-shrink-0 transition-transform group-hover:scale-110"
                                        style={{ 
                                            backgroundColor: notification.color ? `${notification.color}15` : 'hsl(var(--primary) / 0.1)',
                                            color: notification.color || 'hsl(var(--primary))'
                                        }}
                                    >
                                        {getPriorityIcon(notification.priority)}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0 space-y-1">
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <h4 className={`font-semibold text-sm leading-tight ${
                                                    !notification.read_at ? 'text-foreground' : 'text-muted-foreground'
                                                }`}>
                                                    {notification.title}
                                                </h4>
                                                {notification.priority === 'high' && (
                                                    <Badge variant="destructive" className="h-5 text-[10px] font-semibold px-2">
                                                        High Priority
                                                    </Badge>
                                                )}
                                                {!notification.read_at && (
                                                    <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                                                )}
                                            </div>
                                        </div>
                                        <p className={`text-sm leading-relaxed ${
                                            !notification.read_at ? 'text-foreground/80' : 'text-muted-foreground'
                                        }`}>
                                            {notification.message}
                                        </p>
                                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground pt-1">
                                            <Clock className="h-3.5 w-3.5" />
                                            <span>{formatTime(notification.created_at)}</span>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        {!notification.read_at && (
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => markAsRead(notification.id)}
                                                disabled={isLoading}
                                                className="h-8 w-8 text-primary hover:text-primary hover:bg-primary/10"
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
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Notifications" />

            <div className="container mx-auto px-4 py-6 max-w-5xl">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2.5 bg-primary/10 rounded-lg">
                            <Bell className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
                            <p className="text-sm text-muted-foreground mt-0.5">
                                {unreadCount > 0 ? (
                                    <span className="font-medium">{unreadCount} unread</span>
                                ) : (
                                    <span>All caught up!</span>
                                )} • {notifications.meta.total} total
                            </p>
                        </div>
                    </div>
                </div>

                {/* Tabs and Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full sm:w-auto">
                        <TabsList className="grid w-full sm:w-auto grid-cols-2">
                            <TabsTrigger value="all" className="gap-2">
                                <Inbox className="h-4 w-4" />
                                All
                                <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                                    {notifications.data.length}
                                </Badge>
                            </TabsTrigger>
                            <TabsTrigger value="unread" className="gap-2">
                                <Bell className="h-4 w-4" />
                                Unread
                                {unreadCount > 0 && (
                                    <Badge variant="default" className="ml-1 h-5 px-1.5 text-xs">
                                        {unreadCount}
                                    </Badge>
                                )}
                            </TabsTrigger>
                        </TabsList>
                    </Tabs>

                    {hasUnread && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={markAllAsRead}
                            disabled={isLoading}
                            className="gap-2"
                        >
                            <CheckCheck className="h-4 w-4" />
                            Mark all read
                        </Button>
                    )}
                </div>

                {/* Notifications List */}
                <div className="space-y-6">
                    {filteredNotifications.length === 0 ? (
                        <Card className="border-dashed">
                            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                                <div className="p-4 bg-muted/50 rounded-full mb-4">
                                    {activeTab === 'unread' ? (
                                        <CheckCheck className="h-10 w-10 text-muted-foreground/50" />
                                    ) : (
                                        <Bell className="h-10 w-10 text-muted-foreground/50" />
                                    )}
                                </div>
                                <h3 className="text-lg font-semibold mb-1">
                                    {activeTab === 'unread' ? 'No unread notifications' : 'No notifications yet'}
                                </h3>
                                <p className="text-sm text-muted-foreground max-w-sm">
                                    {activeTab === 'unread' 
                                        ? "You're all caught up! Check back later for new updates."
                                        : 'When you receive notifications, they will appear here.'}
                                </p>
                            </CardContent>
                        </Card>
                    ) : (
                        <>
                            {renderGroup('Today', groupedNotifications.today)}
                            {renderGroup('Yesterday', groupedNotifications.yesterday)}
                            {renderGroup('Older', groupedNotifications.older)}
                        </>
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
