import { LayoutGrid, Calendar, ShoppingCart, User } from 'lucide-react';
import { type NavItem } from '@/types';

export const memberNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: '/member/dashboard',
        icon: LayoutGrid,
    },
    {
        title: 'My Attendance',
        href: '/member/attendance',
        icon: Calendar,
    },
    {
        title: 'Plans',
        href: '/member/plans',
        icon: ShoppingCart,
    },
    {
        title: 'My Profile',
        href: '/settings/profile',
        icon: User,
    },
];
