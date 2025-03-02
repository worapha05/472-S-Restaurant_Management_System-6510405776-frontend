'use client';

import { useRouter } from "next/navigation";
import CartList from "@/components/Cart/CartList";
import SummaryOrderCard from "@/components/Order/SummaryOrderCard"; 

interface Menu {
    id: number;
    name: string;
    price: number;  // Price as a number
    status: "available" | "unavailable";  // Assuming status can only be these two
    category: 'APPETIZER' | 'ENTREE' | 'MAIN COURSE' | 'DESSERT' | 'DRINK';
    description: string;
    image_url: string;
}

interface CartList {
    menu: Menu;
    description: string;
    quantity: number;
}

export default function CartPage() {
    const router = useRouter();
    const cart = JSON.parse(localStorage.getItem("cart") || "[]") as CartList[];

    console.log("-------------------");
    console.log(cart);

    const totalPrice = cart.reduce(
        (sum: number, item: any) => sum + item.food.price * item.quantity,
        0
    );

    const fee = Math.round((totalPrice * 0.1) * 100) / 100;

    return (
        <div className="flex flex-col items-center justify-center w-full px-4 gap-8">
            <div className="w-full max-w-5xl pt-12">
                <button 
                    onClick={() => router.back()} 
                    className="text-gray-700 hover:text-black flex items-center gap-2 mb-4"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    <span className="font-medium">ย้อนกลับ</span>
                </button>
            </div>

            <p className="font-bold text-3xl w-full max-w-5xl">ตะกร้าสินค้า</p>

            <div className="flex items-start justify-center gap-12 w-full max-w-5xl">
                {/* Order List Section */}
                <div className="flex flex-col gap-4 w-5/6">
                    {cart.map((item: any) => (
                        <CartList key={item.food.id} item={item} />
                    ))}
                </div>

                {/* Summary Section */}
                <div className="flex flex-col gap-4 w-2/5">
                    <SummaryOrderCard totalPrice={totalPrice} fee={fee} />
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