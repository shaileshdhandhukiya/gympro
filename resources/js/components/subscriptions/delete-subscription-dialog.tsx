import DeleteDialog from '@/components/shared/delete-dialog';
import { Subscription } from '@/types';

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    subscription: Subscription;
}

export default function DeleteSubscriptionDialog({ open, onOpenChange, subscription }: Props) {
    return (
        <DeleteDialog
            open={open}
            onOpenChange={onOpenChange}
            itemName={`${subscription.member?.user?.name}'s subscription`}
            entityType="Subscription"
            route={`/subscriptions/${subscription.id}`}
        />
    );
}
