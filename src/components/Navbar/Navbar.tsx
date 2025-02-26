'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavItemProps {
    href: string;
    label: string;
}

const NavItem = ({ href, label }: NavItemProps) => {
    const pathname = usePathname();
    const isActive = pathname === href;

    return (
        <Link
            href={href}
            className={`text-gray-600 hover:text-gray-900 ${isActive ? 'font-medium' : ''}`}
        >
            {label}
        </Link>
    );
};

const Navbar = () => {
    const navItems: NavItemProps[] = [
        { href: '/', label: 'HOME' },
        { href: '/menus', label: 'MENUS' },
        { href: '/booking', label: 'RESERVE' },
        { href: '/about', label: 'ABOUT US' },
    ];

    return (
        <nav className="flex items-center justify-between px-6 py-4 bg-white shadow-sm">
            {/* Logo Section */}
            <Link href="/" className="flex items-center">
                <div className="mr-2">
                    <div className="w-6 h-6 border-2 border-black rounded-full" />
                </div>
                <span className="text-xl font-semibold">OmniDine</span>
            </Link>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center space-x-8">
                {navItems.map((item) => (
                    <NavItem key={item.href} {...item} />
                ))}
            </div>

            {/* Auth Buttons */}
            <div className="flex items-center space-x-4">
                <Link
                    href="/login"
                    className="text-gray-600 hover:text-gray-900"
                >
                    LOGIN
                </Link>
                <Link
                    href="/signup"
                    className="px-4 py-2 rounded-full border-2 border-black hover:bg-black hover:text-white transition-colors"
                >
                    SIGNUP
                </Link>
            </div>
        </nav>
    );
};

export default Navbar;