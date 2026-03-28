import DeleteDialog from '@/components/shared/delete-dialog';
import { User } from '@/types';

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    user: User;
}

export default function DeleteUserDialog({ open, onOpenChange, user }: Props) {
    return (
        <DeleteDialog
            open={open}
            onOpenChange={onOpenChange}
            itemName={user.name}
            entityType="User"
            route={`/users/${user.id}`}
        />
    );
}
