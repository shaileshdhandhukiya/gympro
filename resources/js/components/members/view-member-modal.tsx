import { Member } from '@/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    member: Member;
}

export default function ViewMemberModal({ open, onOpenChange, member }: Props) {
    const getInitials = (name: string) => {
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Member Details</DialogTitle>
                </DialogHeader>

                <div className="space-y-6">
                    <div className="flex items-center gap-4">
                        <Avatar className="h-20 w-20">
                            <AvatarImage 
                                src={member.user?.profile_image ? `/storage/${member.user.profile_image}` : undefined} 
                                alt={member.user?.name} 
                            />
                            <AvatarFallback className="text-xl">
                                {getInitials(member.user?.name || '')}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <h3 className="text-2xl font-bold">{member.user?.name}</h3>
                            <Badge 
                                variant="outline"
                                className={
                                    member.status === 'active'
                                        ? 'border-green-200 text-green-700 bg-green-50 dark:border-green-800 dark:text-green-400 dark:bg-green-950'
                                        : member.status === 'expired'
                                        ? 'border-red-200 text-red-700 bg-red-50 dark:border-red-800 dark:text-red-400 dark:bg-red-950'
                                        : 'border-gray-200 text-gray-700 bg-gray-50 dark:border-gray-800 dark:text-gray-400 dark:bg-gray-950'
                                }
                            >
                                {member.status}
                            </Badge>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm text-muted-foreground">Email</p>
                            <p className="font-medium">{member.user?.email}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Phone</p>
                            <p className="font-medium">{member.user?.phone || 'N/A'}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Gender</p>
                            <p className="font-medium capitalize">{member.gender}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Date of Birth</p>
                            <p className="font-medium">{member.date_of_birth ? new Date(member.date_of_birth).toLocaleDateString() : 'N/A'}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Join Date</p>
                            <p className="font-medium">{new Date(member.join_date).toLocaleDateString()}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Member ID</p>
                            <p className="font-medium">#{member.id}</p>
                        </div>
                    </div>

                    {member.address && (
                        <div>
                            <p className="text-sm text-muted-foreground">Address</p>
                            <p className="font-medium">{member.address}</p>
                        </div>
                    )}

                    {member.notes && (
                        <div>
                            <p className="text-sm text-muted-foreground">Notes</p>
                            <p className="font-medium">{member.notes}</p>
                        </div>
                    )}

                    {member.subscriptions && member.subscriptions.length > 0 && (
                        <div>
                            <p className="text-sm text-muted-foreground mb-2">Active Subscription</p>
                            <div className="border rounded-lg p-4 space-y-2">
                                <div className="flex justify-between items-center">
                                    <p className="font-semibold text-lg">{member.subscriptions[0].plan?.name}</p>
                                    <Badge className="border-green-200 text-green-700 bg-green-50 dark:border-green-800 dark:text-green-400 dark:bg-green-950">
                                        Active
                                    </Badge>
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                    <div>
                                        <span className="text-muted-foreground">Start Date: </span>
                                        <span className="font-medium">{new Date(member.subscriptions[0].start_date).toLocaleDateString()}</span>
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground">End Date: </span>
                                        <span className="font-medium">{new Date(member.subscriptions[0].end_date).toLocaleDateString()}</span>
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground">Plan Price: </span>
                                        <span className="font-medium">₹{member.subscriptions[0].plan?.price}</span>
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground">Amount Paid: </span>
                                        <span className="font-medium">₹{member.subscriptions[0].amount_paid}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
