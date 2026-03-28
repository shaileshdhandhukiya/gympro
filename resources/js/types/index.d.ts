import { InertiaLinkProps } from '@inertiajs/react';
import { LucideIcon } from 'lucide-react';

export interface Auth {
    user: User;
    permissions: string[];
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    href: NonNullable<InertiaLinkProps['href']>;
    icon?: LucideIcon | null;
    isActive?: boolean;
    permission?: string;
}

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    sidebarOpen: boolean;
    [key: string]: unknown;
}

export interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    profile_image?: string | null;
    status?: 'active' | 'inactive';
    email_verified_at: string | null;
    two_factor_enabled?: boolean;
    roles?: Role[];
    created_at: string;
    updated_at: string;
    [key: string]: unknown; // This allows for additional properties...
}

export interface Permission {
    id: number;
    name: string;
    description: string | null;
}

export interface Role {
    id: number;
    name: string;
    description: string | null;
    permissions: Permission[];
}

export interface Member {
    id: number;
    user_id: number;
    gender: 'male' | 'female' | 'other';
    date_of_birth: string;
    address: string | null;
    photo: string | null;
    join_date: string;
    status: 'active' | 'inactive' | 'expired';
    notes: string | null;
    user?: User;
    subscriptions?: Subscription[];
    created_at: string;
    updated_at: string;
}

export interface Plan {
    id: number;
    name: string;
    duration_months: number;
    price: string;
    admission_fee: string;
    shift: 'morning' | 'evening' | 'full_day';
    shift_time: string | null;
    description: string | null;
    status: 'active' | 'inactive';
    features?: Array<{ id: number; name: string; slug: string }>;
    created_at: string;
    updated_at: string;
}

export interface Subscription {
    id: number;
    member_id: number;
    plan_id: number;
    start_date: string;
    end_date: string;
    amount_paid: string;
    admission_fee_paid: string;
    payment_status: 'pending' | 'paid' | 'overdue';
    status: 'active' | 'expired' | 'cancelled';
    notes: string | null;
    member?: Member;
    plan?: Plan;
    created_at: string;
    updated_at: string;
}

export interface Attendance {
    id: number;
    member_id: number;
    date: string;
    check_in_time: string;
    check_out_time: string | null;
    notes: string | null;
    member?: Member;
    created_at: string;
    updated_at: string;
}

export interface Trainer {
    id: number;
    user_id: number;
    specialization: string;
    experience_years: number;
    salary: string;
    joining_date: string;
    bio: string | null;
    status: 'active' | 'inactive';
    user?: User;
    created_at: string;
    updated_at: string;
}

export interface Payment {
    id: number;
    member_id: number;
    subscription_id: number | null;
    invoice_number: string;
    amount: string;
    payment_method: 'cash' | 'card' | 'upi' | 'bank_transfer';
    payment_type: 'subscription' | 'admission' | 'other';
    payment_date: string;
    status: 'completed' | 'pending' | 'failed' | 'refunded';
    notes: string | null;
    transaction_id: string | null;
    member?: Member;
    subscription?: Subscription;
    created_at: string;
    updated_at: string;
}

export interface Expense {
    id: number;
    title: string;
    description: string | null;
    amount: string;
    category: 'equipment' | 'maintenance' | 'utilities' | 'salaries' | 'rent' | 'marketing' | 'other';
    expense_date: string;
    payment_method: 'cash' | 'card' | 'upi' | 'bank_transfer';
    receipt: string | null;
    created_at: string;
    updated_at: string;
}

export interface Equipment {
    id: number;
    name: string;
    category: string;
    photo: string | null;
    quantity: number;
    purchase_price: string;
    purchase_date: string;
    condition: 'excellent' | 'good' | 'fair' | 'poor';
    status: 'active' | 'maintenance' | 'retired';
    notes: string | null;
    created_at: string;
    updated_at: string;
}

export interface Exercise {
    id: number;
    name: string;
    description: string | null;
    category: string;
    muscle_group: string;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    instructions: string | null;
    image_primary: string | null;
    image_secondary: string | null;
    video_url: string | null;
    equipment_required: string | null;
    duration_seconds: number | null;
    calories_burned: number | null;
    status: 'active' | 'inactive';
    created_by: number;
    creator?: User;
    created_at: string;
    updated_at: string;
}
