import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Member, Payment, PageProps } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, CreditCard, TrendingUp, Clock, ArrowLeft } from 'lucide-react';
import { formatDate } from '@/lib/date-utils';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface Props extends PageProps {
    member: Member;
    payments: {
        data: Payment[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    stats: {
        total_spent: number;
        total_orders: number;
        pending_payments: number;
    };
}

export default function Orders({ member, payments, stats }: Props) {
    const getStatusBadge = (status: string) => {
        const variants = {
            completed: 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-400 dark:border-green-800',
            pending: 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950 dark:text-yellow-400 dark:border-yellow-800',
            failed: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-400 dark:border-red-800',
            refunded: 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-950 dark:text-gray-400 dark:border-gray-800',
        };
        return variants[status as keyof typeof variants] || variants.pending;
    };

    return (
        <AppLayout>
            <Head title="My Orders" />
            <div className="container mx-auto p-6 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">My Orders</h1>
                        <p className="text-muted-foreground">Track all your transactions and payments</p>
                    </div>
                    <Button variant="outline" asChild>
                        <Link href="/member/dashboard">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Dashboard
                        </Link>
                    </Button>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">₹{stats.total_spent}</div>
                            <p className="text-xs text-muted-foreground mt-1">All time</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                            <CreditCard className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total_orders}</div>
                            <p className="text-xs text-muted-foreground mt-1">Transactions</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Pending</CardTitle>
                            <Clock className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.pending_payments}</div>
                            <p className="text-xs text-muted-foreground mt-1">Awaiting payment</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Orders DataTable */}
                <Card>
                    <CardHeader>
                        <CardTitle>Transaction History</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {payments.data.length > 0 ? (
                            <>
                                <div className="rounded-md border">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Invoice</TableHead>
                                                <TableHead>Plan</TableHead>
                                                <TableHead>Amount</TableHead>
                                                <TableHead>Method</TableHead>
                                                <TableHead>Type</TableHead>
                                                <TableHead>Date</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead>Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {payments.data.map((payment) => (
                                                <TableRow key={payment.id} className="hover:bg-muted/50">
                                                    <TableCell className="font-medium">{payment.invoice_number}</TableCell>
                                                    <TableCell>{payment.subscription?.plan?.name || 'N/A'}</TableCell>
                                                    <TableCell className="font-semibold">₹{payment.amount}</TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-2">
                                                            <CreditCard className="h-4 w-4 text-muted-foreground" />
                                                            <span className="uppercase text-sm">{payment.payment_method}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="capitalize text-sm">{payment.payment_type}</TableCell>
                                                    <TableCell className="text-sm">{formatDate(payment.payment_date)}</TableCell>
                                                    <TableCell>
                                                        <Badge variant="outline" className={getStatusBadge(payment.status)}>
                                                            {payment.status}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        {payment.status === 'completed' && (
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                asChild
                                                            >
                                                                <a 
                                                                    href={`/payments/${payment.id}/invoice`} 
                                                                    target="_blank" 
                                                                    rel="noopener noreferrer"
                                                                    aria-label="Download invoice"
                                                                >
                                                                    <Download className="h-4 w-4" />
                                                                </a>
                                                            </Button>
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>

                                {/* Pagination */}
                                <div className="flex items-center justify-between mt-4">
                                    <p className="text-sm text-muted-foreground">
                                        Showing {((payments.current_page - 1) * payments.per_page) + 1} to{' '}
                                        {Math.min(payments.current_page * payments.per_page, payments.total)} of{' '}
                                        {payments.total} results
                                    </p>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            disabled={payments.current_page === 1}
                                            onClick={() => router.get('/member/orders', { page: payments.current_page - 1 })}
                                        >
                                            Previous
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            disabled={payments.current_page === payments.last_page}
                                            onClick={() => router.get('/member/orders', { page: payments.current_page + 1 })}
                                        >
                                            Next
                                        </Button>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="text-center py-12">
                                <CreditCard className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                                <p className="text-muted-foreground mb-4">No transactions yet</p>
                                <Link href="/member/plans">
                                    <Button>Browse Plans</Button>
                                </Link>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
