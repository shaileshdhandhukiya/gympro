import { useState, useEffect } from 'react';
import { useDebounce } from 'use-debounce';
import AppLayout from '@/layouts/app-layout';
import { Head, usePage, router } from '@inertiajs/react';
import { Payment } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { DollarSign, CheckCircle, XCircle, Plus, Search, X } from 'lucide-react';
import PaymentTable from '@/components/payments/payment-table';
import CreatePaymentModal from '@/components/payments/create-payment-modal';
import EditPaymentModal from '@/components/payments/edit-payment-modal';
import DeletePaymentDialog from '@/components/payments/delete-payment-dialog';

interface PaginatedData {
    data: Payment[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

interface Props {
    payments: PaginatedData;
    subscriptions: any[];
    stats: {
        total: number;
        completed: number;
        pending: number;
        total_amount: number;
    };
    filters: { 
        search: string | null;
        per_page: number;
        status: string | null;
    };
}

export default function Index({ payments, subscriptions, stats, filters }: Props) {
    const { auth } = usePage().props as any;
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [editPayment, setEditPayment] = useState<Payment | null>(null);
    const [deletePayment, setDeletePayment] = useState<Payment | null>(null);
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || 'all');
    const [debouncedSearch] = useDebounce(search, 500);

    const canCreate = auth.permissions.includes('create_payments');
    const canEdit = auth.permissions.includes('edit_payments');
    const canDelete = auth.permissions.includes('delete_payments');

    useEffect(() => {
        router.get('/payments', { 
            search: debouncedSearch || undefined, 
            status: status !== 'all' ? status : undefined,
            per_page: filters.per_page
        }, { preserveState: true, preserveScroll: true });
    }, [debouncedSearch, status]);

    const handleClearFilters = () => {
        setSearch('');
        setStatus('all');
    };

    const handlePageChange = (page: number) => {
        router.get('/payments', { 
            page, 
            search: search || undefined,
            status: status !== 'all' ? status : undefined,
            per_page: filters.per_page
        }, { preserveState: true });
    };

    const handlePerPageChange = (value: string) => {
        router.get('/payments', { 
            search: search || undefined,
            status: status !== 'all' ? status : undefined,
            per_page: value
        }, { preserveState: true });
    };

    const startItem = (payments.current_page - 1) * payments.per_page + 1;
    const endItem = Math.min(payments.current_page * payments.per_page, payments.total);

    const getPageNumbers = () => {
        const pages: (number | string)[] = [];
        const { current_page, last_page } = payments;
        if (last_page <= 7) return Array.from({ length: last_page }, (_, i) => i + 1);
        pages.push(1);
        if (current_page > 3) pages.push('...');
        for (let i = Math.max(2, current_page - 1); i <= Math.min(last_page - 1, current_page + 1); i++) pages.push(i);
        if (current_page < last_page - 2) pages.push('...');
        pages.push(last_page);
        return pages;
    };

    return (
        <AppLayout>
            <Head title="Payments" />
            
            <div className="container mx-auto p-4 md:p-6 space-y-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold">Payments</h1>
                        <p className="text-sm md:text-base text-muted-foreground">Manage payment records</p>
                    </div>
                    {canCreate && (
                        <Button onClick={() => setCreateModalOpen(true)} className="w-full md:w-auto">
                            <Plus className="mr-2 h-4 w-4" />
                            Record Payment
                        </Button>
                    )}
                </div>

                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Payments</CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Completed</CardTitle>
                            <CheckCircle className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.completed}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Pending</CardTitle>
                            <XCircle className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.pending}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">₹{stats.total_amount.toLocaleString()}</div>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardContent className="pt-6 space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-muted-foreground whitespace-nowrap">Show</span>
                                <Select value={filters.per_page.toString()} onValueChange={handlePerPageChange}>
                                    <SelectTrigger className="w-20">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="10">10</SelectItem>
                                        <SelectItem value="25">25</SelectItem>
                                        <SelectItem value="50">50</SelectItem>
                                        <SelectItem value="100">100</SelectItem>
                                    </SelectContent>
                                </Select>
                                <span className="text-sm text-muted-foreground whitespace-nowrap">entries</span>
                            </div>
                            <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
                                <div className="relative w-full sm:w-64">
                                    <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        placeholder="Search payments..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className="pl-8 h-9 w-full"
                                    />
                                </div>
                                <div className="flex items-center gap-2 w-full sm:w-auto">
                                    <Select value={status} onValueChange={setStatus}>
                                        <SelectTrigger className="w-full sm:w-40 h-9">
                                            <SelectValue placeholder="Status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Status</SelectItem>
                                            <SelectItem value="completed">Completed</SelectItem>
                                            <SelectItem value="pending">Pending</SelectItem>
                                            <SelectItem value="failed">Failed</SelectItem>
                                            <SelectItem value="refunded">Refunded</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {(search || status !== 'all') && (
                                        <Button variant="ghost" size="sm" onClick={handleClearFilters} className="px-2">
                                            <X className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <PaymentTable 
                                payments={payments.data}
                                onEdit={canEdit ? setEditPayment : undefined}
                                onDelete={canDelete ? setDeletePayment : undefined}
                            />
                        </div>
                        {payments.data.length === 0 && (
                            <div className="text-center py-12">
                                <DollarSign className="mx-auto h-12 w-12 text-muted-foreground" />
                                <h3 className="mt-4 text-lg font-semibold">No payments found</h3>
                                <p className="mt-2 text-sm text-muted-foreground">
                                    {search || status !== 'all' ? 'Try adjusting your filters' : 'Get started by recording a new payment'}
                                </p>
                            </div>
                        )}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4">
                            <div className="text-sm text-muted-foreground text-center sm:text-left">
                                Showing {startItem} to {endItem} of {payments.total} results
                            </div>
                            <div className="overflow-x-auto pb-2 sm:pb-0">
                                <Pagination>
                                    <PaginationContent>
                                        <PaginationItem>
                                            <PaginationPrevious onClick={() => handlePageChange(payments.current_page - 1)} className={payments.current_page === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'} />
                                        </PaginationItem>
                                        {getPageNumbers().map((page, idx) => (
                                            <PaginationItem key={idx}>
                                                {page === '...' ? <PaginationEllipsis /> : <PaginationLink onClick={() => handlePageChange(page as number)} isActive={page === payments.current_page} className="cursor-pointer">{page}</PaginationLink>}
                                            </PaginationItem>
                                        ))}
                                        <PaginationItem>
                                            <PaginationNext onClick={() => handlePageChange(payments.current_page + 1)} className={payments.current_page === payments.last_page ? 'pointer-events-none opacity-50' : 'cursor-pointer'} />
                                        </PaginationItem>
                                    </PaginationContent>
                                </Pagination>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {canCreate && (
                <CreatePaymentModal
                    open={createModalOpen}
                    onOpenChange={setCreateModalOpen}
                    subscriptions={subscriptions || []}
                />
            )}

            {canEdit && editPayment && (
                <EditPaymentModal
                    open={!!editPayment}
                    onOpenChange={(open) => !open && setEditPayment(null)}
                    payment={editPayment}
                />
            )}

            {canDelete && deletePayment && (
                <DeletePaymentDialog
                    open={!!deletePayment}
                    onOpenChange={(open) => !open && setDeletePayment(null)}
                    payment={deletePayment}
                />
            )}
        </AppLayout>
    );
}
