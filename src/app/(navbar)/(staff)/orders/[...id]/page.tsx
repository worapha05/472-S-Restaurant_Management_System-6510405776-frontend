'use client';

import Link from 'next/link';
import { notFound, useRouter } from 'next/navigation';
import { useEffect, useState, use } from 'react';
import { useSession } from 'next-auth/react';
import OrderActions from '@/components/Order/OrderActions';
import OrderStatusHistory from '@/components/Order/OrderStatusHistory';
import Loading from '@/components/Loading';
import { User } from '@/interfaces/User';

// Format date for display
function formatDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleString('th-TH', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// Format payment method for display
function formatPaymentMethod(method: string) {
  switch (method) {
    case 'CREDIT_CARD': return 'บัตรเครดิต';
    case 'CASH': return 'เงินสด';
    case 'BANK_TRANSFER': return 'โอนเงิน';
    case 'QR_CODE': return 'QR Code';
    default: return method;
  }
}

// Get status color class
function getStatusColor(status: string): string {
  switch (status.toUpperCase()) {
    case 'PENDING': return 'bg-orange-100 text-orange-700';
    case 'IN_PROGRESS': return 'bg-orange-100 text-orange-700';
    case 'COMPLETED': return 'bg-green-100 text-green-700';
    case 'CANCELLED': return 'bg-red-100 text-red-700';
    default: return 'bg-gray-100 text-gray-700';
  }
}

// Order detail content component
function OrderDetail({ order, userData }: { order: Order, userData: User | null }) {
  const { data: session } = useSession();
  const userRole = session?.user?.role;
  
  // Get appropriate back link based on role
  const getBackLink = (): string => {
    if (userRole === 'ADMIN' || userRole === 'STAFF') {
      return '/orders';
    } else {
      return '/profile?section=orders';
    }
  };
  
  // Use order_lists from API data
  const orderItems = order.order_lists || [];

  // Calculate subtotal
  const subtotal = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  // Determine which user data to display (from separate user API or from order)
  const displayUser = userData;

  return (
    <div className="w-full max-w-5xl">
      {/* Header with back button and actions */}
      <div className="flex justify-between items-center mb-6">
        <Link
          href={getBackLink()}
          className="flex flex-row items-center gap-3 text-primary-600 hover:text-primary-700"
        >
          <svg width="1.5rem" height="1.5rem" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M8 17L3 12M3 12L8 7M3 12H21" stroke="#000000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          กลับไปยังรายการคำสั่งซื้อ
        </Link>
      </div>

      {/* Order Status Card */}
      <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden mb-6">
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-2xl font-bold mb-2">ออเดอร์ #{order.id}</h1>
              <p className="text-neutral-500">
                <time dateTime={order.created_at}>{formatDate(order.created_at)}</time>
              </p>
            </div>
            <div className={`px-4 py-1.5 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
              {order.status}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 border-t border-neutral-200 pt-6">

            <div>
              <h3 className="text-sm font-medium text-neutral-500 mb-1">ประเภท</h3>
              <p className="font-medium">{order.type}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-neutral-500 mb-1">โต๊ะ</h3>
              <p className="font-medium">{order.table_id ? `โต๊ะที่ ${order.table_id}` : 'ไม่มีโต๊ะ'}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-neutral-500 mb-1">วิธีการชำระเงิน</h3>
              <p className="font-medium">{formatPaymentMethod(order.payment_method)}</p>
            </div>

            {order.type === 'DELIVERY' && order.address && (
              <div className="col-span-1 md:col-span-3">
                <h3 className="text-sm font-medium text-neutral-500 mb-1">ที่อยู่จัดส่ง</h3>
                <p className="whitespace-pre-line">{order.address}</p>
              </div>
            )}

            {displayUser && (
              <div className="col-span-1 md:col-span-3">
                <h3 className="text-sm font-medium text-neutral-500 mb-1">ข้อมูลลูกค้า</h3>
                <p>{displayUser.name}</p>
                <p>TEL. {displayUser.phone_number}</p>
                {userData?.email && <p>Email: {userData.email}</p>}
                {userData?.address && order.type !== 'DELIVERY' && (
                  <p className="whitespace-pre-line">ที่อยู่: {userData.address}</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Order Items */}
      <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden mb-6">
        <div className="p-6">
          <h2 className="text-xl font-bold mb-4">รายการอาหาร</h2>

          <div className="border-b border-neutral-200 pb-4 mb-4">
            {orderItems.map((item, index) => (
              <div key={index} className="flex justify-between py-3 border-b border-neutral-100 last:border-0">
                <div>
                  <div className="flex items-start">
                    <span className="font-medium text-lg">{item.quantity} x</span>
                    <div className="ml-2">
                      <h4 className="font-medium">{item.food.name}</h4>
                      {item.description && (
                        <p className="text-sm text-neutral-500 italic">หมายเหตุ: {item.description}</p>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">
                    {new Intl.NumberFormat('th-TH', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    }).format(item.price * item.quantity)} ฿
                  </p>
                  <p className="text-sm text-neutral-500">
                    {item.quantity > 1 ? `${item.price} ฿/ชิ้น` : ''}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-neutral-500">รวม</span>
              <span>
                {new Intl.NumberFormat('th-TH', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                }).format(subtotal)} ฿
              </span>
            </div>
            <div className="flex justify-between pt-2 border-t border-neutral-200">
              <span className="font-bold">รวมทั้งสิ้น</span>
              <span className="font-bold text-xl text-primary-600">
                {new Intl.NumberFormat('th-TH', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                }).format(subtotal)} ฿
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Order History */}
      <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden mb-6">
        <div className="p-6">
          <h2 className="text-xl font-bold mb-4">ประวัติสถานะ</h2>
          <OrderStatusHistory order={order} />
        </div>
      </div>

      {/* Only show OrderActions for staff and admin */}
      <OrderActions orderId={order.id} status={order.status} />
    </div>
  );
}

// Error component
function OrderError({ message, retry }: { message: string, retry: () => void }) {
  return (
    <div className="w-full max-w-5xl">
      <div className="bg-white rounded-xl p-6 text-center">
        <div className="text-red-500 text-5xl mb-4">⚠️</div>
        <h2 className="text-xl font-bold mb-2">เกิดข้อผิดพลาด</h2>
        <p className="text-neutral-600 mb-4">{message}</p>
        <button 
          onClick={retry}
          className="inline-block bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg"
        >
          ลองใหม่
        </button>
      </div>
    </div>
  );
}

// Main order detail page component
export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  // Unwrap params using React.use()
  const unwrappedParams = use(params);
  const orderId = unwrappedParams.id;
  
  const { data: session, status } = useSession();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [userData, setUserData] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Redirect to login if not authenticated
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    // Fetch order when session is authenticated
    if (status === 'authenticated' && session?.user?.accessToken) {
      fetchOrder();
    }
  }, [status, session, orderId]);

  // Fetch user data when we have the order
  useEffect(() => {
    if (order && order.user_id && session?.user?.accessToken) {
      fetchUserData(order.user_id);
    }
  }, [order, session]);

  async function fetchOrder() {
    try {
      setLoading(true);
      setError(null);
      
      const res = await fetch(`${process.env.NEXT_PUBLIC_CLIENT_API_URL}/api/orders/${orderId}`, {
        headers: {
          'Authorization': `Bearer ${session?.user?.accessToken}`,
        }
      });
      
      if (!res.ok) {
        if (res.status === 404) {
          router.push('/404');
          return;
        }
        throw new Error('ไม่สามารถโหลดข้อมูลออเดอร์ได้');
      }
      
      const resJson = await res.json();
      console.log("Fetched Order:", resJson);
      
      if (!resJson.data) {
        throw new Error('ไม่พบข้อมูลออเดอร์');
      }
      
      setOrder(resJson.data);
    } catch (err: any) {
      console.error("Error fetching order:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function fetchUserData(userId: number) {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_CLIENT_API_URL}/api/users/${userId}`, {
        headers: {
          'Authorization': `Bearer ${session?.user?.accessToken}`,
        }
      });
      
      if (!res.ok) {
        console.warn(`Could not fetch user data for user ID ${userId}. Using order user data instead.`);
        return; // We'll fall back to the user data included in the order
      }
      
      const resJson = await res.json();
      console.log("Fetched User Data:", resJson);
      
      if (resJson.data) {
        setUserData(resJson.data);
      }
    } catch (err) {
      console.warn("Error fetching user data:", err);
      // No need to show an error message, we'll fall back to the user data included in the order
    }
  }

  // Show loading state
  if (loading || status === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center w-full px-4 py-6 bg-neutral-50 min-h-screen">
        <p className="font-bold text-3xl w-full max-w-5xl py-6">รายละเอียดคำสั่งซื้อ</p>
        <Loading message="กำลังโหลดข้อมูลออเดอร์..." />
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center w-full px-4 py-6 bg-neutral-50 min-h-screen">
        <p className="font-bold text-3xl w-full max-w-5xl py-6">รายละเอียดคำสั่งซื้อ</p>
        <OrderError message={error} retry={fetchOrder} />
      </div>
    );
  }

  // Show 404 if order not found
  if (!order) {
    return notFound();
  }

  // Show order when data is loaded
  return (
    <div className="flex flex-col items-center justify-center w-full px-4 py-6 min-h-screen">
      <p className="font-bold text-3xl w-full max-w-5xl py-6">รายละเอียดคำสั่งซื้อ</p>
      <OrderDetail order={order} userData={userData} />
    </div>
  );
}