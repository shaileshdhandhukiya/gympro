import DeleteDialog from '@/components/shared/delete-dialog';
import { Attendance } from '@/types';

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    attendance: Attendance;
}

export default function DeleteAttendanceDialog({ open, onOpenChange, attendance }: Props) {
    return (
        <DeleteDialog
            open={open}
            onOpenChange={onOpenChange}
            itemName={`attendance record for ${attendance.member?.name}`}
            entityType="Attendance"
            route={`/attendances/${attendance.id}`}
        />
    );
}
