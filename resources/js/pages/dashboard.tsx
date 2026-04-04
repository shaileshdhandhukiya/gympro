import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { Users, Calendar, TrendingUp } from 'lucide-react';
import StatsCard from '@/components/dashboard/stats-card';
import SubscriptionTimeline from '@/components/dashboard/subscription-timeline';
import { RevenueTrend } from '@/components/dashboard/revenue-trend';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Subscription, type BreadcrumbItem } from '@/types';
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';

interface Props {
    stats: {
        total_members: number;
        active_members: number;
        total_subscriptions: number;
        active_subscriptions: number;
        revenue_this_month: number;
    };
    expiring_soon: Subscription[];
    recent_subscriptions: Subscription[];
    revenue_trend: { month: string; revenue: number; expenses: number }[];
    attendance_trend: { date: string; count: number }[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

const revenueChartConfig = {
    revenue: {
        label: "Revenue",
        color: "hsl(217, 91%, 60%)",
    },
} satisfies ChartConfig;

const attendanceChartConfig = {
    count: {
        label: "Members",
        color: "hsl(217, 91%, 60%)",
    },
} satisfies ChartConfig;

export default function Dashboard({ stats, expiring_soon, recent_subscriptions, revenue_trend, attendance_trend }: Props) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="container mx-auto p-6 space-y-6">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <StatsCard
                        title="Total Members"
                        value={stats.total_members}
                        icon={Users}
                        description="All registered members"
                    />
                    <StatsCard
                        title="Active Members"
                        value={stats.active_members}
                        icon={Users}
                        description="Currently active members"
                    />
                    <StatsCard
                        title="Active Subscriptions"
                        value={stats.active_subscriptions}
                        icon={Calendar}
                        description="Valid subscriptions"
                    />
                    <StatsCard
                        title="Revenue This Month"
                        value={`₹${stats.revenue_this_month.toLocaleString()}`}
                        icon={TrendingUp}
                        description="Total monthly revenue"
                    />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <RevenueTrend data={revenue_trend} />

                    <Card>
                        <CardHeader>
                            <CardTitle>Attendance Trend</CardTitle>
                            <CardDescription>Last 7 days attendance</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ChartContainer config={attendanceChartConfig}>
                                <BarChart data={attendance_trend}>
                                    <CartesianGrid vertical={false} />
                                    <XAxis 
                                        dataKey="date"
                                        tickLine={false}
                                        tickMargin={10}
                                        axisLine={false}
                                    />
                                    <YAxis
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <ChartTooltip
                                        cursor={false}
                                        content={<ChartTooltipContent hideLabel />}
                                    />
                                    <Bar dataKey="count" fill="var(--color-count)" radius={8} />
                                </BarChart>
                            </ChartContainer>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-4 md:grid-cols-12">
                    <Card className="md:col-span-8">
                        <CardHeader>
                            <CardTitle>Expiring Subscriptions</CardTitle>
                            <CardDescription>Subscriptions expiring in next 7 days</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {expiring_soon.length > 0 ? (
                                <div className="space-y-3">
                                    {expiring_soon.map((subscription) => (
                                        <div key={subscription.id} className="flex items-center justify-between p-3 border rounded-lg">
                                            <div>
                                                <p className="font-medium">{subscription.member?.user?.name}</p>
                                                <p className="text-sm text-muted-foreground">{subscription.plan?.name}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-medium">{new Date(subscription.end_date).toLocaleDateString()}</p>
                                                <Badge variant="outline" className="mt-1 border-red-200 text-red-700 bg-red-50 dark:border-red-800 dark:text-red-400 dark:bg-red-950">Expiring</Badge>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <p className="text-muted-foreground">No data available</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="md:col-span-4">
                        <SubscriptionTimeline subscriptions={recent_subscriptions} />
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
