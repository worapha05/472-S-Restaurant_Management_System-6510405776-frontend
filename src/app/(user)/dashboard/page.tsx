'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import OrderTable from '@/components/User/OrderTable';
import ReservationTable from '@/components/User/ReservationTable';
import Loading from '@/components/Loading';

// Types for our data
interface UserData {
  address: string;
  email: string;
  id: string;
  name: string;
  phone_number: string;
  role: string;
  username: string;
}

type MenuSection = 'profile' | 'orders' | 'reservations';

export default function ProfilePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  
  // Check for section parameter in URL to set initial active section
  const sectionParam = searchParams.get('section') as MenuSection | null;
  const [activeSection, setActiveSection] = useState<MenuSection>(
    sectionParam && ['profile', 'orders', 'reservations'].includes(sectionParam) 
      ? sectionParam 
      : 'profile'
  );
  
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Check if user is authenticated
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    // Fetch user data
    const fetchUserData = async () => {
      if (status === 'authenticated' && session?.user?.id) {
        try {
          setIsLoading(true);
          const response = await fetch(`${process.env.NEXT_PUBLIC_CLIENT_API_URL}/api/users/${session.user.id}`);

          if (!response.ok) {
            throw new Error('Failed to fetch user data');
          }
          
          const data = await response.json();
          setUserData(data.data);

          console.log(session);
          
        } catch (err) {
          setError('Failed to load user data. Please try again later.');
          console.error('Error fetching user data:', err);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchUserData();
  }, [session, status, router]);

  // Update URL when section changes
  useEffect(() => {
    if (activeSection !== 'profile') {
      router.push(`/dashboard?section=${activeSection}`, { scroll: false });
    } else {
      router.push('/dashboard', { scroll: false });
    }
  }, [activeSection, router]);

  // Handle section change from URL
  useEffect(() => {
    if (sectionParam && ['profile', 'orders', 'reservations'].includes(sectionParam)) {
      setActiveSection(sectionParam);
    }
  }, [sectionParam]);

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

  // Show loading state
  if (isLoading) {
    return (
      <Loading message='กําลังโหลดข้อมูล...' />
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md p-6 bg-background rounded-lg shadow-md border border-searchBox">
          <p className="text-cancelRed mb-4">{error}</p>
          <button 
            onClick={() => router.push('/dashboard')}
            className="py-2 px-4 bg-button hover:bg-hoverButton text-background rounded-md transition-colors"
          >
            กลับไปหน้าหลัก
          </button>
        </div>
      </div>
    );
  }

  // Show not authenticated state
  if (!userData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md p-6 bg-background rounded-lg shadow-md border border-searchBox">
          <p className="text-primary mb-4">กรุณาเข้าสู่ระบบเพื่อดูข้อมูลโปรไฟล์</p>
          <button 
            onClick={() => router.push('/login')}
            className="py-2 px-4 bg-button hover:bg-hoverButton text-background rounded-md transition-colors"
          >
            เข้าสู่ระบบ
          </button>
        </div>
      </div>
    );
  }

  const renderProfileSection = () => {
    return (
      <div className="bg-background shadow-sm rounded-lg p-6 border border-searchBox">
        <h2 className="text-2xl font-semibold text-mainText mb-6">ข้อมูลส่วนตัว</h2>
        
        <div className="grid grid-cols-1 gap-6 mb-6">
          <div className="flex justify-center">
            <div className="h-32 w-32 rounded-full bg-searchBox flex items-center justify-center text-3xl text-secondText font-semibold">
              {userData.name.charAt(0)}
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-secondText mb-1">ชื่อ-นามสกุล</p>
            <p className="text-mainText font-medium">{userData.name}</p>
          </div>
          
          <div>
            <p className="text-secondText mb-1">อีเมล</p>
            <p className="text-mainText font-medium">{userData.email}</p>
          </div>
          
          <div>
            <p className="text-secondText mb-1">ชื่อผู้ใช้</p>
            <p className="text-mainText font-medium">{userData.username}</p>
          </div>
          
          <div>
            <p className="text-secondText mb-1">เบอร์โทรศัพท์</p>
            <p className="text-mainText font-medium">{userData.phone_number}</p>
          </div>
          
          <div className="md:col-span-2">
            <p className="text-secondText mb-1">ที่อยู่</p>
            <p className="text-mainText font-medium">{userData.address}</p>
          </div>
          
          <div>
            <p className="text-secondText mb-1">ประเภทผู้ใช้</p>
            <p className="text-mainText font-medium capitalize">{userData.role}</p>
          </div>
          
          <div>
            <p className="text-secondText mb-1">รหัสผู้ใช้</p>
            <p className="text-mainText font-medium">{userData.id}</p>
          </div>
        </div>
        
        <div className="mt-8 flex flex-col sm:flex-row gap-4">
          <button 
            onClick={() => router.push('/edit-profile')} 
            className="py-2 px-4 bg-button hover:bg-hoverButton text-background rounded-md transition-colors"
          >
            แก้ไขข้อมูล
          </button>
        </div>
      </div>
    );
  };

  const renderSection = () => {
    switch (activeSection) {
      case 'profile':
        return renderProfileSection();
      case 'orders':
        return <OrderTable userId={userData.id} />;
      case 'reservations':
        return <ReservationTable userId={userData.id} />;
      default:
        return renderProfileSection();
    }
  };

  return (
    <div className="min-h-screen bg-background">

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 sm:px-0">
          <h1 className="text-3xl font-bold text-mainText">โปรไฟล์</h1>
          <p className="mt-2 text-secondText">
            จัดการข้อมูลส่วนตัวและการใช้งานของคุณ
          </p>
        </div>
        
        <div className="mt-8 md:grid md:grid-cols-12 md:gap-6">
          {/* Sidebar */}
          <aside className="md:col-span-3">
            <nav className="space-y-1 bg-background shadow-sm rounded-lg border border-searchBox overflow-hidden">
              <button
                onClick={() => setActiveSection('profile')}
                className={`w-full flex items-center px-4 py-3 text-left text-sm font-medium ${
                  activeSection === 'profile' 
                    ? 'bg-searchBox text-boldTextHighlights' 
                    : 'text-primary hover:bg-searchBox hover:text-mainText'
                }`}
              >
                ข้อมูลส่วนตัว
              </button>
              <button
                onClick={() => setActiveSection('orders')}
                className={`w-full flex items-center px-4 py-3 text-left text-sm font-medium ${
                  activeSection === 'orders' 
                    ? 'bg-searchBox text-boldTextHighlights' 
                    : 'text-primary hover:bg-searchBox hover:text-mainText'
                }`}
              >
                ประวัติการสั่งซื้อ
              </button>
              <button
                onClick={() => setActiveSection('reservations')}
                className={`w-full flex items-center px-4 py-3 text-left text-sm font-medium ${
                  activeSection === 'reservations' 
                    ? 'bg-searchBox text-boldTextHighlights' 
                    : 'text-primary hover:bg-searchBox hover:text-mainText'
                }`}
              >
                ประวัติการจอง
              </button>
            </nav>
          </aside>
          
          {/* Main content */}
          <div className="mt-6 md:mt-0 md:col-span-9">
            {renderSection()}
          </div>
        </div>
      </main>
    </div>
  );
}