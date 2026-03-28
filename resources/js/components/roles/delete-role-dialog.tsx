import DeleteDialog from '@/components/shared/delete-dialog';
import { Role } from '@/types';

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    role: Role;
}

export default function DeleteRoleDialog({ open, onOpenChange, role }: Props) {
    return (
        <DeleteDialog
            open={open}
            onOpenChange={onOpenChange}
            itemName={role.name}
            entityType="Role"
            route={`/roles/${role.id}`}
        />
    );
}
