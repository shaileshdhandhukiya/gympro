import AppLayout from '@/layouts/app-layout';
import { Head, router, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { useDebounce } from 'use-debounce';
import { PageProps, Equipment } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { Dumbbell, CheckCircle, Wrench, Plus, Search, X } from 'lucide-react';
import EquipmentTable from '@/components/equipment/equipment-table';
import EquipmentModal from '@/components/equipment/equipment-modal';
import ViewEquipmentModal from '@/components/equipment/view-equipment-modal';
import DeleteEquipmentDialog from '@/components/equipment/delete-equipment-dialog';

interface Props extends PageProps {
    equipment: {
        data: Equipment[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    stats: {
        total: number;
        active: number;
        maintenance: number;
    };
    filters: {
        search?: string;
        status?: string;
        per_page: number;
    };
}

export default function Index({ equipment, stats, filters }: Props) {
    const { auth } = usePage().props as any;
    const [createOpen, setCreateOpen] = useState(false);
    const [editEquipment, setEditEquipment] = useState<Equipment | null>(null);
    const [viewEquipment, setViewEquipment] = useState<Equipment | null>(null);
    const [deleteEquipment, setDeleteEquipment] = useState<Equipment | null>(null);
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || 'all');
    const [debouncedSearch] = useDebounce(search, 500);

    const canEdit = auth.permissions.includes('edit_equipment');
    const canDelete = auth.permissions.includes('delete_equipment');

    useEffect(() => {
        router.get('/equipment', {
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
        router.get('/equipment', {
            page,
            search: search || undefined,
            status: status !== 'all' ? status : undefined,
            per_page: filters.per_page
        }, { preserveState: true });
    };

    const handlePerPageChange = (value: string) => {
        router.get('/equipment', {
            search: search || undefined,
            status: status !== 'all' ? status : undefined,
            per_page: value
        }, { preserveState: true });
    };

    const startItem = (equipment.current_page - 1) * equipment.per_page + 1;
    const endItem = Math.min(equipment.current_page * equipment.per_page, equipment.total);

    const getPageNumbers = () => {
        const pages: (number | string)[] = [];
        const { current_page, last_page } = equipment;
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
            <Head title="Equipment" />
            <div className="container mx-auto p-4 md:p-6 space-y-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold">Equipment</h1>
                        <p className="text-sm md:text-base text-muted-foreground">Manage gym equipment</p>
                    </div>
                    <Button onClick={() => setCreateOpen(true)} className="w-full md:w-auto">
                        <Plus className="mr-2 h-4 w-4" />
                        Add Equipment
                    </Button>
                </div>

                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Equipment</CardTitle>
                            <Dumbbell className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Active</CardTitle>
                            <CheckCircle className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.active}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Under Maintenance</CardTitle>
                            <Wrench className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.maintenance}</div>
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
                                        placeholder="Search equipment..."
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
                                        <SelectItem value="maintenance">Maintenance</SelectItem>
                                        <SelectItem value="retired">Retired</SelectItem>
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
                            <EquipmentTable
                                equipment={equipment.data}
                                onEdit={canEdit ? setEditEquipment : () => {}}
                                onDelete={canDelete ? setDeleteEquipment : () => {}}
                                onView={setViewEquipment}
                            />
                        </div>
                        {equipment.data.length === 0 && (
                            <div className="text-center py-12">
                                <Dumbbell className="mx-auto h-12 w-12 text-muted-foreground" />
                                <h3 className="mt-4 text-lg font-semibold">No equipment found</h3>
                                <p className="mt-2 text-sm text-muted-foreground">
                                    {search || status !== 'all' ? 'Try adjusting your filters' : 'Get started by adding new equipment'}
                                </p>
                            </div>
                        )}
                        <div className="flex items-center justify-between">
                            <div className="text-sm text-muted-foreground">
                                Showing {startItem} to {endItem} of {equipment.total} results
                            </div>
                            <Pagination>
                                <PaginationContent>
                                    <PaginationItem>
                                        <PaginationPrevious onClick={() => handlePageChange(equipment.current_page - 1)} className={equipment.current_page === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'} />
                                    </PaginationItem>
                                    {getPageNumbers().map((page, idx) => (
                                        <PaginationItem key={idx}>
                                            {page === '...' ? <PaginationEllipsis /> : <PaginationLink onClick={() => handlePageChange(page as number)} isActive={page === equipment.current_page} className="cursor-pointer">{page}</PaginationLink>}
                                        </PaginationItem>
                                    ))}
                                    <PaginationItem>
                                        <PaginationNext onClick={() => handlePageChange(equipment.current_page + 1)} className={equipment.current_page === equipment.last_page ? 'pointer-events-none opacity-50' : 'cursor-pointer'} />
                                    </PaginationItem>
                                </PaginationContent>
                            </Pagination>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <EquipmentModal open={createOpen} onOpenChange={setCreateOpen} />
            <EquipmentModal open={!!editEquipment} onOpenChange={(open) => !open && setEditEquipment(null)} equipment={editEquipment} />
            <ViewEquipmentModal open={!!viewEquipment} onOpenChange={(open) => !open && setViewEquipment(null)} equipment={viewEquipment} />
            <DeleteEquipmentDialog open={!!deleteEquipment} onOpenChange={(open) => !open && setDeleteEquipment(null)} equipment={deleteEquipment} />
        </AppLayout>
    );
}
