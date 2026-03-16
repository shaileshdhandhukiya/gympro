import { Payment } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Pencil, Trash2, Download } from 'lucide-react';

interface Props {
    payments: Payment[];
    onEdit?: (payment: Payment) => void;
    onDelete?: (payment: Payment) => void;
}

export default function PaymentTable({ payments, onEdit, onDelete }: Props) {
    const handleDownload = (payment: Payment) => {
        window.open(`/payments/${payment.id}/invoice`, '_blank');
    };

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead className="w-16">Sr No</TableHead>
                    <TableHead>Invoice #</TableHead>
                    <TableHead>Member</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {payments.map((payment, index) => (
                    <TableRow key={payment.id} className="hover:bg-gray-50 dark:hover:bg-[oklch(0.269_0_0)]">
                        <TableCell>{index + 1}</TableCell>
                        <TableCell className="font-medium">{payment.invoice_number}</TableCell>
                        <TableCell>{payment.subscription?.member?.user?.name || payment.member?.user?.name}</TableCell>
                        <TableCell>₹{payment.amount}</TableCell>
                        <TableCell className="capitalize">{payment.payment_method}</TableCell>
                        <TableCell>{new Date(payment.payment_date).toLocaleDateString()}</TableCell>
                        <TableCell>
                            <Badge 
                                variant="outline"
                                className={
                                    payment.status === 'completed'
                                        ? 'border-green-200 text-green-700 bg-green-50 dark:border-green-800 dark:text-green-400 dark:bg-green-950'
                                        : payment.status === 'pending'
                                        ? 'border-yellow-200 text-yellow-700 bg-yellow-50 dark:border-yellow-800 dark:text-yellow-400 dark:bg-yellow-950'
                                        : payment.status === 'failed'
                                        ? 'border-red-200 text-red-700 bg-red-50 dark:border-red-800 dark:text-red-400 dark:bg-red-950'
                                        : 'border-gray-200 text-gray-700 bg-gray-50 dark:border-gray-800 dark:text-gray-400 dark:bg-gray-950'
                                }
                            >
                                {payment.status}
                            </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                                <Button variant="outline" size="sm" onClick={() => handleDownload(payment)}>
                                    <Download className="h-4 w-4" />
                                </Button>
                                {onEdit && (
                                    <Button variant="outline" size="sm" onClick={() => onEdit(payment)}>
                                        <Pencil className="h-4 w-4" />
                                    </Button>
                                )}
                                {onDelete && (
                                    <Button variant="outline" size="sm" onClick={() => onDelete(payment)}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}
