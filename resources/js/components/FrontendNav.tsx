import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';
import { Link, usePage } from '@inertiajs/react';
import { useState } from 'react';
import AppLogo from '../components/app-logo';

interface FrontendNavProps {
    showAuthButtons?: boolean;
}

export default function FrontendNav({ showAuthButtons = true }: FrontendNavProps) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const { auth } = usePage().props as any;
    const isAuthenticated = !!auth?.user;

    return (
        <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
            <div className="site-container py-3">
                <div className="flex items-center justify-between gap-4">
                    <Link href="/" className="flex min-w-0 flex-shrink items-center gap-2">
                        <AppLogo/>
                    </Link>

                    {/* Desktop Navigation - Centered */}
                    <div className="hidden flex-1 items-center justify-center md:flex">
                        <div className="flex flex-wrap items-center justify-center gap-1">
                            <Link href="/" className="px-4 py-2 text-sm font-medium rounded-md hover:bg-accent hover:text-accent-foreground transition-all duration-200">
                                Home
                            </Link>
                            <Link href="/about" className="px-4 py-2 text-sm font-medium rounded-md hover:bg-accent hover:text-accent-foreground transition-all duration-200">
                                About
                            </Link>
                            <Link href="/contact" className="px-4 py-2 text-sm font-medium rounded-md hover:bg-accent hover:text-accent-foreground transition-all duration-200">
                                Contact
                            </Link>
                        </div>
                    </div>

                    {/* Desktop Auth Buttons */}
                    {showAuthButtons && (
                        <div className="hidden flex-shrink-0 gap-2 md:flex">
                            {isAuthenticated ? (
                                <Link href="/dashboard">
                                    <Button size="sm">Dashboard</Button>
                                </Link>
                            ) : (
                                <>
                                    <Link href="/login">
                                        <Button variant="ghost" size="sm">Login</Button>
                                    </Link>
                                    <Link href="/register">
                                        <Button size="sm">Get Started</Button>
                                    </Link>
                                </>
                            )}
                        </div>
                    )}

                    {/* Mobile Menu Button */}
                    <button
                        className="flex-shrink-0 md:hidden"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        aria-expanded={mobileMenuOpen}
                        aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
                    >
                        {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                    </button>
                </div>

                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <div className="md:hidden mt-4 pb-4 space-y-2 border-t pt-4">
                        <Link href="/" className="block px-4 py-2 text-sm rounded-md hover:bg-accent hover:text-accent-foreground transition-all duration-200">
                            Home
                        </Link>
                        <Link href="/about" className="block px-4 py-2 text-sm rounded-md hover:bg-accent hover:text-accent-foreground transition-all duration-200">
                            About
                        </Link>
                        <Link href="/contact" className="block px-4 py-2 text-sm rounded-md hover:bg-accent hover:text-accent-foreground transition-all duration-200">
                            Contact
                        </Link>
                        {showAuthButtons && (
                            <div className="flex flex-col gap-2 pt-2 border-t">
                                {isAuthenticated ? (
                                    <Link href="/dashboard">
                                        <Button className="w-full">Dashboard</Button>
                                    </Link>
                                ) : (
                                    <>
                                        <Link href="/login">
                                            <Button variant="ghost" className="w-full">Login</Button>
                                        </Link>
                                        <Link href="/register">
                                            <Button className="w-full">Get Started</Button>
                                        </Link>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </header>
    );
}
