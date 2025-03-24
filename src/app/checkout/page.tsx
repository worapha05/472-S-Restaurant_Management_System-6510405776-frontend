'use client';

import Loading from "@/components/Loading";
import { useSession } from "next-auth/react";
import { redirect, useRouter } from "next/navigation";
import { useState } from "react";

const paymentMethods = [
    { id: 1, name: "เงินสด", value: "CASH" },
    // { id: 2, name: "QR Code", value: "QRCODE" },
];

export default function CheckoutPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [address, setAddress] = useState("");
    const [selectedMethod, setSelectedMethod] = useState(paymentMethods[0]);  // Set a default payment method
    const [useMockAddress, setUseMockAddress] = useState(false);
    const [error, setError] = useState("");

    const mockAddress = "123 ถนนตัวอย่าง ซอยแถวบ้านน้อง แขวงบ้านคนเก่า เขตคนคุยไม่ได้คบ กรุงเทพมหานคร 10230";

    const handleMockAddressToggle = () => {
        setUseMockAddress((prevState) => !prevState);
        setAddress((prevState) => (useMockAddress ? "" : mockAddress));  // Toggle the address
    };

    const handleCreateOrder = async () => {
        if (!address) {
            setError("กรุณากรอกที่อยู่ก่อนดำเนินการสั่งซื้อ");
            return;
        }
        if (!selectedMethod) {
            setError("กรุณาเลือกช่องทางการชำระเงิน");
            return;
        }
        if(session === null){
            setError("กรุณาเข้าสู่ระบบก่อนดำเนินการสั่งซื้อ");
            return;
        }

        setIsLoading(true);
        setError("");

        var orderId = 0;

        try {
            const cartData = localStorage.getItem("cart");
            const cartItems = cartData ? JSON.parse(cartData) : [];
            const sumPrice = cartItems.reduce((total: number, item: any) => {
                return total + item.food.price * item.quantity;
            }, 0);
            const user_id = session.user.id;
            

            const res = await fetch(`http://localhost/api/orders`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    user_id: user_id, // TO DO: Get UID From Token Login User
                    table_id: null, 
                    address: address,
                    type: "DELIVERY",
                    payment_method: selectedMethod.value,
                    sum_price: sumPrice,
                }),
            });

            if (!res.ok) {
                throw new Error("Failed to create order");
            }
            const data = await res.json();
            console.log(data.data.id);
            
            cartItems.forEach((item: any) => {
                fetch(`http://localhost/api/order_lists`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        order_id: data.data.id,
                        food_id: item.food.id,
                        description: item.description,
                        price: item.food.price,
                        quantity: item.quantity
                    }),
                });
            });
            localStorage.removeItem("cart");
            orderId = data.data.id;
            alert("Order created successfully!");    
        } catch (error) {
            console.error("Error creating order:", error);
            alert("Failed to create order. Please try again.");
        } finally {
            setIsLoading(false);
            redirect(`/orders/${orderId}`);
        }
    };

    return (
        <>
            {isLoading && <Loading message="กำลังโหลดข้อมูล..." />}
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

                <p className="font-bold text-3xl w-full max-w-5xl">รูปแบบของการสั่งซื้อ</p>

                <div className="flex items-start justify-center gap-12 w-full max-w-5xl">
                    <div className="flex flex-col gap-4 w-5/6">
                        <input
                            type="text"
                            className="border px-4 py-4 rounded-xl hover:border-primary disabled:bg-gray-200"
                            placeholder="กรอกที่อยู่ ที่ต้องการให้จัดส่ง"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            disabled={useMockAddress}
                        />
                        <div 
                            className={`border px-4 py-4 rounded-xl cursor-pointer hover:border-primary transition-all
                            ${useMockAddress ? "bg-gray-200 border-primary" : ""}`}
                            onClick={handleMockAddressToggle}
                            role="button"
                            tabIndex={0}
                        >
                            <input 
                                type="checkbox" 
                                checked={useMockAddress} 
                                readOnly
                                className="mr-2"
                                aria-checked={useMockAddress}
                            />
                            {mockAddress}
                        </div>
                    </div>

                    <div className="flex flex-col gap-4 w-2/5">
                        <div className="flex flex-col rounded-2xl p-6 w-full shadow-xl gap-4 border-2 border-primary">
                            <p className="font-bold text-2xl">วิธีการชำระเงิน</p>
                            {paymentMethods.map((method) => (
                                <div 
                                    key={method.id}
                                    className={`border px-4 py-4 rounded-xl cursor-pointer hover:border-primary transition-all
                                    ${selectedMethod?.id === method.id ? "bg-gray-200 border-primary" : ""}`}
                                    onClick={() => setSelectedMethod(method)}
                                    role="button"
                                    tabIndex={0}
                                >
                                    <input 
                                        type="radio"
                                        name="paymentMethod"
                                        checked={selectedMethod?.id === method.id} 
                                        readOnly
                                        className="mr-2"
                                        aria-checked={selectedMethod?.id === method.id}
                                    />
                                    {method.name}
                                </div>
                            ))}
                        </div>
                        {error && <p className="text-red-500 text-sm">{error}</p>}
                        <button
                            onClick={handleCreateOrder}
                            className={`
                                flex items-center justify-center p-6 rounded-2xl font-bold transition-all
                                bg-button text-white hover:bg-hoverButton cursor-pointer
                            `}
                        >
                            ดำเนินการต่อ
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}