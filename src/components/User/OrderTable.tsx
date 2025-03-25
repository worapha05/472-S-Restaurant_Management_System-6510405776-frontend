'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

interface Order {
  id: string;
  created_at: string;
  sum_price: number;
  status: string;
  type: string;
}

interface OrderListProps {
  userId?: string;
}

export default function OrderList({ userId }: OrderListProps) {
  const { data: session } = useSession();
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filter state
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const ordersPerPage = 10;

  // Status options for the filter
  const statusOptions = [
    { value: 'all', label: 'ทั้งหมด' },
    { value: 'completed', label: 'เสร็จสิ้น' },
    { value: 'delivered', label: 'จัดส่งแล้ว' },
    { value: 'processing', label: 'กำลังดำเนินการ' },
    { value: 'pending', label: 'รอดำเนินการ' },
    { value: 'cancelled', label: 'ยกเลิก' }
  ];

  // Format date to a more readable format
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return dateString;
      }
      
      // Format date: DD/MM/YYYY HH:MM
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      
      return `${day}/${month}/${year} ${hours}:${minutes}`;
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateString;
    }
  };

  // Get order type text
  const getOrderTypeText = (type: string) => {
    switch (type?.toUpperCase()) {
      case 'DELIVERY':
        return 'จัดส่ง';
      case 'PICKUP':
        return 'รับที่ร้าน';
      case 'DINE_IN':
        return 'ทานที่ร้าน';
      default:
        return type || '-';
    }
  };

  // Get order type icon/indicator
  const getOrderTypeIcon = (type: string) => {
    switch (type?.toUpperCase()) {
      case 'DELIVERY':
        return (
          <span className="flex items-center text-blue-600">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
            </svg>
            {getOrderTypeText(type)}
          </span>
        );
      case 'PICKUP':
        return (
          <span className="flex items-center text-green-600">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            {getOrderTypeText(type)}
          </span>
        );
      case 'DINE_IN':
        return (
          <span className="flex items-center text-purple-600">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            {getOrderTypeText(type)}
          </span>
        );
      default:
        return <span>{getOrderTypeText(type)}</span>;
    }
  };

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setIsLoading(true);
        const id = userId || session?.user?.id;
        
        if (!id) {
          setIsLoading(false);
          return;
        }

        const response = await fetch(`${process.env.NEXT_PUBLIC_CLIENT_API_URL}/api/users/${id}/orders`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${session?.user?.accessToken}`,
          },
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch order data');
        }
        
        const data = await response.json();
        const allOrders = data.data || [];
        
        setOrders(allOrders);
        setFilteredOrders(allOrders);
        
        // Calculate total pages based on all orders
        setTotalPages(Math.ceil(allOrders.length / ordersPerPage));

      } catch (err) {
        console.error('Error fetching orders:', err);
        setError('ไม่สามารถโหลดรายการคำสั่งซื้อได้');
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, [session, userId]);

  // Apply filters when statusFilter changes
  useEffect(() => {
    // Reset to first page when filter changes
    setCurrentPage(1);
    
    if (statusFilter === 'all') {
      setFilteredOrders(orders);
    } else {
      const filtered = orders.filter(order => 
        order.status.toLowerCase() === statusFilter.toLowerCase()
      );
      setFilteredOrders(filtered);
    }
    
    // Update total pages based on filtered orders
    setTotalPages(Math.max(1, Math.ceil(
      (statusFilter === 'all' ? orders.length : filteredOrders.length) / ordersPerPage
    )));
  }, [statusFilter, orders]);

  // Get current orders for pagination
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);

  // Change page
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

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

  // Get button style based on filter selection
  const getFilterButtonStyle = (value: string) => {
    return statusFilter === value 
      ? "bg-button text-background" 
      : "bg-background text-primary hover:bg-searchBox";
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
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-mainText mb-4">ประวัติการสั่งซื้อ</h2>
        
        {/* Status Filter Toggle Buttons */}
        <div className="flex flex-wrap gap-2">
          {statusOptions.map(option => (
            <button
              key={option.value}
              onClick={() => setStatusFilter(option.value)}
              className={`px-4 py-2 text-sm border border-searchBox rounded-md transition-colors ${getFilterButtonStyle(option.value)}`}
            >
              {option.label}
              {option.value !== 'all' && (
                <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-gray-200 text-gray-700">
                  {orders.filter(order => order.status.toLowerCase() === option.value.toLowerCase()).length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
      
      {filteredOrders.length > 0 ? (
        <>
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
                    ประเภท
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
                {currentOrders.map((order) => (
                  <tr key={order.id}>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-mainText">
                      {order.id}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-primary">
                      {formatDate(order.created_at)}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm">
                      {getOrderTypeIcon(order.type)}
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
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center mt-6">
              <nav className="flex items-center">
                <button
                  onClick={() => paginate(currentPage > 1 ? currentPage - 1 : 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1 rounded-md mr-2 border border-searchBox disabled:opacity-50 disabled:cursor-not-allowed text-primary hover:bg-searchBox"
                >
                  ก่อนหน้า
                </button>
                
                <div className="flex space-x-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => paginate(page)}
                      className={`px-3 py-1 rounded-md border ${
                        currentPage === page
                          ? 'bg-button text-background border-transparent'
                          : 'border-searchBox text-primary hover:bg-searchBox'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
                
                <button
                  onClick={() => paginate(currentPage < totalPages ? currentPage + 1 : totalPages)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 rounded-md ml-2 border border-searchBox disabled:opacity-50 disabled:cursor-not-allowed text-primary hover:bg-searchBox"
                >
                  ถัดไป
                </button>
              </nav>
            </div>
          )}
          
          <div className="mt-4 text-center text-xs text-secondText">
            แสดง {filteredOrders.length > 0 ? indexOfFirstOrder + 1 : 0} - {Math.min(indexOfLastOrder, filteredOrders.length)} จาก {filteredOrders.length} รายการ
            {statusFilter !== 'all' && ` (กรองตามสถานะ: ${statusOptions.find(o => o.value === statusFilter)?.label || statusFilter})`}
          </div>
        </>
      ) : (
        <div className="text-center py-10">
          {statusFilter === 'all' ? (
            <p className="text-secondText">ไม่มีประวัติการสั่งซื้อ</p>
          ) : (
            <p className="text-secondText">
              ไม่พบคำสั่งซื้อที่มีสถานะ "{statusOptions.find(o => o.value === statusFilter)?.label}"
              <button 
                onClick={() => setStatusFilter('all')} 
                className="ml-2 text-inputFieldFocus hover:underline"
              >
                ดูทั้งหมด
              </button>
            </p>
          )}
        </div>
      )}
    </div>
  );
}