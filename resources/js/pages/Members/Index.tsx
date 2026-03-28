import { useState, useEffect } from 'react';
import { useDebounce } from 'use-debounce';
import { Head, usePage, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Users, UserCheck, UserX, Plus, Search, X } from 'lucide-react';
import { Member } from '@/types';
import MemberTable from '@/components/members/member-table';
import CreateMemberModal from '@/components/members/create-member-modal';
import EditMemberModal from '@/components/members/edit-member-modal';
import ViewMemberModal from '@/components/members/view-member-modal';
import DeleteMemberDialog from '@/components/members/delete-member-dialog';

interface PaginatedData {
    data: Member[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

interface Props {
    members: PaginatedData;
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
}

export default function Index({ members, stats, filters }: Props) {
    const { auth } = usePage().props as any;
    const [viewMember, setViewMember] = useState<Member | null>(null);
    const [createOpen, setCreateOpen] = useState(false);
    const [editMember, setEditMember] = useState<Member | null>(null);
    const [deleteMember, setDeleteMember] = useState<Member | null>(null);
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || 'all');
    const [debouncedSearch] = useDebounce(search, 500);

    const canCreate = auth.permissions.includes('create_members');
    const canEdit = auth.permissions.includes('edit_members');
    const canDelete = auth.permissions.includes('delete_members');

    useEffect(() => {
        router.get('/members', { 
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
        router.get('/members', { 
            page, 
            search: search || undefined,
            status: status !== 'all' ? status : undefined,
            per_page: filters.per_page
        }, { preserveState: true });
    };

    const handlePerPageChange = (value: string) => {
        router.get('/members', { 
            search: search || undefined,
            status: status !== 'all' ? status : undefined,
            per_page: value
        }, { preserveState: true });
    };

    const startItem = (members.current_page - 1) * members.per_page + 1;
    const endItem = Math.min(members.current_page * members.per_page, members.total);

    const getPageNumbers = () => {
        const pages: (number | string)[] = [];
        const { current_page, last_page } = members;
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
            <Head title="Members" />
            
            <div className="container mx-auto p-4 md:p-6 space-y-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold">Members</h1>
                        <p className="text-sm md:text-base text-muted-foreground">Manage gym members</p>
                    </div>
                    {canCreate && (
                        <Button onClick={() => setCreateOpen(true)} className="w-full md:w-auto">
                            <Plus className="mr-2 h-4 w-4" />
                            Add Member
                        </Button>
                    )}
                </div>

                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Members</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Active Members</CardTitle>
                            <UserCheck className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.active}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Inactive Members</CardTitle>
                            <UserX className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.inactive}</div>
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
                                        placeholder="Search members..."
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
                                            <SelectItem value="active">Active</SelectItem>
                                            <SelectItem value="inactive">Inactive</SelectItem>
                                            <SelectItem value="expired">Expired</SelectItem>
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
                            <MemberTable 
                                members={members.data}
                                onView={setViewMember}
                                onEdit={canEdit ? setEditMember : undefined}
                                onDelete={canDelete ? setDeleteMember : undefined}
                            />
                        </div>
                        {members.data.length === 0 && (
                            <div className="text-center py-12">
                                <Users className="mx-auto h-12 w-12 text-muted-foreground" />
                                <h3 className="mt-4 text-lg font-semibold">No members found</h3>
                                <p className="mt-2 text-sm text-muted-foreground">
                                    {search || status !== 'all' ? 'Try adjusting your filters' : 'Get started by adding a new member'}
                                </p>
                            </div>
                        )}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4">
                            <div className="text-sm text-muted-foreground text-center sm:text-left">
                                Showing {startItem} to {endItem} of {members.total} results
                            </div>
                            <div className="overflow-x-auto pb-2 sm:pb-0">
                                <Pagination>
                                    <PaginationContent>
                                        <PaginationItem>
                                            <PaginationPrevious onClick={() => handlePageChange(members.current_page - 1)} className={members.current_page === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'} />
                                        </PaginationItem>
                                        {getPageNumbers().map((page, idx) => (
                                            <PaginationItem key={idx}>
                                                {page === '...' ? <PaginationEllipsis /> : <PaginationLink onClick={() => handlePageChange(page as number)} isActive={page === members.current_page} className="cursor-pointer">{page}</PaginationLink>}
                                            </PaginationItem>
                                        ))}
                                        <PaginationItem>
                                            <PaginationNext onClick={() => handlePageChange(members.current_page + 1)} className={members.current_page === members.last_page ? 'pointer-events-none opacity-50' : 'cursor-pointer'} />
                                        </PaginationItem>
                                    </PaginationContent>
                                </Pagination>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {viewMember && (
                <ViewMemberModal 
                    open={!!viewMember} 
                    onOpenChange={(open) => !open && setViewMember(null)}
                    member={viewMember}
                />
            )}

            {canCreate && (
                <CreateMemberModal 
                    open={createOpen} 
                    onOpenChange={setCreateOpen}
                />
            )}

            {canEdit && editMember && (
                <EditMemberModal 
                    open={!!editMember} 
                    onOpenChange={(open) => !open && setEditMember(null)}
                    member={editMember}
                />
            )}

            {canDelete && deleteMember && (
                <DeleteMemberDialog 
                    open={!!deleteMember} 
                    onOpenChange={(open) => !open && setDeleteMember(null)}
                    member={deleteMember}
                />
            )}
        </AppLayout>
    );
}
