'use client';

import OrderListCard from "@/components/Order/OrderListCard";
import SummaryOrderCard from "@/components/Order/SummaryOrderCard"; 

export default function OrderPage() {
    return (
        <div className="flex flex-col items-center justify-center w-full px-4">
            
            <p className="font-bold text-3xl w-full max-w-5xl py-12">รายการคำสั่งซื้อ</p>

            <div className="flex items-start justify-center gap-12 w-full max-w-5xl">
                
                {/* Order List Section - Increased Width */}
                <div className="flex flex-col gap-4 w-3/5">
                    <OrderListCard />
                    <OrderListCard />
                    <OrderListCard />
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

        </div>
    );
}