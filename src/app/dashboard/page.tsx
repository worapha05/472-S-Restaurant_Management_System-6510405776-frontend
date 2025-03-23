'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { User } from '@/interfaces/User';

interface Order {
  id: string;
  date: string;
  total: number;
  status: string;
}

interface Reservation {
  id: string;
  date: string;
  time: string;
  guests: number;
  status: string;
}

type MenuSection = 'profile' | 'orders' | 'reservations';

export default function ProfilePage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [activeSection, setActiveSection] = useState<MenuSection>('profile');
  
  const [userData, setUserData] = useState<User | null>(null);
  const [orderData, setOrderData] = useState<Order[]>([]);
  const [reservationData, setReservationData] = useState<Reservation[]>([]);
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
          
          // Here you would also fetch orders and reservations
          // Example:
          // const ordersResponse = await fetch(`${process.env.NEXT_PUBLIC_CLIENT_API_URL}/api/users/${session.user.id}/orders`);
          // if (ordersResponse.ok) {
          //   const ordersData = await ordersResponse.json();
          //   setOrderData(ordersData);
          // }
          
          // For now, we'll use mock data for orders and reservations
          setOrderData([
            { id: "ORD-001", date: "2025-03-20", total: 1250, status: "completed" },
            { id: "ORD-002", date: "2025-03-15", total: 850, status: "delivered" },
            { id: "ORD-003", date: "2025-03-10", total: 1500, status: "processing" },
            { id: "ORD-004", date: "2025-03-05", total: 950, status: "cancelled" },
          ]);
          
          setReservationData([
            { id: "RES-001", date: "2025-03-25", time: "18:00", guests: 4, status: "confirmed" },
            { id: "RES-002", date: "2025-03-18", time: "19:30", guests: 2, status: "completed" },
            { id: "RES-003", date: "2025-04-05", time: "12:00", guests: 6, status: "pending" },
          ]);
          
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

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    router.push('/login');
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
      case 'confirmed':
      case 'delivered':
        return 'bg-acceptGreen text-background';
      case 'processing':
      case 'pending':
        return 'bg-searchBox text-primary';
      case 'cancelled':
        return 'bg-cancelRed text-background';
      default:
        return 'bg-searchBox text-primary';
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-inputFieldFocus mx-auto"></div>
          <p className="mt-4 text-primary">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
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

  const renderSection = () => {
    switch (activeSection) {
      case 'profile':
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
              <button 
                onClick={() => router.push('/change-password')} 
                className="py-2 px-4 border border-searchBox text-primary hover:bg-searchBox rounded-md transition-colors"
              >
                เปลี่ยนรหัสผ่าน
              </button>
            </div>
          </div>
        );
        
      case 'orders':
        return (
          <div className="bg-background shadow-sm rounded-lg p-6 border border-searchBox">
            <h2 className="text-2xl font-semibold text-mainText mb-6">ประวัติการสั่งซื้อ</h2>
            
            {orderData.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-searchBox">
                  <thead>
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-secondText tracking-wider">
                        เลขที่ออเดอร์
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-secondText tracking-wider">
                        วันที่
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-secondText tracking-wider">
                        ยอดรวม
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-secondText tracking-wider">
                        สถานะ
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-secondText tracking-wider">
                        การจัดการ
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-background divide-y divide-searchBox">
                    {orderData.map((order) => (
                      <tr key={order.id}>
                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-mainText">
                          {order.id}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-primary">
                          {new Date(order.date).toLocaleDateString('th-TH')}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-primary">
                          {order.total.toLocaleString()} ฿
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.status)}`}>
                            {order.status === 'completed' ? 'เสร็จสิ้น' : 
                             order.status === 'delivered' ? 'จัดส่งแล้ว' : 
                             order.status === 'processing' ? 'กำลังดำเนินการ' : 
                             order.status === 'cancelled' ? 'ยกเลิก' : order.status}
                          </span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-primary">
                          <Link href={`/orders/${order.id}`} className="text-inputFieldFocus hover:text-primary">
                            ดูรายละเอียด
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-10">
                <p className="text-secondText">ไม่มีประวัติการสั่งซื้อ</p>
              </div>
            )}
          </div>
        );
        
      case 'reservations':
        return (
          <div className="bg-background shadow-sm rounded-lg p-6 border border-searchBox">
            <h2 className="text-2xl font-semibold text-mainText mb-6">ประวัติการจอง</h2>
            
            {reservationData.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-searchBox">
                  <thead>
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-secondText tracking-wider">
                        เลขที่การจอง
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-secondText tracking-wider">
                        วันที่
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-secondText tracking-wider">
                        เวลา
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-secondText tracking-wider">
                        จำนวนคน
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-secondText tracking-wider">
                        สถานะ
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-secondText tracking-wider">
                        การจัดการ
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-background divide-y divide-searchBox">
                    {reservationData.map((reservation) => (
                      <tr key={reservation.id}>
                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-mainText">
                          {reservation.id}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-primary">
                          {new Date(reservation.date).toLocaleDateString('th-TH')}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-primary">
                          {reservation.time}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-primary">
                          {reservation.guests} ท่าน
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(reservation.status)}`}>
                            {reservation.status === 'confirmed' ? 'ยืนยันแล้ว' : 
                             reservation.status === 'completed' ? 'เสร็จสิ้น' : 
                             reservation.status === 'pending' ? 'รอยืนยัน' : reservation.status}
                          </span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-primary">
                          <Link href={`/reservations/${reservation.id}`} className="text-inputFieldFocus hover:text-primary">
                            ดูรายละเอียด
                          </Link>
                          {reservation.status === 'pending' && (
                            <button className="ml-3 text-cancelRed hover:text-hoverCancel">
                              ยกเลิก
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-10">
                <p className="text-secondText">ไม่มีประวัติการจอง</p>
              </div>
            )}
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-background border-b border-searchBox">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex">
              <Link href="/" className="text-2xl font-bold text-mainText">
                MyApp
              </Link>
            </div>
            <div>
              <button
                onClick={handleSignOut}
                className="ml-4 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-background bg-cancelRed hover:bg-hoverCancel"
              >
                ออกจากระบบ
              </button>
            </div>
          </div>
        </div>
      </header>

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