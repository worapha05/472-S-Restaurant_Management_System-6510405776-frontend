'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { useState } from 'react';

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
    const { data: session, status } = useSession();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    
    const navItems: NavItemProps[] = [
        { href: '/', label: 'หน้าหลัก' },
        { href: '/menus', label: 'เมนู' },
        { href: '/booking', label: 'จองโต๊ะ' },
        { href: '/about', label: 'เกี่ยวกับเรา' },
    ];

    const handleSignOut = async () => {
        if (session?.user?.accessToken) {
            try {
              const apiUrl = process.env.NEXT_PUBLIC_CLIENT_API_URL;
              await fetch(`${apiUrl}/api/revoke`, {
                method: 'DELETE',
                headers: {
                  'Authorization': `Bearer ${session.user.accessToken}`
                }
              });
            } catch (error) {
              console.error('Error revoking token:', error);
              // Continue with logout even if token revocation fails
            }
          }
        
        await signOut({ callbackUrl: '/' });
    };

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

            {/* Auth Buttons - Show different buttons based on authentication status */}
            <div className="flex items-center space-x-4">
                {status === 'loading' ? (
                    <div className="h-8 w-24 bg-gray-200 animate-pulse rounded-full"></div>
                ) : session ? (
                    <div className="relative">
                        <button 
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            className="flex items-center space-x-2 focus:outline-none"
                        >
                            <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center overflow-hidden border border-gray-300">
                                {session.user?.image ? (
                                    <img 
                                        src={session.user.image} 
                                        alt={session.user.name || 'รูปโปรไฟล์'} 
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <span className="text-sm font-medium">
                                        {session.user?.name?.charAt(0) || 'ผ'}
                                    </span>
                                )}
                            </div>
                            <span className="hidden md:block text-gray-700">
                                {session.user?.name || 'ผู้ใช้'}
                            </span>
                            <svg 
                                className="w-4 h-4 text-gray-600" 
                                fill="none" 
                                stroke="currentColor" 
                                viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>
                        
                        {/* Dropdown menu */}
                        {isDropdownOpen && (
                            <div className="absolute right-0 mt-2 w-48 py-2 bg-white rounded-md shadow-xl z-10 border border-gray-200">
                                <Link 
                                    href="/dashboard" 
                                    className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                                    onClick={() => setIsDropdownOpen(false)}
                                >
                                    โปรไฟล์
                                </Link>
                                <Link 
                                    href="/dashboard?section=orders" 
                                    className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                                    onClick={() => setIsDropdownOpen(false)}
                                >
                                    คำสั่งซื้อ
                                </Link>
                                <button 
                                    onClick={() => {
                                        setIsDropdownOpen(false);
                                        handleSignOut();
                                    }}
                                    className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                                >
                                    ออกจากระบบ
                                </button>
                            </div>
                        )}
                    </div>
                ) : (
                    <>
                        <Link
                            href="/login"
                            className="text-gray-600 hover:text-gray-900"
                        >
                            เข้าสู่ระบบ
                        </Link>
                        <Link
                            href="/signup"
                            className="px-4 py-2 rounded-full border-2 border-black hover:bg-black hover:text-white transition-colors"
                        >
                            สมัครสมาชิก
                        </Link>
                    </>
                )}
            </div>
        </nav>
    );
};

export default Navbar;