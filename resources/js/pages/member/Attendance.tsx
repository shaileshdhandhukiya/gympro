import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, router, Link } from '@inertiajs/react';
import { Member, PageProps } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, TrendingUp, Award } from 'lucide-react';

interface Props extends PageProps {
    member: Member;
    attendances: string[];
    stats: {
        total_this_month: number;
        total_all_time: number;
        current_streak: number;
    };
    year: number;
    month: number;
}

export default function Attendance({ member, attendances, stats, year, month }: Props) {
    const [currentDate, setCurrentDate] = useState(new Date(year, month - 1));

    const handleMonthChange = (direction: 'prev' | 'next') => {
        const newDate = new Date(currentDate);
        if (direction === 'prev') {
            newDate.setMonth(newDate.getMonth() - 1);
        } else {
            newDate.setMonth(newDate.getMonth() + 1);
        }
        setCurrentDate(newDate);
        router.get('/member/attendance', {
            year: newDate.getFullYear(),
            month: newDate.getMonth() + 1,
        });
    };

    const isAttendanceDate = (date: Date) => {
        const dateStr = date.toISOString().split('T')[0];
        return attendances.includes(dateStr);
    };

    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    return (
        <AppLayout>
            <Head title="My Attendance" />
            <div className="container mx-auto p-6 space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">My Attendance</h1>
                        <p className="text-muted-foreground">Track your gym visits</p>
                    </div>
                    <Button variant="outline" asChild>
                        <Link href="/member/dashboard">Back to Dashboard</Link>
                    </Button>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">This Month</CardTitle>
                            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total_this_month} days</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">All Time</CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total_all_time} days</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
                            <Award className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.current_streak} days</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Calendar Card */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle>Attendance Calendar</CardTitle>
                            <div className="flex items-center gap-2 hidden">
                                <Button variant="outline" size="icon" onClick={() => handleMonthChange('prev')}>
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <span className="text-sm font-medium min-w-[150px] text-center">
                                    {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                                </span>
                                <Button variant="outline" size="icon" onClick={() => handleMonthChange('next')}>
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <style>{`
                            .rdp-day_present button {
                                background-color: #22c55e !important;
                                color: white !important;
                                font-weight: bold !important;
                            }
                            .rdp-day_present button:hover {
                                background-color: #16a34a !important;
                            }
                            @media (max-width: 640px) {
                                .rdp {
                                    --rdp-cell-size: 36px;
                                    font-size: 0.875rem;
                                }
                                .rdp-caption {
                                    font-size: 0.875rem;
                                }
                            }
                            @media (min-width: 641px) and (max-width: 768px) {
                                .rdp {
                                    --rdp-cell-size: 42px;
                                }
                            }
                        `}</style>
                        <div className="flex justify-center overflow-x-auto">
                            <Calendar
                                mode="single"
                                month={currentDate}
                                onMonthChange={setCurrentDate}
                                className="rounded-lg border w-full max-w-full sm:max-w-md md:max-w-lg"
                                buttonVariant="ghost"
                                modifiers={{
                                    present: (date) => isAttendanceDate(date),
                                }}
                                modifiersClassNames={{
                                    present: 'rdp-day_present',
                                }}
                            />
                        </div>
                        <div className="flex items-center justify-center gap-4 sm:gap-6 mt-6 flex-wrap">
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 rounded bg-green-500"></div>
                                <span className="text-sm">Present</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 rounded bg-gray-200 dark:bg-gray-700"></div>
                                <span className="text-sm">Absent</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
