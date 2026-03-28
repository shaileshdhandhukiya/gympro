import { LayoutGrid, Calendar, ShoppingCart, User, Receipt } from 'lucide-react';
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
        title: 'My Orders',
        href: '/member/orders',
        icon: Receipt,
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
