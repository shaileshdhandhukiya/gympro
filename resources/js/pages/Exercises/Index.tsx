import { useState, useEffect } from 'react';
import { useDebounce } from 'use-debounce';
import { Head, usePage, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Dumbbell, Plus, Search, X } from 'lucide-react';
import { Exercise } from '@/types';
import ExerciseTable from '@/components/exercises/exercise-table';
import ExerciseFormModal from '@/components/exercises/exercise-form-modal';
import DeleteExerciseDialog from '@/components/exercises/delete-exercise-dialog';
import ViewExerciseModal from '@/components/exercises/view-exercise-modal';

interface PaginatedData {
    data: Exercise[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

interface Props {
    exercises: PaginatedData;
    stats: {
        total: number;
        active: number;
        inactive: number;
    };
    filters: {
        per_page: number;
        search: string | null;
        category: string | null;
        difficulty: string | null;
        muscle_group: string | null;
        status: string | null;
    };
}

export default function Index({ exercises, stats, filters }: Props) {
    const { auth } = usePage().props as any;
    const [viewExercise, setViewExercise] = useState<Exercise | null>(null);
    const [createOpen, setCreateOpen] = useState(false);
    const [editExercise, setEditExercise] = useState<Exercise | null>(null);
    const [deleteExercise, setDeleteExercise] = useState<Exercise | null>(null);
    const [search, setSearch] = useState(filters.search || '');
    const [category, setCategory] = useState(filters.category || 'all');
    const [difficulty, setDifficulty] = useState(filters.difficulty || 'all');
    const [muscleGroup, setMuscleGroup] = useState(filters.muscle_group || 'all');
    const [status, setStatus] = useState(filters.status || 'all');
    const [debouncedSearch] = useDebounce(search, 500);

    const canCreate = auth.permissions.includes('create_exercises');
    const canEdit = auth.permissions.includes('edit_exercises');
    const canDelete = auth.permissions.includes('delete_exercises');

    useEffect(() => {
        router.get('/exercises', {
            search: debouncedSearch || undefined,
            category: category !== 'all' ? category : undefined,
            difficulty: difficulty !== 'all' ? difficulty : undefined,
            muscle_group: muscleGroup !== 'all' ? muscleGroup : undefined,
            status: status !== 'all' ? status : undefined,
            per_page: filters.per_page,
        }, { preserveState: true, preserveScroll: true });
    }, [debouncedSearch, category, difficulty, muscleGroup, status]);

    const handleClearFilters = () => {
        setSearch('');
        setCategory('all');
        setDifficulty('all');
        setMuscleGroup('all');
        setStatus('all');
    };

    const handlePageChange = (page: number) => {
        router.get('/exercises', {
            page,
            search: search || undefined,
            category: category !== 'all' ? category : undefined,
            difficulty: difficulty !== 'all' ? difficulty : undefined,
            muscle_group: muscleGroup !== 'all' ? muscleGroup : undefined,
            status: status !== 'all' ? status : undefined,
            per_page: filters.per_page,
        }, { preserveState: true });
    };

    const handlePerPageChange = (value: string) => {
        router.get('/exercises', {
            search: search || undefined,
            category: category !== 'all' ? category : undefined,
            difficulty: difficulty !== 'all' ? difficulty : undefined,
            muscle_group: muscleGroup !== 'all' ? muscleGroup : undefined,
            status: status !== 'all' ? status : undefined,
            per_page: value,
        }, { preserveState: true });
    };

    const startItem = (exercises.current_page - 1) * exercises.per_page + 1;
    const endItem = Math.min(exercises.current_page * exercises.per_page, exercises.total);

    const getPageNumbers = () => {
        const pages: (number | string)[] = [];
        const { current_page, last_page } = exercises;
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
            <Head title="Exercises" />

            <div className="container mx-auto p-4 md:p-6 space-y-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold">Exercises</h1>
                        <p className="text-sm md:text-base text-muted-foreground">Manage gym exercises</p>
                    </div>
                    {canCreate && (
                        <Button onClick={() => setCreateOpen(true)} className="w-full md:w-auto">
                            <Plus className="mr-2 h-4 w-4" />
                            Add Exercise
                        </Button>
                    )}
                </div>

                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Exercises</CardTitle>
                            <Dumbbell className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Active</CardTitle>
                            <Dumbbell className="h-4 w-4 text-green-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.active}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Inactive</CardTitle>
                            <Dumbbell className="h-4 w-4 text-gray-600" />
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
                                <Select value={(filters.per_page || 10).toString()} onValueChange={handlePerPageChange}>
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
                                        placeholder="Search exercises..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className="pl-8 h-9"
                                    />
                                </div>
                                <Select value={difficulty} onValueChange={setDifficulty}>
                                    <SelectTrigger className="w-40 h-9">
                                        <SelectValue placeholder="Difficulty" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Difficulty</SelectItem>
                                        <SelectItem value="beginner">Beginner</SelectItem>
                                        <SelectItem value="intermediate">Intermediate</SelectItem>
                                        <SelectItem value="advanced">Advanced</SelectItem>
                                    </SelectContent>
                                </Select>
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
                                {(search || category !== 'all' || difficulty !== 'all' || muscleGroup !== 'all' || status !== 'all') && (
                                    <Button variant="ghost" size="sm" onClick={handleClearFilters}>
                                        <X className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <ExerciseTable
                                exercises={exercises.data}
                                onView={setViewExercise}
                                onEdit={canEdit ? setEditExercise : undefined}
                                onDelete={canDelete ? setDeleteExercise : undefined}
                            />
                        </div>

                        {exercises.data.length === 0 && (
                            <div className="text-center py-12">
                                <Dumbbell className="mx-auto h-12 w-12 text-muted-foreground" />
                                <h3 className="mt-4 text-lg font-semibold">No exercises found</h3>
                                <p className="mt-2 text-sm text-muted-foreground">
                                    {search || category !== 'all' || difficulty !== 'all' || muscleGroup !== 'all' || status !== 'all'
                                        ? 'Try adjusting your filters'
                                        : 'Get started by adding a new exercise'}
                                </p>
                            </div>
                        )}

                        <div className="flex items-center justify-between">
                            <div className="text-sm text-muted-foreground">
                                Showing {startItem} to {endItem} of {exercises.total} results
                            </div>
                            <Pagination>
                                <PaginationContent>
                                    <PaginationItem>
                                        <PaginationPrevious
                                            onClick={() => handlePageChange(exercises.current_page - 1)}
                                            className={exercises.current_page === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                                        />
                                    </PaginationItem>
                                    {getPageNumbers().map((page, idx) => (
                                        <PaginationItem key={idx}>
                                            {page === '...' ? (
                                                <PaginationEllipsis />
                                            ) : (
                                                <PaginationLink
                                                    onClick={() => handlePageChange(page as number)}
                                                    isActive={page === exercises.current_page}
                                                    className="cursor-pointer"
                                                >
                                                    {page}
                                                </PaginationLink>
                                            )}
                                        </PaginationItem>
                                    ))}
                                    <PaginationItem>
                                        <PaginationNext
                                            onClick={() => handlePageChange(exercises.current_page + 1)}
                                            className={exercises.current_page === exercises.last_page ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                                        />
                                    </PaginationItem>
                                </PaginationContent>
                            </Pagination>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {viewExercise && (
                <ViewExerciseModal
                    open={!!viewExercise}
                    onOpenChange={(open) => !open && setViewExercise(null)}
                    exercise={viewExercise}
                />
            )}

            {canCreate && (
                <ExerciseFormModal
                    open={createOpen}
                    onOpenChange={setCreateOpen}
                />
            )}

            {canEdit && editExercise && (
                <ExerciseFormModal
                    open={!!editExercise}
                    onOpenChange={(open) => !open && setEditExercise(null)}
                    exercise={editExercise}
                />
            )}

            {canDelete && deleteExercise && (
                <DeleteExerciseDialog
                    open={!!deleteExercise}
                    onOpenChange={(open) => !open && setDeleteExercise(null)}
                    exercise={deleteExercise}
                />
            )}
        </AppLayout>
    );
}
