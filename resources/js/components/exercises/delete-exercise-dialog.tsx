import DeleteDialog from '@/components/shared/delete-dialog';
import { Exercise } from '@/types';

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    exercise: Exercise;
}

export default function DeleteExerciseDialog({ open, onOpenChange, exercise }: Props) {
    return (
        <DeleteDialog
            open={open}
            onOpenChange={onOpenChange}
            itemName={exercise.name}
            entityType="Exercise"
            route={`/exercises/${exercise.id}`}
        />
    );
}
