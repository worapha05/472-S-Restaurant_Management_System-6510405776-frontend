'use client';

import { useState, useEffect, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

interface FinancialPieItem {
  name: string;
  value: number;
}

interface SummaryStats {
  totalOrders: number;
  completedOrders: number;
  pendingOrders: number;
  cancelledOrders: number;
  totalIncome: number;
  totalExpenses: number;
  profit: number;
}

// Financial Dashboard Page component
export default function FinancialDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [expenses, setExpenses] = useState<InventoryLog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  // Fetch data
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);

        if (status !== 'authenticated' || !session?.user?.accessToken) {
          return;
        }

        // Fetch orders
        const ordersRes = await fetch(`${process.env.NEXT_PUBLIC_CLIENT_API_URL}/api/orders`, {
          headers: {
            'Authorization': `Bearer ${session.user.accessToken}`,
          }
        });

        if (!ordersRes.ok) {
          throw new Error('Failed to fetch orders data');
        }
        
        const ordersJson = await ordersRes.json();
        const ordersData = ordersJson.data || [];
        setOrders(ordersData);

        // Fetch inventory logs (expenses)
        const expensesRes = await fetch(`${process.env.NEXT_PUBLIC_CLIENT_API_URL}/api/inventoryLogs`, {
          headers: {
            'Authorization': `Bearer ${session.user.accessToken}`,
          }
        });

        if (!expensesRes.ok) {
          throw new Error('Failed to fetch inventory logs data');
        }
        
        const expensesJson = await expensesRes.json();
        const expensesData = expensesJson.data || [];
        setExpenses(expensesData);

      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, [session, status]);

  // Calculate summary statistics
  const summaryStats = useMemo<SummaryStats>(() => {
    // Order stats
    const completed = orders.filter(order => order.status.toLowerCase() === 'completed').length;
    const pending = orders.filter(order => 
      ['pending', 'processing', 'confirmed'].includes(order.status.toLowerCase())
    ).length;
    const cancelled = orders.filter(order => order.status.toLowerCase() === 'cancelled').length;
    
    // Financial stats - only count completed orders for income
    const completedOrders = orders.filter(order => order.status.toLowerCase() === 'completed');
    const totalIncome = completedOrders.reduce((sum, order) => sum + (order.sum_price || 0), 0);
    const totalExpenses = expenses.reduce((sum, expense) => sum + (expense.total_cost || 0), 0);
    const profit = totalIncome - totalExpenses;
    
    return {
      totalOrders: orders.length,
      completedOrders: completed,
      pendingOrders: pending,
      cancelledOrders: cancelled,
      totalIncome,
      totalExpenses,
      profit
    };
  }, [orders, expenses]);

  // Prepare data for financial pie chart
  const financialPieData = useMemo<FinancialPieItem[]>(() => {
    const { totalIncome, totalExpenses, profit } = summaryStats;
    
    // Only show profit if it's positive
    if (profit > 0) {
      return [
        { name: 'รายรับ', value: totalIncome },
        { name: 'ค่าใช้จ่าย', value: totalExpenses },
        { name: 'กำไร', value: profit }
      ];
    } else {
      // If no profit or loss, just show income and expenses
      return [
        { name: 'รายรับ', value: totalIncome },
        { name: 'ค่าใช้จ่าย', value: totalExpenses }
      ];
    }
  }, [summaryStats]);

  // Prepare data for order type pie chart
  const orderTypePieData = useMemo<FinancialPieItem[]>(() => {
    if (!orders.length) return [];
    
    const typeCounts: Record<string, number> = {};
    orders.forEach(order => {
      const type = order.type || 'ไม่ระบุ';
      typeCounts[type] = (typeCounts[type] || 0) + (order.sum_price || 0);
    });
    
    return Object.entries(typeCounts).map(([type, amount]) => ({
      name: type,
      value: amount
    }));
  }, [orders]);

  // Colors for charts
  const FINANCIAL_COLORS = ['#4E54E7', '#A91D3A', '#1DA936'];
  const ORDER_TYPE_COLORS = ['#262626', '#4E54E7', '#1DA936', '#808080', '#4D4D4D'];

  // Custom tooltip formatter for financial pie
  const financialTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-searchBox rounded-lg shadow-sm">
          <p className="font-medium">{payload[0].name}</p>
          <p className="text-black">
            ฿{payload[0].value.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            })}
          </p>
          <p className="text-xs text-secondText">
            {((payload[0].value / (summaryStats.totalIncome + summaryStats.totalExpenses)) * 100).toFixed(1)}%
          </p>
        </div>
      );
    }
    return null;
  };

  // Custom tooltip formatter for order type pie
  const orderTypeTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-searchBox rounded-lg shadow-sm">
          <p className="font-medium">{payload[0].name}</p>
          <p className="text-black">
            ฿{payload[0].value.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            })}
          </p>
          <p className="text-xs text-secondText">
            {((payload[0].value / summaryStats.totalIncome) * 100).toFixed(1)}% ของรายรับ
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="flex flex-col items-center justify-center w-full px-4">
      <div className="flex flex-col gap-6 w-full max-w-6xl py-12">
        <div className="w-full">
          <p className="font-bold text-3xl text-mainText mb-6">รายงานการเงิน</p>

          {status === 'loading' || loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-inputFieldFocus"></div>
            </div>
          ) : (
            <>
              {/* Summary Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {/* Orders Summary Card */}
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

                {/* Income Card */}
                <div className="bg-background p-6 rounded-xl shadow-sm border border-searchBox flex flex-col">
                  <span className="text-secondText text-sm mb-1">รายรับทั้งหมด</span>
                  <span className="text-3xl font-bold text-inputFieldFocus">
                    ฿{summaryStats.totalIncome.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    })}
                  </span>
                  <div className="mt-4">
                    <span className="text-sm text-secondText">จำนวนออเดอร์ที่เสร็จสิ้น</span>
                    <span className="text-lg font-medium ml-2 text-mainText">{summaryStats.completedOrders}</span>
                  </div>
                </div>

                {/* Expenses Card */}
                <div className="bg-background p-6 rounded-xl shadow-sm border border-searchBox flex flex-col">
                  <span className="text-secondText text-sm mb-1">ค่าใช้จ่ายทั้งหมด</span>
                  <span className="text-3xl font-bold text-cancelRed">
                    ฿{summaryStats.totalExpenses.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    })}
                  </span>
                  <div className="mt-4">
                    <span className="text-sm text-secondText">จำนวนรายการสินค้าคงคลัง</span>
                    <span className="text-lg font-medium ml-2 text-mainText">{expenses.length}</span>
                  </div>
                </div>

                {/* Profit Card */}
                <div className="bg-background p-6 rounded-xl shadow-sm border border-searchBox flex flex-col">
                  <span className="text-secondText text-sm mb-1">กำไรสุทธิ</span>
                  <span className={`text-3xl font-bold ${summaryStats.profit >= 0 ? 'text-acceptGreen' : 'text-cancelRed'}`}>
                    ฿{summaryStats.profit.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    })}
                  </span>
                  <div className="mt-4">
                    <span className="text-sm text-secondText">อัตรากำไร</span>
                    <span className="text-lg font-medium ml-2 text-mainText">
                      {summaryStats.totalIncome > 0 
                        ? `${((summaryStats.profit / summaryStats.totalIncome) * 100).toFixed(2)}%` 
                        : "0.00%"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Pie Charts Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Financial Summary Pie Chart */}
                <div className="bg-background p-6 rounded-xl shadow-sm border border-searchBox">
                  <h2 className="text-xl font-medium text-mainText mb-6">สรุปทางการเงิน</h2>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={financialPieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={70}
                          outerRadius={140}
                          fill="#8884d8"
                          paddingAngle={2}
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}
                          labelLine={false}
                        >
                          {financialPieData.map((entry, index) => (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={FINANCIAL_COLORS[index % FINANCIAL_COLORS.length]} 
                            />
                          ))}
                        </Pie>
                        <Tooltip content={financialTooltip} />
                        <Legend verticalAlign="bottom" />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Order Type Pie Chart */}
                <div className="bg-background p-6 rounded-xl shadow-sm border border-searchBox">
                  <h2 className="text-xl font-medium text-mainText mb-6">รายได้ตามประเภทออเดอร์</h2>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={orderTypePieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={70}
                          outerRadius={140}
                          fill="#8884d8"
                          paddingAngle={2}
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}
                          labelLine={false}
                        >
                          {orderTypePieData.map((entry, index) => (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={ORDER_TYPE_COLORS[index % ORDER_TYPE_COLORS.length]} 
                            />
                          ))}
                        </Pie>
                        <Tooltip content={orderTypeTooltip} />
                        <Legend verticalAlign="bottom" />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}