import AppLayout from '@/layouts/app-layout';
import { Head, router, Link } from '@inertiajs/react';
import { Member, Subscription, Payment, Attendance, PageProps } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, CreditCard, Download, User, ArrowRight, LogIn, LogOut, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { useState } from 'react';
import { formatDate, formatTime, calculateTimeDifference } from '@/lib/date-utils';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

interface Props extends PageProps {
    member: Member;
    currentSubscription: Subscription | null;
    daysRemaining: number;
    subscriptionStatus: 'active' | 'expiring' | 'expired' | 'none';
    attendanceThisMonth: number;
    lastCheckIn: Attendance | null;
    recentPayments: Payment[];
}

export default function Dashboard({ member, currentSubscription, daysRemaining, subscriptionStatus, attendanceThisMonth, lastCheckIn, recentPayments }: Props) {
    const [processing, setProcessing] = useState(false);
    const [showCheckoutDialog, setShowCheckoutDialog] = useState(false);
   
    const handleCheckIn = () => {
        if (processing) return;
        
        // Check if user is currently checked in
        const isCheckedIn = lastCheckIn && !lastCheckIn.check_out_time;
        
        if (isCheckedIn) {
            // This shouldn't happen as button should show "Check Out"
            toast.error('You are already checked in');
            return;
        }
        
        setProcessing(true);
        router.post('/attendances', {
            member_id: member.id,
            date: new Date().toISOString().split('T')[0],
            check_in_time: new Date().toTimeString().split(' ')[0],
            status: 'present'
        }, {
            onSuccess: () => {
                toast.success('Checked in successfully');
            },
            onError: () => {
                toast.error('Failed to check in');
            },
            onFinish: () => {
                setProcessing(false);
            },
            preserveScroll: true,
        });
    };

    const handleCheckOut = () => {
        if (!lastCheckIn || processing) return;
        
        setProcessing(true);
        router.put(`/attendances/${lastCheckIn.id}`, {
            check_out_time: new Date().toTimeString().split(' ')[0]
        }, {
            onSuccess: () => {
                toast.success('Checked out successfully');
                setShowCheckoutDialog(false);
            },
            onError: () => {
                toast.error('Failed to check out');
            },
            onFinish: () => {
                setProcessing(false);
            },
            preserveScroll: true,
        });
    };
    
    // Determine if user is currently checked in based on LAST record
    const isCurrentlyCheckedIn = lastCheckIn && !lastCheckIn.check_out_time;
    const isTodaySession = lastCheckIn && new Date(lastCheckIn.date).toDateString() === new Date().toDateString();
    const statusColors = {
        active: 'bg-green-500',
        expiring: 'bg-yellow-500',
        expired: 'bg-red-500',
        none: 'bg-gray-500',
    };

    const statusLabels = {
        active: 'Active',
        expiring: 'Expiring Soon',
        expired: 'Expired',
        none: 'No Active Plan',
    };

    return (
        <AppLayout>
            <Head title="My Dashboard" />
            <div className="container mx-auto p-6 space-y-6">
                {/* Welcome Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Welcome back, {member.user?.name}!</h1>
                        <p className="text-muted-foreground">Here's your fitness journey overview</p>
                    </div>
                </div>

                {/* Check-in & Membership Status - Side by Side */}
                <div className="grid gap-6 md:grid-cols-2">
                    {/* Membership Status Card */}
                    <Card className="border-2">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-xl">Membership Status</CardTitle>
                                <CardDescription>Your current subscription</CardDescription>
                            </div>
                            <Badge className={statusColors[subscriptionStatus]}>
                                {statusLabels[subscriptionStatus]}
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {currentSubscription ? (
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Plan</p>
                                        <p className="text-lg font-semibold">{currentSubscription.plan?.name}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Days Remaining</p>
                                        <p className="text-lg font-semibold">
                                            {subscriptionStatus === 'expired' ? 'Expired' : `${daysRemaining} days`}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Start Date</p>
                                        <p className="text-lg font-semibold">
                                            {formatDate(currentSubscription.start_date)}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">End Date</p>
                                        <p className="text-lg font-semibold">
                                            {formatDate(currentSubscription.end_date)}
                                        </p>
                                    </div>
                                </div>
                                {(subscriptionStatus === 'expiring' || subscriptionStatus === 'expired') && (
                                    <Button className="w-full">Renew Membership</Button>
                                )}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <p className="text-muted-foreground mb-4">You don't have an active subscription</p>
                                <Link href="/member/plans">
                                    <Button>View Plans</Button>
                                </Link>
                            </div>
                        )}
                    </CardContent>
                    </Card>

                    {/* Check-in/Check-out Card */}
                    <Card className="border-2 border-primary">
                    <CardHeader>
                        <CardTitle className="text-xl">Quick Check-in</CardTitle>
                        <CardDescription>Mark your attendance for today</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {isCurrentlyCheckedIn ? (
                                <>
                                    <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
                                        <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                                            <LogIn className="h-6 w-6 text-green-600 dark:text-green-400" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">Checked In</p>
                                            <p className="text-lg font-semibold">{lastCheckIn.check_in_time}</p>
                                        </div>
                                    </div>
                                    <Button size="lg" variant="destructive" className="h-full" onClick={() => setShowCheckoutDialog(true)} disabled={processing}>
                                        <LogOut className="mr-2 h-5 w-5" />
                                        Check Out
                                    </Button>
                                </>
                            ) : (
                                <Button size="lg" className="md:col-span-2" onClick={handleCheckIn} disabled={processing}>
                                    <LogIn className="mr-2 h-5 w-5" />
                                    {processing ? 'Processing...' : 'Check In Now'}
                                </Button>
                            )}
                        </div>
                        {lastCheckIn && isTodaySession && lastCheckIn.check_in_time && lastCheckIn.check_out_time && lastCheckIn.duration && (
                            <div className="mt-4 p-3 bg-muted rounded-lg flex items-center gap-2">
                                <Clock className="h-4 w-4 text-muted-foreground" />
                                <p className="text-sm text-muted-foreground">
                                    Last session: {Math.floor(lastCheckIn.duration / 60)}h {lastCheckIn.duration % 60}m
                                </p>
                            </div>
                        )}
                    </CardContent>
                    </Card>
                </div>

                {/* Stats Grid */}
                <div className="grid gap-4 md:grid-cols-2">
                    {/* Attendance Card */}
                    <Card className="cursor-pointer hover:border-primary transition-colors">
                        <Link href="/member/attendance">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Attendance This Month</CardTitle>
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{attendanceThisMonth} days</div>
                            {lastCheckIn && (
                                <p className="text-xs text-muted-foreground mt-2">
                                    Last check-in: {formatDate(lastCheckIn.date)} at {formatTime(lastCheckIn.check_in_time)}
                                </p>
                            )}
                            <Button variant="link" className="p-0 h-auto mt-2">
                                View Full History <ArrowRight className="h-3 w-3 ml-1" />
                            </Button>
                        </CardContent>
                        </Link>
                    </Card>

                    {/* Profile Card */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">My Profile</CardTitle>
                            <User className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-1">
                                <p className="text-sm"><span className="text-muted-foreground">Email:</span> {member.user?.email}</p>
                                <p className="text-sm"><span className="text-muted-foreground">Phone:</span> {member.user?.phone}</p>
                                <p className="text-sm"><span className="text-muted-foreground">Member Since:</span> {formatDate(member.join_date)}</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Recent Payments */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>Recent Payments</CardTitle>
                                <CardDescription>Your payment history</CardDescription>
                            </div>
                            <CreditCard className="h-5 w-5 text-muted-foreground" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        {recentPayments.length > 0 ? (
                            <div className="space-y-3">
                                {recentPayments.map((payment: any) => (
                                    <div key={payment.id} className="flex items-center justify-between p-3 border rounded-lg">
                                        <div className="flex-1">
                                            <p className="font-medium">{payment.invoice_number}</p>
                                            <p className="text-sm text-muted-foreground">
                                                {payment.subscription?.plan?.name || 'N/A'} • {formatDate(payment.payment_date)} • {payment.payment_method.toUpperCase()}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="text-right">
                                                <p className="font-semibold">₹{payment.amount}</p>
                                                <p className="text-xs text-muted-foreground capitalize">{payment.payment_type}</p>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => router.visit(`/payments/${payment.id}/invoice`)}
                                                aria-label="Download invoice"
                                            >
                                                <Download className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-center text-muted-foreground py-8">No payment history</p>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Checkout Confirmation Dialog */}
            <Dialog open={showCheckoutDialog} onOpenChange={setShowCheckoutDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirm Check Out</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to check out? This will end your current session.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowCheckoutDialog(false)} disabled={processing}>
                            Cancel
                        </Button>
                        <Button onClick={handleCheckOut} disabled={processing}>
                            {processing ? 'Processing...' : 'Check Out'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
