import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';
import { Link } from '@inertiajs/react';
import AppLogo from './app-logo';

export default function FrontendFooter() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="mt-auto border-t bg-muted/30">
            <div className="site-container py-12 md:py-16">
                <div className="mb-8 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="space-y-4">
                        <Link href="/" className="inline-flex items-center gap-2">
                            <AppLogo />
                        </Link>
                        <p className="text-sm leading-relaxed text-muted-foreground">
                            Your complete gym management solution for member tracking, subscriptions, and attendance.
                        </p>
                        <div className="flex gap-4">
                            <a href="#" className="text-muted-foreground transition-colors hover:text-primary">
                                <Facebook className="h-5 w-5" />
                            </a>
                            <a href="#" className="text-muted-foreground transition-colors hover:text-primary">
                                <Twitter className="h-5 w-5" />
                            </a>
                            <a href="#" className="text-muted-foreground transition-colors hover:text-primary">
                                <Instagram className="h-5 w-5" />
                            </a>
                            <a href="#" className="text-muted-foreground transition-colors hover:text-primary">
                                <Linkedin className="h-5 w-5" />
                            </a>
                        </div>
                    </div>

                    <div>
                        <h3 className="mb-4 font-semibold text-foreground">Legal</h3>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <Link href="/privacy-policy" className="text-muted-foreground transition-colors hover:text-primary">
                                    Privacy Policy
                                </Link>
                            </li>
                            <li>
                                <Link href="/terms-of-service" className="text-muted-foreground transition-colors hover:text-primary">
                                    Terms of Service
                                </Link>
                            </li>
                            <li>
                                <Link href="/refund-policy" className="text-muted-foreground transition-colors hover:text-primary">
                                    Refund Policy
                                </Link>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="mb-4 font-semibold text-foreground">Company</h3>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <Link href="/about" className="text-muted-foreground transition-colors hover:text-primary">
                                    About Us
                                </Link>
                            </li>
                            <li>
                                <Link href="/contact" className="text-muted-foreground transition-colors hover:text-primary">
                                    Contact
                                </Link>
                            </li>
                            <li>
                                <a href="#" className="text-muted-foreground transition-colors hover:text-primary">
                                    Blog
                                </a>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="mb-4 font-semibold text-foreground">Contact</h3>
                        <ul className="space-y-3 text-sm">
                            <li className="flex items-start gap-3">
                                <Mail className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
                                <span className="text-muted-foreground">info@gympro.com</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <Phone className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
                                <span className="text-muted-foreground">+1 234 567 890</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
                                <span className="text-muted-foreground">123 Fitness Street, Gym City</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="my-8 border-t" />

                <div className="flex flex-col items-center justify-between gap-4 text-center text-sm text-muted-foreground md:flex-row md:text-left">
                    <p>&copy; {currentYear} Gympro. All rights reserved.</p>
                    <p>Built with love for Indian gyms.</p>
                </div>
            </div>
        </footer>
    );
}
