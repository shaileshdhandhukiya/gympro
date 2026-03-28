import DeleteDialog from '@/components/shared/delete-dialog';
import { Trainer } from '@/types';

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    trainer: Trainer;
}

export default function DeleteTrainerDialog({ open, onOpenChange, trainer }: Props) {
    return (
        <DeleteDialog
            open={open}
            onOpenChange={onOpenChange}
            itemName={trainer.user?.name || 'this trainer'}
            entityType="Trainer"
            route={`/trainers/${trainer.id}`}
        />
    );
}
