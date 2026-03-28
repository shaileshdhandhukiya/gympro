import { Head, Link } from '@inertiajs/react';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Check, Crown } from 'lucide-react';
import { formatDate } from '@/lib/date-utils';

interface Plan {
    id: number;
    name: string;
    duration_months: number;
    price: number;
    admission_fee: number;
    shift: string;
    shift_time: string;
    description: string;
    status: string;
    features: Array<{
        id: number;
        name: string;
        slug: string;
    }>;
}

interface Subscription {
    id: number;
    plan_id: number;
    start_date: string;
    end_date: string;
    status: string;
    plan: Plan;
}

interface Member {
    id: number;
    name: string;
}

interface Props {
    plans: Plan[];
    activeSubscription: Subscription | null;
    member: Member;
    phonepeEnabled: boolean;
}

export default function Plans({ plans, activeSubscription, member, phonepeEnabled }: Props) {
    const monthlyPlans = plans.filter(p => p.duration_months <= 3);
    const yearlyPlans = plans.filter(p => p.duration_months > 3);

    const PlanCard = ({ plan }: { plan: Plan }) => {
        const isActive = activeSubscription?.plan_id === plan.id;

        return (
            <Card className={isActive ? 'border-primary shadow-lg' : ''}>
                <CardHeader>
                    <div className="flex items-start justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                {plan.name}
                                {isActive && <Crown className="h-5 w-5 text-primary" />}
                            </CardTitle>
                            <CardDescription>{plan.duration_months} Month{plan.duration_months > 1 ? 's' : ''}</CardDescription>
                        </div>
                        {isActive && <Badge>Active</Badge>}
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <div className="text-3xl font-bold">₹{plan.price}</div>
                        {plan.admission_fee > 0 && !activeSubscription && (
                            <div className="text-sm text-muted-foreground">+ ₹{plan.admission_fee} admission fee</div>
                        )}
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                            <Check className="h-4 w-4 text-green-600" />
                            <span>{plan.shift} Shift - {plan.shift_time}</span>
                        </div>
                        {plan.features && plan.features.map(feature => (
                            <div key={feature.id} className="flex items-center gap-2 text-sm">
                                <Check className="h-4 w-4 text-green-600" />
                                <span>{feature.name}</span>
                            </div>
                        ))}
                    </div>

                    {plan.description && (
                        <p className="text-sm text-muted-foreground">{plan.description}</p>
                    )}
                </CardContent>
                <CardFooter>
                    <Button 
                        className="w-full" 
                        disabled={isActive || !phonepeEnabled}
                        asChild={!isActive && phonepeEnabled}
                    >
                        {isActive ? (
                            'Current Plan'
                        ) : phonepeEnabled ? (
                            <Link href={`/member/plans/${plan.id}/checkout`}>Buy Now</Link>
                        ) : (
                            'Payment Disabled'
                        )}
                    </Button>
                </CardFooter>
            </Card>
        );
    };

    return (
        <AppSidebarLayout>
            <Head title="Buy Plans" />

            <div className="container mx-auto p-6 space-y-6">
                <div>
                    <h1 className="text-3xl font-bold">Membership Plans</h1>
                    <p className="text-muted-foreground">Choose the perfect plan for your fitness journey</p>
                </div>

                {activeSubscription && (
                    <Card className="border-primary bg-primary/5">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Crown className="h-5 w-5" />
                                Your Active Plan
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-semibold">{activeSubscription.plan.name}</p>
                                    <p className="text-sm text-muted-foreground">
                                        Valid until {formatDate(activeSubscription.end_date)}
                                    </p>
                                </div>
                                <Badge variant="outline">Active</Badge>
                            </div>
                        </CardContent>
                    </Card>
                )}

                <Tabs defaultValue="monthly" className="w-full">
                    <TabsList className="grid w-full max-w-md grid-cols-2">
                        <TabsTrigger value="monthly">Monthly Plans</TabsTrigger>
                        <TabsTrigger value="yearly">Yearly Plans</TabsTrigger>
                    </TabsList>

                    <TabsContent value="monthly" className="mt-6">
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {monthlyPlans.map(plan => (
                                <PlanCard key={plan.id} plan={plan} />
                            ))}
                        </div>
                        {monthlyPlans.length === 0 && (
                            <div className="text-center py-12">
                                <p className="text-muted-foreground mb-4">No monthly plans available</p>
                                <Link href="/member/dashboard">
                                    <Button variant="outline">Back to Dashboard</Button>
                                </Link>
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="yearly" className="mt-6">
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {yearlyPlans.map(plan => (
                                <PlanCard key={plan.id} plan={plan} />
                            ))}
                        </div>
                        {yearlyPlans.length === 0 && (
                            <div className="text-center py-12">
                                <p className="text-muted-foreground mb-4">No yearly plans available</p>
                                <Link href="/member/dashboard">
                                    <Button variant="outline">Back to Dashboard</Button>
                                </Link>
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            </div>
        </AppSidebarLayout>
    );
}
