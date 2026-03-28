import { Link } from '@inertiajs/react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { memberNavItems } from '@/config/member-nav';

interface Props {
    currentRoute: string;
    user: any;
}

export default function MemberBottomNav({ currentRoute, user }: Props) {
    const getInitials = (name: string) => {
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t md:hidden">
            <nav className="flex items-center justify-around h-16">
                {memberNavItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = currentRoute === item.href;
                    
                    return (
                        <Link
                            key={item.title}
                            href={item.href}
                            className={cn(
                                "flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors min-h-[44px]",
                                isActive 
                                    ? "text-primary" 
                                    : "text-muted-foreground hover:text-foreground"
                            )}
                            aria-label={item.title}
                        >
                            {Icon && <Icon className={cn("h-5 w-5", isActive && "fill-current")} />}
                            <span className="text-xs font-medium">{item.title === 'My Profile' ? 'Profile' : item.title}</span>
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
}
