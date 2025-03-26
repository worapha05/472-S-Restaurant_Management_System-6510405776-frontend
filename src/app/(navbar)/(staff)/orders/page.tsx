'use client';

import OrderCard from "@/components/Order/OrderCard";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Loading from "@/components/Loading";

export default function OrdersPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

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
        } catch (err : any) {
            console.error("Error fetching orders:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
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
                <div className="bg-white rounded-xl p-6 text-center max-w-md">
                    <div className="text-red-500 text-5xl mb-4">⚠️</div>
                    <h2 className="text-xl font-bold mb-2">เกิดข้อผิดพลาด</h2>
                    <p className="text-neutral-600 mb-4">ไม่สามารถโหลดรายการคำสั่งซื้อได้ กรุณาลองใหม่อีกครั้ง</p>
                    <button 
                        onClick={fetchOrders}
                        className="inline-block bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg"
                    >
                        ลองใหม่
                    </button>
                </div>
            </div>
        );
    }

    // Show orders when data is loaded
    return (
        <div className="flex flex-col items-center justify-center w-full px-4">
            <p className="font-bold text-3xl w-full max-w-5xl py-12">รายการคำสั่งซื้อ</p>
            
            {orders.length === 0 ? (
                <div className="bg-white rounded-xl p-10 text-center w-full max-w-5xl">
                    <div className="text-neutral-400 text-5xl mb-4">📋</div>
                    <h2 className="text-xl font-medium mb-2">ไม่พบรายการคำสั่งซื้อ</h2>
                    <p className="text-neutral-500">คุณยังไม่มีรายการคำสั่งซื้อในขณะนี้</p>
                </div>
            ) : (
                <div className="flex flex-col gap-4 w-full max-w-5xl">
                    {orders.map((order) => (
                        <OrderCard key={order.id} order={order} />
                    ))}
                </div>
            )}
        </div>
    );
}