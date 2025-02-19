'use client';

import { useState, useEffect } from 'react';
import OrderListCard from "@/components/Order/OrderListCard";
import SummaryOrderCard from "@/components/Order/SummaryOrderCard";

export default function OrderPage() {
    const [order, setOrder] = useState();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch('http://localhost/api/orders/2');
                if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
                
                const data = await res.json();
                console.log(data);
                setOrder(data);
            } catch (err) {
                if (err instanceof Error) {
                    setError(err.message);
                } else {
                    setError('An unknown error occurred');
                }
            } finally {
                setLoading(false);
            }
        };
        
        fetchData();
    }, []);

    return (
        <div className="flex flex-col items-center justify-center w-full px-4">
            
            <p className="font-bold text-3xl w-full max-w-5xl py-12">รายการคำสั่งซื้อ</p>

            {/* Loading State */}
            {loading && <p>Loading...</p>}

            {/* Error State */}
            {error && <p className="text-red-500">Error: {error}</p>}

            {/* Display Data When Ready */}
            {order && (
                <div className="flex items-start justify-center gap-12 w-full max-w-5xl">
                    
                    {/* Order List Section */}
                    <div className="flex flex-col gap-4 w-5/6">
                        {/* <OrderListCard />
                        <OrderListCard />
                        <OrderListCard /> */}
                        <p>{order}</p>
                    </div>

                    {/* Summary Section */}
                    <div className="flex flex-col gap-4 w-2/5">
                        <SummaryOrderCard />

                        <div className="
                            cursor-pointer flex items-center justify-center p-6 bg-button text-white rounded-2xl font-bold
                            hover:bg-hoverButton
                        ">
                            สั่งซื้อ
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}