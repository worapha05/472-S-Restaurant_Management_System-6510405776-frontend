'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { useState, useEffect } from 'react';

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
    const router = useRouter();
    const { data: session, status } = useSession();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [userRole, setUserRole] = useState<string | null>(null);
    
    // Determine user role from session
    useEffect(() => {
        if (session?.user?.role) {
            setUserRole(session.user.role);
        }
    }, [session]);

    // Define navigation items based on user role
    const customerNavItems: NavItemProps[] = [
        { href: '/menu', label: 'เมนู' },
        { href: '/booking', label: 'จองโต๊ะ' },
        { href: '/about', label: 'เกี่ยวกับเรา' },
    ];

    const staffNavItems: NavItemProps[] = [
        { href: '/orders', label: 'จัดการออเดอร์' },
        { href: '/reservations', label: 'จัดการการจอง' },
        { href: '/stock', label: 'สต็อก' },
        { href: '/inventory-logs', label: 'ประวัติเข้า-ออกสต๊อก' },
    ];

    const ownerNavItems: NavItemProps[] = [
        { href: '/dashboard', label: 'แดชบอร์ด' },
        { href: '/orders', label: 'ออเดอร์' },
        { href: '/reservations', label: 'การจอง' },
        { href: '/foods', label: 'จัดการเมนูอาหาร' },
        { href: '/stock', label: 'จัดการวัตถุดิบ' },
        { href: '/inventory-logs', label: 'จัดการประวัติการนำเข้า/ออกวัตถุดิบ' },
    ];

    // Select the appropriate nav items based on role
    const getNavItems = () => {
        if (userRole === 'STAFF') {
            return staffNavItems;
        } else if (userRole === 'ADMIN') {
            return ownerNavItems;
        } else {
            return customerNavItems;
        }
    };

    const navItems = getNavItems();

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
        
        await signOut({ redirect: false });
        router.push('/login');
    };

    // Determine home page link based on role
    const getHomePage = () => {
        if (userRole === 'STAFF') {
            return '/orders';
        } else if (userRole === 'ADMIN') {
            return '/dashboard';
        } else {
            return '/menu';
        }
    };

    return (
        <nav className="flex items-center justify-between px-6 py-4 bg-white shadow-sm">
            {/* Logo Section */}
            <Link href={getHomePage()} className="flex items-center">
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
                            <div className="hidden md:flex items-center">
                                <span className="text-gray-700 mr-1">
                                    {session.user?.name || 'ผู้ใช้'}
                                </span>
                                {userRole && (
                                    <span className={`text-xs px-2 py-0.5 rounded-full ml-1 ${
                                        userRole === 'STAFF' ? 'bg-blue-100 text-blue-800' : 
                                        userRole === 'ADMIN' ? 'bg-purple-100 text-purple-800' : 
                                        'bg-green-100 text-green-800'
                                    }`}>
                                        {userRole === 'STAFF' ? 'พนักงาน' : 
                                         userRole === 'ADMIN' ? 'เจ้าของร้าน' : 'ลูกค้า'}
                                    </span>
                                )}
                            </div>
                            <svg 
                                className="w-4 h-4 text-gray-600" 
                                fill="none" 
                                stroke="currentColor" 
                                viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>
                        
                        {/* Dropdown menu - different options based on role */}
                        {isDropdownOpen && (
                            <div className="absolute right-0 mt-2 w-48 py-2 bg-white rounded-md shadow-xl z-10 border border-gray-200">
                                {/* Show profile for all users */}
                                <Link 
                                    href={userRole === 'STAFF' || userRole === 'ADMIN' ? '/profile' : '/profile'} 
                                    className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                                    onClick={() => setIsDropdownOpen(false)}
                                >
                                    โปรไฟล์
                                </Link>
                                
                                {/* Conditional links based on role */}
                                {userRole === 'USER' && (
                                    <>
                                        <Link 
                                            href="/profile?section=orders" 
                                            className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                                            onClick={() => setIsDropdownOpen(false)}
                                        >
                                            คำสั่งซื้อของฉัน
                                        </Link>
                                        <Link 
                                            href="/profile?section=reservations" 
                                            className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                                            onClick={() => setIsDropdownOpen(false)}
                                        >
                                            การจองของฉัน
                                        </Link>
                                    </>
                                )}
                                
                                {userRole === 'STAFF' && (
                                    <>
                                        <Link 
                                            href="/orders" 
                                            className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                                            onClick={() => setIsDropdownOpen(false)}
                                        >
                                            จัดการออเดอร์
                                        </Link>
                                        <Link 
                                            href="/reservations" 
                                            className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                                            onClick={() => setIsDropdownOpen(false)}
                                        >
                                            จัดการการจอง
                                        </Link>
                                        <Link 
                                            href="/stock" 
                                            className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                                            onClick={() => setIsDropdownOpen(false)}
                                        >
                                            สต๊อก
                                        </Link>
                                        <Link 
                                            href="/inventory-logs" 
                                            className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                                            onClick={() => setIsDropdownOpen(false)}
                                        >
                                            ประวัติเข้า-ออกสต๊อก
                                        </Link>
                                    </>
                                )}
                                
                                {userRole === 'ADMIN' && (
                                    <>
                                        <Link 
                                            href="/dashboard" 
                                            className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                                            onClick={() => setIsDropdownOpen(false)}
                                        >
                                            แดชบอร์ด
                                        </Link>
                                        <Link 
                                            href="/orders" 
                                            className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                                            onClick={() => setIsDropdownOpen(false)}
                                        >
                                            ออเดอร์
                                        </Link>
                                        <Link 
                                            href="/reservations" 
                                            className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                                            onClick={() => setIsDropdownOpen(false)}
                                        >
                                            การจอง
                                        </Link>
                                        <Link 
                                            href="/stock" 
                                            className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                                            onClick={() => setIsDropdownOpen(false)}
                                        >
                                            สต๊อก
                                        </Link>
                                        <Link 
                                            href="/inventory-logs" 
                                            className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                                            onClick={() => setIsDropdownOpen(false)}
                                        >
                                            ประวัติเข้า-ออกสต๊อก
                                        </Link>
                                    </>
                                )}
                                
                                {/* Sign out for all users */}
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