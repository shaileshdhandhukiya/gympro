import DeleteDialog from '@/components/shared/delete-dialog';
import { Plan } from '@/types';

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    plan: Plan;
}

export default function DeletePlanDialog({ open, onOpenChange, plan }: Props) {
    return (
        <DeleteDialog
            open={open}
            onOpenChange={onOpenChange}
            itemName={plan.name}
            entityType="Plan"
            route={`/plans/${plan.id}`}
        />
    );
}
