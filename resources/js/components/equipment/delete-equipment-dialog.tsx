import DeleteDialog from '@/components/shared/delete-dialog';
import { Equipment } from '@/types';

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    equipment: Equipment | null;
}

export default function DeleteEquipmentDialog({ open, onOpenChange, equipment }: Props) {
    if (!equipment) return null;
    
    return (
        <DeleteDialog
            open={open}
            onOpenChange={onOpenChange}
            itemName={equipment.name}
            entityType="Equipment"
            route={`/equipment/${equipment.id}`}
        />
    );
}
