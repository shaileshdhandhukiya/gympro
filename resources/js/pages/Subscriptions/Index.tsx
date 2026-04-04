import { useState, useEffect } from 'react';
import { useDebounce } from 'use-debounce';
import { Head, usePage, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { FileText, CheckCircle, XCircle, Plus, Search, X } from 'lucide-react';
import { Subscription, Member, Plan, Trainer, Auth } from '@/types';
import SubscriptionTable from '@/components/subscriptions/subscription-table';
import CreateSubscriptionModal from '@/components/subscriptions/create-subscription-modal';
import EditSubscriptionModal from '@/components/subscriptions/edit-subscription-modal';
import DeleteSubscriptionDialog from '@/components/subscriptions/delete-subscription-dialog';

interface PaginatedData {
    data: Subscription[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

interface Props {
    subscriptions: PaginatedData;
    members: Member[];
    plans: Plan[];
    trainers: Trainer[];
    stats: {
        total: number;
        active: number;
        expired: number;
    };
    filters: { 
        search: string | null;
        per_page: number;
        status: string | null;
    };
    auth: Auth;
}

export default function Index({ subscriptions, members, plans, trainers, stats, filters, auth }: Props) {
    const [createOpen, setCreateOpen] = useState(false);
    const [editSubscription, setEditSubscription] = useState<Subscription | null>(null);
    const [deleteSubscription, setDeleteSubscription] = useState<Subscription | null>(null);
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || 'all');
    const [debouncedSearch] = useDebounce(search, 500);

    const canCreate = auth.permissions.includes('create_subscriptions');
    const canEdit = auth.permissions.includes('edit_subscriptions');
    const canDelete = auth.permissions.includes('delete_subscriptions');

    useEffect(() => {
        router.get('/subscriptions', { 
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
        router.get('/subscriptions', { 
            page, 
            search: search || undefined,
            status: status !== 'all' ? status : undefined,
            per_page: filters.per_page
        }, { preserveState: true });
    };

    const handlePerPageChange = (value: string) => {
        router.get('/subscriptions', { 
            search: search || undefined,
            status: status !== 'all' ? status : undefined,
            per_page: value
        }, { preserveState: true });
    };

    const startItem = (subscriptions.current_page - 1) * subscriptions.per_page + 1;
    const endItem = Math.min(subscriptions.current_page * subscriptions.per_page, subscriptions.total);

    const getPageNumbers = () => {
        const pages: (number | string)[] = [];
        const { current_page, last_page } = subscriptions;
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
            <Head title="Subscriptions" />
            
            <div className="container mx-auto p-4 md:p-6 space-y-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold">Subscriptions</h1>
                        <p className="text-sm md:text-base text-muted-foreground">Manage member subscriptions</p>
                    </div>
                    {canCreate && (
                        <Button onClick={() => setCreateOpen(true)} className="w-full md:w-auto">
                            <Plus className="mr-2 h-4 w-4" />
                            Add Subscription
                        </Button>
                    )}
                </div>

                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Subscriptions</CardTitle>
                            <FileText className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
                            <CheckCircle className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.active}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Expired Subscriptions</CardTitle>
                            <XCircle className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.expired}</div>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardContent className="pt-6 space-y-4">
                        <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-muted-foreground">Show</span>
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
                                <span className="text-sm text-muted-foreground">entries</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="relative w-64">
                                    <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        placeholder="Search subscriptions..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className="pl-8 h-9"
                                    />
                                </div>
                                <Select value={status} onValueChange={setStatus}>
                                    <SelectTrigger className="w-40 h-9">
                                        <SelectValue placeholder="Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Status</SelectItem>
                                        <SelectItem value="active">Active</SelectItem>
                                        <SelectItem value="pending">Pending</SelectItem>
                                        <SelectItem value="expired">Expired</SelectItem>
                                        <SelectItem value="cancelled">Cancelled</SelectItem>
                                    </SelectContent>
                                </Select>
                                {(search || status !== 'all') && (
                                    <Button variant="ghost" size="sm" onClick={handleClearFilters}>
                                        <X className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <SubscriptionTable 
                                subscriptions={subscriptions.data} 
                                onEdit={canEdit ? setEditSubscription : undefined}
                                onDelete={canDelete ? setDeleteSubscription : undefined}
                            />
                        </div>
                        {subscriptions.data.length === 0 && (
                            <div className="text-center py-12">
                                <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
                                <h3 className="mt-4 text-lg font-semibold">No subscriptions found</h3>
                                <p className="mt-2 text-sm text-muted-foreground">
                                    {search || status !== 'all' ? 'Try adjusting your filters' : 'Get started by adding a new subscription'}
                                </p>
                            </div>
                        )}
                        <div className="flex items-center justify-between">
                            <div className="text-sm text-muted-foreground">
                                Showing {startItem} to {endItem} of {subscriptions.total} results
                            </div>
                            <Pagination>
                                <PaginationContent>
                                    <PaginationItem>
                                        <PaginationPrevious onClick={() => handlePageChange(subscriptions.current_page - 1)} className={subscriptions.current_page === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'} />
                                    </PaginationItem>
                                    {getPageNumbers().map((page, idx) => (
                                        <PaginationItem key={idx}>
                                            {page === '...' ? <PaginationEllipsis /> : <PaginationLink onClick={() => handlePageChange(page as number)} isActive={page === subscriptions.current_page} className="cursor-pointer">{page}</PaginationLink>}
                                        </PaginationItem>
                                    ))}
                                    <PaginationItem>
                                        <PaginationNext onClick={() => handlePageChange(subscriptions.current_page + 1)} className={subscriptions.current_page === subscriptions.last_page ? 'pointer-events-none opacity-50' : 'cursor-pointer'} />
                                    </PaginationItem>
                                </PaginationContent>
                            </Pagination>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {canCreate && (
                <CreateSubscriptionModal 
                    open={createOpen} 
                    onOpenChange={setCreateOpen}
                    members={members}
                    plans={plans}
                    trainers={trainers}
                />
            )}

            {canEdit && editSubscription && (
                <EditSubscriptionModal 
                    open={!!editSubscription} 
                    onOpenChange={(open) => !open && setEditSubscription(null)}
                    subscription={editSubscription}
                    members={members}
                    plans={plans}
                />
            )}

            {canDelete && deleteSubscription && (
                <DeleteSubscriptionDialog 
                    open={!!deleteSubscription} 
                    onOpenChange={(open) => !open && setDeleteSubscription(null)}
                    subscription={deleteSubscription}
                />
            )}
        </AppLayout>
    );
}
