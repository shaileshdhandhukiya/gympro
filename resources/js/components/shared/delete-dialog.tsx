import { useForm } from '@inertiajs/react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface DeleteDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    itemName: string;
    entityType: string;
    route: string;
    description?: string;
}

export default function DeleteDialog({ 
    open, 
    onOpenChange, 
    itemName, 
    entityType, 
    route,
    description 
}: DeleteDialogProps) {
    const { delete: destroy, processing } = useForm();

    const handleDelete = () => {
        destroy(route, {
            onSuccess: () => {
                onOpenChange(false);
                toast.success(`${entityType} deleted successfully`);
            },
            onError: () => {
                toast.error(`Failed to delete ${entityType}`);
            },
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Delete {entityType}</DialogTitle>
                    <DialogDescription>
                        {description || `Are you sure you want to delete "${itemName}"? This action cannot be undone.`}
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button variant="destructive" onClick={handleDelete} disabled={processing}>
                        Delete
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
