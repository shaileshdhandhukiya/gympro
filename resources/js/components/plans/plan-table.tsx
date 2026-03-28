import { Plan } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Pencil, Trash2, Eye } from 'lucide-react';
import StatusBadge, { badgeVariants } from '@/components/shared/status-badge';

interface Props {
    plans: Plan[];
    onView?: (plan: Plan) => void;
    onEdit?: (plan: Plan) => void;
    onDelete?: (plan: Plan) => void;
}

const shiftLabels = {
    morning: 'Morning',
    evening: 'Evening',
    full_day: 'Full Day',
};

const featureColors = [
    badgeVariants.success,
    badgeVariants.warning,
    badgeVariants.danger,
    badgeVariants.info,
    badgeVariants.purple,
    badgeVariants.orange,
];

const getFeatureColor = (featureId: number) => {
    return featureColors[featureId % featureColors.length];
};

export default function PlanTable({ plans, onView, onEdit, onDelete }: Props) {
    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead className="w-16">Sr No</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Shift</TableHead>
                    <TableHead>Features</TableHead>
                    <TableHead>Status</TableHead>
                    {(onView || onEdit || onDelete) && <TableHead className="text-right">Actions</TableHead>}
                </TableRow>
            </TableHeader>
            <TableBody>
                {plans.map((plan, index) => (
                    <TableRow key={plan.id} className="hover:bg-gray-50 dark:hover:bg-[oklch(0.269_0_0)]">
                        <TableCell>{index + 1}</TableCell>
                        <TableCell className="font-medium">{plan.name}</TableCell>
                        <TableCell>{plan.duration_months} month{plan.duration_months > 1 ? 's' : ''}</TableCell>
                        <TableCell>₹{plan.price}</TableCell>
                        <TableCell>
                            <StatusBadge status={plan.shift} />
                        </TableCell>
                        <TableCell>
                            <div className="flex flex-wrap gap-1">
                                {plan.features && plan.features.length > 0 ? (
                                    plan.features.map((feature) => (
                                        <Badge key={feature.id} variant="outline" className={getFeatureColor(feature.id)}>
                                            {feature.name}
                                        </Badge>
                                    ))
                                ) : (
                                    <span className="text-sm text-muted-foreground">-</span>
                                )}
                            </div>
                        </TableCell>
                        <TableCell>
                            <StatusBadge status={plan.status} />
                        </TableCell>
                        {(onView || onEdit || onDelete) && (
                            <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                    {onView && (
                                        <Button variant="outline" size="sm" onClick={() => onView(plan)}>
                                            <Eye className="h-4 w-4" />
                                        </Button>
                                    )}
                                    {onEdit && (
                                        <Button variant="outline" size="sm" onClick={() => onEdit(plan)}>
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                    )}
                                    {onDelete && (
                                        <Button variant="outline" size="sm" onClick={() => onDelete(plan)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>
                            </TableCell>
                        )}
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}
