import { useState, useEffect } from 'react';
import { useDebounce } from 'use-debounce';
import { Head, usePage, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { CreditCard, CheckCircle, XCircle, Plus, Search, X } from 'lucide-react';
import { Plan } from '@/types';
import PlanTable from '@/components/plans/plan-table';
import CreatePlanModal from '@/components/plans/create-plan-modal';
import EditPlanModal from '@/components/plans/edit-plan-modal';
import DeletePlanDialog from '@/components/plans/delete-plan-dialog';
import ViewPlanModal from '@/components/plans/view-plan-modal';

interface PaginatedData {
    data: Plan[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

interface Feature {
    id: number;
    name: string;
    slug: string;
}

interface Props {
    plans: PaginatedData;
    stats: {
        total: number;
        active: number;
        inactive: number;
    };
    filters: { 
        per_page: number;
        search: string | null;
        status: string | null;
    };
    features: Feature[];
}

export default function Index({ plans, stats, filters, features }: Props) {
    const { auth } = usePage().props as any;
    const [viewPlan, setViewPlan] = useState<Plan | null>(null);
    const [createOpen, setCreateOpen] = useState(false);
    const [editPlan, setEditPlan] = useState<Plan | null>(null);
    const [deletePlan, setDeletePlan] = useState<Plan | null>(null);
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || 'all');
    const [debouncedSearch] = useDebounce(search, 500);

    const canCreate = auth.permissions.includes('create_plans');
    const canEdit = auth.permissions.includes('edit_plans');
    const canDelete = auth.permissions.includes('delete_plans');

    useEffect(() => {
        router.get('/plans', { 
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
        router.get('/plans', { 
            page, 
            search: search || undefined,
            status: status !== 'all' ? status : undefined,
            per_page: filters.per_page
        }, { preserveState: true });
    };

    const handlePerPageChange = (value: string) => {
        router.get('/plans', { 
            search: search || undefined,
            status: status !== 'all' ? status : undefined,
            per_page: value
        }, { preserveState: true });
    };

    const startItem = (plans.current_page - 1) * plans.per_page + 1;
    const endItem = Math.min(plans.current_page * plans.per_page, plans.total);

    const getPageNumbers = () => {
        const pages: (number | string)[] = [];
        const { current_page, last_page } = plans;
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
            <Head title="Membership Plans" />
            
            <div className="container mx-auto p-4 md:p-6 space-y-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold">Membership Plans</h1>
                        <p className="text-sm md:text-base text-muted-foreground">Manage gym membership plans</p>
                    </div>
                    {canCreate && (
                        <Button onClick={() => setCreateOpen(true)} className="w-full md:w-auto">
                            <Plus className="mr-2 h-4 w-4" />
                            Add Plan
                        </Button>
                    )}
                </div>

                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Plans</CardTitle>
                            <CreditCard className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Active Plans</CardTitle>
                            <CheckCircle className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.active}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Inactive Plans</CardTitle>
                            <XCircle className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.inactive}</div>
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
                                        placeholder="Search plans..."
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
                                        <SelectItem value="inactive">Inactive</SelectItem>
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
                            <PlanTable 
                                plans={plans.data}
                                onView={setViewPlan}
                                onEdit={canEdit ? setEditPlan : undefined}
                                onDelete={canDelete ? setDeletePlan : undefined}
                            />
                        </div>
                        {plans.data.length === 0 && (
                            <div className="text-center py-12">
                                <CreditCard className="mx-auto h-12 w-12 text-muted-foreground" />
                                <h3 className="mt-4 text-lg font-semibold">No plans found</h3>
                                <p className="mt-2 text-sm text-muted-foreground">
                                    {search || status !== 'all' ? 'Try adjusting your filters' : 'Get started by adding a new plan'}
                                </p>
                            </div>
                        )}
                        <div className="flex items-center justify-between">
                            <div className="text-sm text-muted-foreground">
                                Showing {startItem} to {endItem} of {plans.total} results
                            </div>
                            <Pagination>
                                <PaginationContent>
                                    <PaginationItem>
                                        <PaginationPrevious onClick={() => handlePageChange(plans.current_page - 1)} className={plans.current_page === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'} />
                                    </PaginationItem>
                                    {getPageNumbers().map((page, idx) => (
                                        <PaginationItem key={idx}>
                                            {page === '...' ? <PaginationEllipsis /> : <PaginationLink onClick={() => handlePageChange(page as number)} isActive={page === plans.current_page} className="cursor-pointer">{page}</PaginationLink>}
                                        </PaginationItem>
                                    ))}
                                    <PaginationItem>
                                        <PaginationNext onClick={() => handlePageChange(plans.current_page + 1)} className={plans.current_page === plans.last_page ? 'pointer-events-none opacity-50' : 'cursor-pointer'} />
                                    </PaginationItem>
                                </PaginationContent>
                            </Pagination>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {viewPlan && (
                <ViewPlanModal 
                    open={!!viewPlan} 
                    onOpenChange={(open) => !open && setViewPlan(null)}
                    plan={viewPlan}
                />
            )}

            {canCreate && (
                <CreatePlanModal 
                    open={createOpen} 
                    onOpenChange={setCreateOpen}
                    features={features}
                />
            )}

            {canEdit && editPlan && (
                <EditPlanModal 
                    open={!!editPlan} 
                    onOpenChange={(open) => !open && setEditPlan(null)}
                    plan={editPlan}
                    features={features}
                />
            )}

            {canDelete && deletePlan && (
                <DeletePlanDialog 
                    open={!!deletePlan} 
                    onOpenChange={(open) => !open && setDeletePlan(null)}
                    plan={deletePlan}
                />
            )}
        </AppLayout>
    );
}
