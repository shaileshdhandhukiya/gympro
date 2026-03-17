import { AppContent } from '@/components/app-content';
import { AppShell } from '@/components/app-shell';
import { AppSidebar } from '@/components/app-sidebar';
import { MemberSidebar } from '@/components/member/member-sidebar';
import MemberBottomNav from '@/components/member/member-bottom-nav';
import { AppSidebarHeader } from '@/components/app-sidebar-header';
import { type BreadcrumbItem } from '@/types';
import { type PropsWithChildren } from 'react';
import { usePage } from '@inertiajs/react';

export default function AppSidebarLayout({
    children,
    breadcrumbs = [],
}: PropsWithChildren<{ breadcrumbs?: BreadcrumbItem[] }>) {
    const { auth } = usePage().props as any;
    const userRoles = auth?.user?.roles || [];
    const isMember = userRoles.some((role: any) => role.name === 'Member');

    return (
        <AppShell variant="sidebar">
            {isMember ? <MemberSidebar /> : <AppSidebar />}
            <AppContent variant="sidebar">
                <AppSidebarHeader breadcrumbs={breadcrumbs} />
                <div className={isMember ? "pb-20 md:pb-0" : ""}>
                    {children}
                </div>
            </AppContent>
            {isMember && <MemberBottomNav currentRoute={window.location.pathname} user={auth.user} />}
        </AppShell>
    );
}
