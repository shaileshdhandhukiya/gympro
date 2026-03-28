import { Badge } from '@/components/ui/badge';

export const badgeVariants = {
    success: 'border-green-200 text-green-700 bg-green-50 dark:border-green-800 dark:text-green-400 dark:bg-green-950',
    warning: 'border-yellow-200 text-yellow-700 bg-yellow-50 dark:border-yellow-800 dark:text-yellow-400 dark:bg-yellow-950',
    danger: 'border-red-200 text-red-700 bg-red-50 dark:border-red-800 dark:text-red-400 dark:bg-red-950',
    info: 'border-blue-200 text-blue-700 bg-blue-50 dark:border-blue-800 dark:text-blue-400 dark:bg-blue-950',
    purple: 'border-purple-200 text-purple-700 bg-purple-50 dark:border-purple-800 dark:text-purple-400 dark:bg-purple-950',
    orange: 'border-orange-200 text-orange-700 bg-orange-50 dark:border-orange-800 dark:text-orange-400 dark:bg-orange-950',
    neutral: 'border-gray-200 text-gray-700 bg-gray-50 dark:border-gray-800 dark:text-gray-400 dark:bg-gray-950',
};

export const statusColorMap: Record<string, keyof typeof badgeVariants> = {
    active: 'success',
    completed: 'success',
    paid: 'success',
    success: 'success',
    pending: 'warning',
    processing: 'warning',
    expired: 'danger',
    failed: 'danger',
    overdue: 'danger',
    cancelled: 'neutral',
    inactive: 'neutral',
    morning: 'info',
    evening: 'purple',
    full_day: 'orange',
};

export function getStatusBadgeClass(status: string): string {
    const variant = statusColorMap[status.toLowerCase()] || 'neutral';
    return badgeVariants[variant];
}

interface StatusBadgeProps {
    status: string;
    className?: string;
}

export default function StatusBadge({ status, className = '' }: StatusBadgeProps) {
    return (
        <Badge variant="outline" className={`${getStatusBadgeClass(status)} ${className}`}>
            {status}
        </Badge>
    );
}
