'use client';

import OrderCard from "@/components/Order/OrderCard";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Loading from "@/components/Loading";

// Define the OrderStatus enum
type OrderStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

// Define filter values type
type StatusFilter = OrderStatus | 'ALL';

// Summary card props interface
interface SummaryCardProps {
    title: string;
    count: number;
    icon: React.ReactNode;
    bgColor: string;
    iconColor: string;
}

export default function OrdersPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [orders, setOrders] = useState<Order[]>([]);
    const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // Filter states
    const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
    const [dateFilter, setDateFilter] = useState({
        startDate: "",
        endDate: "",
    });
    const [showFilters, setShowFilters] = useState<boolean>(false);

    useEffect(() => {
        // Redirect to login if not authenticated
        if (status === 'unauthenticated') {
            router.push('/login');
        }
    }, [status, router]);

    useEffect(() => {
        // Fetch orders when session is authenticated
        if (status === 'authenticated' && session?.user?.accessToken) {
            fetchOrders();
        }
    }, [status, session]);

    useEffect(() => {
        // Apply filters whenever orders or filters change
        applyFilters();
    }, [orders, statusFilter, dateFilter]);

    async function fetchOrders() {
        try {
            setLoading(true);
            const res = await fetch(`${process.env.NEXT_PUBLIC_CLIENT_API_URL}/api/orders`, {
                headers: {
                    'Authorization': `Bearer ${session?.user?.accessToken}`,
                }
            });
            
            if (!res.ok) {
                throw new Error('Failed to fetch orders');
            }
            
            const resJson = await res.json();
            console.log("Fetched Orders:", resJson);
            setOrders(resJson.data || []);
        } catch (err: any) {
            console.error("Error fetching orders:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    function applyFilters() {
        let result = [...orders];
        
        // Apply status filter
        if (statusFilter !== "ALL") {
            result = result.filter(order => order.status === statusFilter);
        }
        
        // Apply date filter
        if (dateFilter.startDate) {
            const startDate = new Date(dateFilter.startDate);
            startDate.setHours(0, 0, 0, 0);
            result = result.filter(order => new Date(order.created_at) >= startDate);
        }
        
        if (dateFilter.endDate) {
            const endDate = new Date(dateFilter.endDate);
            endDate.setHours(23, 59, 59, 999);
            result = result.filter(order => new Date(order.created_at) <= endDate);
        }
        
        setFilteredOrders(result);
    }

    function resetFilters() {
        setStatusFilter("ALL");
        setDateFilter({
            startDate: "",
            endDate: "",
        });
    }

    // Show loading state
    if (loading || status === 'loading') {
        return (
            <Loading message="กำลังโหลดรายการคำสั่งซื้อ..." />
        );
    }

    // Show error state
    if (error) {
        return (
            <div className="flex flex-col items-center justify-center w-full px-4 py-12">
                <div className="bg-white rounded-xl p-6 shadow-md text-center max-w-md">
                    <div className="text-red-500 text-5xl mb-4">⚠️</div>
                    <h2 className="text-xl font-bold mb-2">เกิดข้อผิดพลาด</h2>
                    <p className="text-secondary mb-4">ไม่สามารถโหลดรายการคำสั่งซื้อได้ กรุณาลองใหม่อีกครั้ง</p>
                    <button 
                        onClick={fetchOrders}
                        className="inline-block bg-button hover:bg-hoverButton text-white px-4 py-2 rounded-lg transition-all"
                    >
                        ลองใหม่
                    </button>
                </div>
            </div>
        );
    }

    // Helper function to get status options
    const getStatusOptions = () => {
        // Define with correct typing
        const statuses: Array<StatusFilter> = ["ALL", "PENDING", "IN_PROGRESS", "COMPLETED", "CANCELLED"];
        const statusLabels: Record<StatusFilter, string> = {
            "ALL": "ทั้งหมด",
            "PENDING": "รอดำเนินการ",
            "IN_PROGRESS": "กำลังดำเนินการ",
            "COMPLETED": "เสร็จสิ้น",
            "CANCELLED": "ยกเลิก"
        };
        
        return statuses.map(status => ({
            value: status,
            label: statusLabels[status]
        }));
    };

    // Show orders when data is loaded
    return (
        <div className="min-h-screen py-8">
            <div className="container mx-auto px-4 max-w-6xl">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
                    <h1 className="text-3xl font-bold text-mainText mb-4 md:mb-0">รายการคำสั่งซื้อ</h1>
                    
                    <div className="flex flex-col sm:flex-row gap-3">
                        <button 
                            onClick={() => router.push('/menu')}
                            className="flex items-center justify-center gap-2 bg-accent hover:bg-accent/80 text-white px-4 py-2 rounded-lg transition-all"
                        >
                            <svg className="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 5.757v8.486M5.757 10h8.486M19 10a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/>
                            </svg>
                            <span>เพิ่มรายการสั่งซื้อ</span>
                        </button>
                        
                        <button 
                            onClick={() => setShowFilters(!showFilters)}
                            className="flex items-center justify-center gap-2 bg-button hover:bg-hoverButton text-white px-4 py-2 rounded-lg transition-all"
                        >
                            <svg className="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7.75 4H19M7.75 4a2.25 2.25 0 0 1-4.5 0m4.5 0a2.25 2.25 0 0 0-4.5 0M1 4h2.25m13.5 6H19m-2.25 0a2.25 2.25 0 0 1-4.5 0m4.5 0a2.25 2.25 0 0 0-4.5 0M1 10h11.25m-4.5 6H19M14.75 16a2.25 2.25 0 0 1-4.5 0m4.5 0a2.25 2.25 0 0 0-4.5 0M1 16h9.25"/>
                            </svg>
                            <span>{showFilters ? "ซ่อนตัวกรอง" : "แสดงตัวกรอง"}</span>
                        </button>
                    </div>
                </div>
                
                {/* Filters Section */}
                {showFilters && (
                    <div className="bg-white rounded-xl p-6 shadow-md mb-6 transition-all">
                        <div className="flex flex-col md:flex-row gap-4 items-end">
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-secondary mb-2">สถานะ</label>
                                <select 
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
                                    className="w-full px-3 py-2 bg-searchBox border border-secondary/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-inputFieldFocus"
                                >
                                    {getStatusOptions().map(option => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-secondary mb-2">วันที่เริ่มต้น</label>
                                <input 
                                    type="date" 
                                    value={dateFilter.startDate}
                                    onChange={(e) => setDateFilter(prev => ({ ...prev, startDate: e.target.value }))}
                                    className="w-full px-3 py-2 bg-searchBox border border-secondary/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-inputFieldFocus"
                                />
                            </div>
                            
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-secondary mb-2">วันที่สิ้นสุด</label>
                                <input 
                                    type="date"
                                    value={dateFilter.endDate}
                                    onChange={(e) => setDateFilter(prev => ({ ...prev, endDate: e.target.value }))}
                                    className="w-full px-3 py-2 bg-searchBox border border-secondary/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-inputFieldFocus"
                                />
                            </div>
                            
                            <div className="flex-none">
                                <button 
                                    onClick={resetFilters}
                                    className="px-4 py-2 border border-secondary/20 text-secondary rounded-lg hover:bg-searchBox transition-all"
                                >
                                    รีเซ็ต
                                </button>
                            </div>
                        </div>
                    </div>
                )}
                
                {/* Orders Summary */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <SummaryCard 
                        title="คำสั่งซื้อทั้งหมด"
                        count={orders.length}
                        icon={
                            <svg className="w-6 h-6" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 18 20">
                                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 2h4a1 1 0 0 1 1 1v15a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1h4m6 0a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1m6 0v3H6V2M5 5h8m-8 5h8m-8 4h8"/>
                            </svg>
                        }
                        bgColor="bg-accent/10"
                        iconColor="text-accent"
                    />
                    <SummaryCard 
                        title="รอดำเนินการ"
                        count={orders.filter(order => order.status === 'PENDING').length}
                        icon={
                            <svg className="w-6 h-6" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 3V1m0 18v-2M5.05 5.05 3.636 3.636m12.728 12.728L14.95 14.95M3 10H1m18 0h-2M5.05 14.95l-1.414 1.414M16.364 3.636 14.95 5.05M14 10a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z"/>
                            </svg>
                        }
                        bgColor="bg-orange-100"
                        iconColor="text-orange-700"
                    />
                    <SummaryCard 
                        title="เสร็จสิ้น"
                        count={orders.filter(order => order.status === 'COMPLETED').length}
                        icon={
                            <svg className="w-6 h-6" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m7 10 2 2 4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/>
                            </svg>
                        }
                        bgColor="bg-acceptGreen/10"
                        iconColor="text-acceptGreen"
                    />
                    <SummaryCard 
                        title="ยกเลิก"
                        count={orders.filter(order => order.status === 'CANCELLED').length}
                        icon={
                            <svg className="w-6 h-6" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m13 7-6 6m0-6 6 6m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/>
                            </svg>
                        }
                        bgColor="bg-cancelRed/10"
                        iconColor="text-cancelRed"
                    />
                </div>
                
                {/* Orders List */}
                {filteredOrders.length === 0 ? (
                    <div className="bg-white rounded-xl p-10 text-center shadow-md">
                        <div className="text-secondary text-5xl mb-4">📋</div>
                        <h2 className="text-xl font-medium mb-2">ไม่พบรายการคำสั่งซื้อ</h2>
                        <p className="text-secondText">
                            {orders.length > 0 
                                ? 'ไม่พบรายการที่ตรงกับตัวกรองที่คุณเลือก' 
                                : 'คุณยังไม่มีรายการคำสั่งซื้อในขณะนี้'}
                        </p>
                        {orders.length > 0 && (
                            <button 
                                onClick={resetFilters}
                                className="mt-4 inline-block bg-button hover:bg-hoverButton text-white px-4 py-2 rounded-lg transition-all"
                            >
                                รีเซ็ตตัวกรอง
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="flex flex-col gap-4">
                        {filteredOrders.map((order) => (
                            <OrderCard key={order.id} order={order} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

// Summary Card Component
function SummaryCard({ title, count, icon, bgColor, iconColor }: SummaryCardProps) {
    return (
        <div className="bg-white rounded-xl p-6 shadow-md">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-secondary font-medium">{title}</h3>
                    <p className="text-3xl font-bold text-mainText mt-2">{count}</p>
                </div>
                <div className={`p-3 rounded-full ${bgColor}`}>
                    <div className={iconColor}>
                        {icon}
                    </div>
                </div>
            </div>
        </div>
    );
}