import DeleteDialog from '@/components/shared/delete-dialog';
import { Payment } from '@/types';

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    payment: Payment;
}

export default function DeletePaymentDialog({ open, onOpenChange, payment }: Props) {
    return (
        <DeleteDialog
            open={open}
            onOpenChange={onOpenChange}
            itemName={payment.invoice_number}
            entityType="Payment"
            route={`/payments/${payment.id}`}
        />
    );
}
