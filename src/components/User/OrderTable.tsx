'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

interface OrderListProps {
  userId?: string;
}

export default function OrderList({ userId }: OrderListProps) {
  const { data: session } = useSession();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setIsLoading(true);
        const id = userId || session?.user?.id;
        
        if (!id) {
          setIsLoading(false);
          return;
        }

        const response = await fetch(`${process.env.NEXT_PUBLIC_CLIENT_API_URL}/api/users/${id}/orders`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch order data');
        }
        
        const data = await response.json();
        setOrders(data.data || []);

        console.log('Orders:', orders);
        console.log('Fetch URL:', `${process.env.NEXT_PUBLIC_CLIENT_API_URL}/api/users/${id}/orders`);
        

      } catch (err) {
        console.error('Error fetching orders:', err);
        setError('ไม่สามารถโหลดรายการคำสั่งซื้อได้');
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, [session, userId]);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
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

  const getStatusText = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed': return 'เสร็จสิ้น';
      case 'delivered': return 'จัดส่งแล้ว';
      case 'processing': return 'กำลังดำเนินการ';
      case 'pending': return 'รอดำเนินการ';
      case 'cancelled': return 'ยกเลิก';
      default: return status;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-inputFieldFocus"></div>
        <span className="ml-2 text-secondText">กำลังโหลด...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-cancelRed/10 border-l-4 border-cancelRed p-4 rounded">
        <p className="text-cancelRed">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-background shadow-sm rounded-lg p-6 border border-searchBox">
      <h2 className="text-2xl font-semibold text-mainText mb-6">ประวัติการสั่งซื้อ</h2>
      
      {orders.length > 0 ? (
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
              {orders.map((order) => (
                <tr key={order.id}>
                  <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-mainText">
                    {order.id}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-primary">
                    {/* {new Date(order.accept || "").toLocaleDateString('th-TH')} */}
                    {order.created_at}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-primary">
                    {order.sum_price.toLocaleString()} ฿
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.status)}`}>
                      {getStatusText(order.status)}
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
}