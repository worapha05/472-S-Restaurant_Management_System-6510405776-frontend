'use client';

import { useState, useEffect, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

// Define TypeScript interfaces
interface Order {
  id: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  type: string;
  table_id: number | null;
  status: string;
  payment_method: string;
  sum_price: number;
  address: string | null;
  accept: string | null;
  user_id: number;
}

interface OrderListItem {
  id: number;
  description: string;
  quantity: number;
  food: {
    name: string;
    image_url: string;
    price: number;
  };
}

interface Reservation {
  appointment_time: string;
  date: string;
  id: string;
  status: string;
  table_id: string;
  created_at: string;
  user_id: string;
  user_name: string;
}

interface SummaryStats {
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  pendingOrders: number;
  completedOrders: number;
  cancelledOrders: number;
}

interface ChartDataItem {
  name: string;
  value: number;
}

interface RevenueDataItem {
  name: string;
  revenue: number;
}

// Dashboard component
export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [timeRange, setTimeRange] = useState<"week" | "month" | "year">("week"); // week, month, year

  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  // Fetch orders data
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);

        if (status !== 'authenticated' || !session?.user?.accessToken) {
          // Don't attempt to fetch if we don't have a session yet
          return;
        }

        const res = await fetch(`${process.env.NEXT_PUBLIC_CLIENT_API_URL}/api/orders`, {
          headers: {
            'Authorization': `Bearer ${session.user.accessToken}`,
          }
        });

        if (!res.ok) {
          throw new Error('Failed to fetch data');
        }
        
        const resJson = await res.json();
        console.log("Fetched Order Data:", resJson);
        const data = resJson.data || [];

        setOrders(data);
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, [session, status]);

  // Calculate summary statistics
  const summaryStats = useMemo<SummaryStats>(() => {
    if (!orders.length) return {
      totalOrders: 0,
      totalRevenue: 0,
      averageOrderValue: 0,
      pendingOrders: 0,
      completedOrders: 0,
      cancelledOrders: 0
    };
    
    const completed = orders.filter(order => order.status.toLowerCase() === 'completed').length;
    const pending = orders.filter(order => 
      ['pending', 'processing', 'confirmed'].includes(order.status.toLowerCase())
    ).length;
    const cancelled = orders.filter(order => order.status.toLowerCase() === 'cancelled').length;
    
    const revenue = orders.reduce((sum, order) => sum + (order.sum_price || 0), 0);
    
    return {
      totalOrders: orders.length,
      totalRevenue: revenue,
      averageOrderValue: revenue / orders.length,
      pendingOrders: pending,
      completedOrders: completed,
      cancelledOrders: cancelled
    };
  }, [orders]);

  // Prepare data for charts
  const ordersByStatus = useMemo<ChartDataItem[]>(() => {
    if (!orders.length) return [];
    
    const statusCounts: Record<string, number> = {};
    orders.forEach(order => {
      const status = order.status.toLowerCase();
      statusCounts[status] = (statusCounts[status] || 0) + 1;
    });
    
    return Object.entries(statusCounts).map(([status, count]) => ({
      name: status.charAt(0).toUpperCase() + status.slice(1),
      value: count
    }));
  }, [orders]);

  // Data for revenue by time
  const revenueByTime = useMemo<RevenueDataItem[]>(() => {
    if (!orders.length) return [];
    
    // Function to get appropriate date part based on time range
    const getDateKey = (dateStr: string): string => {
      const date = new Date(dateStr);
      
      if (timeRange === 'week') {
        // Group by day of week (0-6)
        return date.toLocaleDateString('th-TH', { weekday: 'short' });
      } else if (timeRange === 'month') {
        // Group by day of month (1-31)
        return date.getDate().toString();
      } else {
        // Group by month (Jan-Dec)
        return date.toLocaleDateString('th-TH', { month: 'short' });
      }
    };

    // Filter orders based on time range
    const filteredOrders = orders.filter(order => {
      const orderDate = new Date(order.created_at);
      const now = new Date();
      
      if (timeRange === 'week') {
        // Last 7 days
        const weekAgo = new Date();
        weekAgo.setDate(now.getDate() - 7);
        return orderDate >= weekAgo;
      } else if (timeRange === 'month') {
        // Last 30 days
        const monthAgo = new Date();
        monthAgo.setDate(now.getDate() - 30);
        return orderDate >= monthAgo;
      } else {
        // Last 12 months
        const yearAgo = new Date();
        yearAgo.setFullYear(now.getFullYear() - 1);
        return orderDate >= yearAgo;
      }
    });
    
    // Group revenue by time period
    const revenueByPeriod: Record<string, number> = {};
    filteredOrders.forEach(order => {
      const dateKey = getDateKey(order.created_at);
      revenueByPeriod[dateKey] = (revenueByPeriod[dateKey] || 0) + (order.sum_price || 0);
    });
    
    // Sort keys appropriately
    let sortedKeys;
    if (timeRange === 'week') {
      // Sort by day of week
      const daysOfWeek = ['อา.', 'จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.'];
      sortedKeys = Object.keys(revenueByPeriod).sort(
        (a, b) => daysOfWeek.indexOf(a) - daysOfWeek.indexOf(b)
      );
    } else if (timeRange === 'month') {
      // Sort by day of month
      sortedKeys = Object.keys(revenueByPeriod).sort((a, b) => parseInt(a) - parseInt(b));
    } else {
      // Sort by month
      const months = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
      sortedKeys = Object.keys(revenueByPeriod).sort(
        (a, b) => months.indexOf(a) - months.indexOf(b)
      );
    }
    
    return sortedKeys.map(key => ({
      name: key,
      revenue: revenueByPeriod[key]
    }));
  }, [orders, timeRange]);

  // Payment method distribution
  const paymentMethods = useMemo<ChartDataItem[]>(() => {
    if (!orders.length) return [];
    
    const methodCounts: Record<string, number> = {};
    orders.forEach(order => {
      const method = order.payment_method || 'ไม่ระบุ';
      methodCounts[method] = (methodCounts[method] || 0) + 1;
    });
    
    return Object.entries(methodCounts).map(([method, count]) => ({
      name: method,
      value: count
    }));
  }, [orders]);

  // Order type distribution (e.g. dine-in vs takeaway)
  const orderTypes = useMemo<ChartDataItem[]>(() => {
    if (!orders.length) return [];
    
    const typeCounts: Record<string, number> = {};
    orders.forEach(order => {
      const type = order.type || 'ไม่ระบุ';
      typeCounts[type] = (typeCounts[type] || 0) + 1;
    });
    
    return Object.entries(typeCounts).map(([type, count]) => ({
      name: type,
      value: count
    }));
  }, [orders]);

  // Colors for charts based on your color scheme
  const COLORS: string[] = ['#262626', '#4E54E7', '#1DA936', '#A91D3A', '#4D4D4D', '#808080'];

  return (
    <div className="flex flex-col items-center justify-center w-full px-4">
      <div className="flex flex-col gap-6 w-full max-w-6xl">
        <div className="flex justify-between items-center w-full py-12">
          <p className="font-bold text-3xl text-mainText">แดชบอร์ด</p>

          <div className="flex space-x-2">
            {[
              { id: "week", label: "7 วัน" },
              { id: "month", label: "30 วัน" },
              { id: "year", label: "12 เดือน" }
            ].map((option) => (
              <button 
                key={option.id}
                onClick={() => setTimeRange(option.id)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  timeRange === option.id 
                    ? "bg-button text-white" 
                    : "bg-searchBox text-primary hover:bg-hoverButton hover:text-white"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {status === 'loading' || loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-inputFieldFocus"></div>
          </div>
        ) : (
          <>
            {/* Summary Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
              <div className="bg-background p-6 rounded-xl shadow-sm border border-searchBox flex flex-col">
                <span className="text-secondText text-sm mb-1">ยอดคำสั่งซื้อทั้งหมด</span>
                <span className="text-3xl font-bold text-mainText">{summaryStats.totalOrders.toLocaleString()}</span>
                <div className="mt-4 flex items-center space-x-1">
                  <div className="w-3 h-3 rounded-full bg-acceptGreen"></div>
                  <span className="text-sm text-secondText">เสร็จสิ้น: {summaryStats.completedOrders}</span>
                </div>
                <div className="mt-1 flex items-center space-x-1">
                  <div className="w-3 h-3 rounded-full bg-inputFieldFocus"></div>
                  <span className="text-sm text-secondText">กำลังดำเนินการ: {summaryStats.pendingOrders}</span>
                </div>
                <div className="mt-1 flex items-center space-x-1">
                  <div className="w-3 h-3 rounded-full bg-cancelRed"></div>
                  <span className="text-sm text-secondText">ยกเลิก: {summaryStats.cancelledOrders}</span>
                </div>
              </div>

              <div className="bg-background p-6 rounded-xl shadow-sm border border-searchBox">
                <span className="text-secondText text-sm mb-1">รายได้ทั้งหมด</span>
                <span className="text-3xl font-bold text-mainText">฿{summaryStats.totalRevenue.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                })}</span>
                <div className="mt-4">
                  <span className="text-sm text-secondText">ค่าเฉลี่ยต่อออเดอร์</span>
                  <span className="text-lg font-medium ml-2 text-mainText">฿{summaryStats.averageOrderValue.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })}</span>
                </div>
              </div>

              <div className="bg-background p-6 rounded-xl shadow-sm border border-searchBox md:col-span-2 lg:col-span-1">
                <span className="text-secondText text-sm mb-1">สถานะคำสั่งซื้อ</span>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={ordersByStatus}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {ordersByStatus.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value} คำสั่งซื้อ`, 'จำนวน']} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Revenue Chart */}
            <div className="bg-background p-6 rounded-xl shadow-sm border border-searchBox mb-6">
              <span className="text-xl font-medium text-mainText mb-4 block">รายได้ตามช่วงเวลา</span>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={revenueByTime}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`฿${value}`, 'รายได้']} />
                    <Legend />
                    <Line type="monotone" dataKey="revenue" stroke="#4E54E7" activeDot={{ r: 8 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Payment Method and Order Type */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="bg-background p-6 rounded-xl shadow-sm border border-searchBox">
                <span className="text-xl font-medium text-mainText mb-4 block">วิธีการชำระเงิน</span>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={paymentMethods}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`${value} คำสั่งซื้อ`, 'จำนวน']} />
                      <Legend />
                      <Bar dataKey="value" fill="#262626" name="จำนวนคำสั่งซื้อ" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-background p-6 rounded-xl shadow-sm border border-searchBox">
                <span className="text-xl font-medium text-mainText mb-4 block">ประเภทออเดอร์</span>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={orderTypes}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {orderTypes.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value} คำสั่งซื้อ`, 'จำนวน']} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Recent Orders Table */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-searchBox">
              <div className="flex justify-between items-center mb-4">
                <span className="text-xl font-medium text-mainText">คำสั่งซื้อล่าสุด</span>
                <button 
                  onClick={() => router.push('/orders')} 
                  className="text-inputFieldFocus hover:underline hover:text-hoverButton">
                    ดูทั้งหมด
                </button>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-searchBox">
                  <thead className="bg-searchBox">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-secondText uppercase tracking-wider">
                        ID
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-secondText uppercase tracking-wider">
                        วันที่
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-secondText uppercase tracking-wider">
                        ประเภท
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-secondText uppercase tracking-wider">
                        ยอดรวม
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-secondText uppercase tracking-wider">
                        วิธีชำระเงิน
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-secondText uppercase tracking-wider">
                        สถานะ
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-background divide-y divide-searchBox">
                    {orders.slice(0, 5).map((order) => {
                      // Get status color based on order status
                      let statusColor = 'bg-searchBox text-secondText';
                      if (order.status.toLowerCase() === 'completed') {
                        statusColor = 'bg-acceptGreen bg-opacity-20 text-acceptGreen';
                      } else if (['pending', 'processing', 'confirmed'].includes(order.status.toLowerCase())) {
                        statusColor = 'bg-inputFieldFocus bg-opacity-20 text-inputFieldFocus';
                      } else if (order.status.toLowerCase() === 'cancelled') {
                        statusColor = 'bg-cancelRed bg-opacity-20 text-cancelRed';
                      }
                      
                      return (
                        <tr key={order.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-mainText">
                            #{order.id}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-mainText">
                            {new Date(order.created_at).toLocaleDateString('th-TH')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-mainText">
                            {order.type}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-mainText">
                            ฿{order.sum_price.toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2
                            })}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-mainText">
                            {order.payment_method || 'ไม่ระบุ'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColor}`}>
                              {order.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}