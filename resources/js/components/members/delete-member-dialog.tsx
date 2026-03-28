import DeleteDialog from '@/components/shared/delete-dialog';
import { Member } from '@/types';

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    member: Member;
}

export default function DeleteMemberDialog({ open, onOpenChange, member }: Props) {
    return (
        <DeleteDialog
            open={open}
            onOpenChange={onOpenChange}
            itemName={member.user?.name || 'this member'}
            entityType="Member"
            route={`/members/${member.id}`}
        />
    );
}
