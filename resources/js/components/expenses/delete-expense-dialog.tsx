import DeleteDialog from '@/components/shared/delete-dialog';
import { Expense } from '@/types';

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    expense: Expense | null;
}

export default function DeleteExpenseDialog({ open, onOpenChange, expense }: Props) {
    if (!expense) return null;
    
    return (
        <DeleteDialog
            open={open}
            onOpenChange={onOpenChange}
            itemName={expense.title}
            entityType="Expense"
            route={`/expenses/${expense.id}`}
        />
    );
}
