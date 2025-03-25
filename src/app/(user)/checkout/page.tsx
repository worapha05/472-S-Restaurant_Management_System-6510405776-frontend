'use client';

import Loading from "@/components/Loading";
import { useSession } from "next-auth/react";
import { redirect, useRouter } from "next/navigation";
import { useState, useEffect } from "react";

const paymentMethods = [
    { id: 1, name: "เงินสด", value: "CASH" },
    // { id: 2, name: "QR Code", value: "QRCODE" },
];

const orderTypes = [
    { id: 1, name: "จัดส่ง", value: "DELIVERY" },
    { id: 2, name: "รับที่ร้าน", value: "PICKUP" },
];

export default function CheckoutPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [address, setAddress] = useState("");
    const [selectedMethod, setSelectedMethod] = useState(paymentMethods[0]);
    const [selectedOrderType, setSelectedOrderType] = useState(orderTypes[0]);
    const [useMockAddress, setUseMockAddress] = useState(false);
    const [error, setError] = useState("");
    const [mockAddress, setMockAddress] = useState("");

    // Check for session and redirect if not authenticated
    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login');
        }
    }, [status, router]);

    // Set mockAddress when session is loaded
    useEffect(() => {
        if (session && session.user && session.user.address) {
            setMockAddress(session.user.address);
        }
    }, [session]);

    const handleMockAddressToggle = () => {
        const newUseMockAddress = !useMockAddress;
        setUseMockAddress(newUseMockAddress);
        
        // Update address based on toggle state
        if (newUseMockAddress) {
            setAddress(mockAddress || "");
        } else {
            setAddress("");
        }
    };

    const handleOrderTypeChange = (orderType : any) => {
        setSelectedOrderType(orderType);
        
        // Clear address if changing to pickup
        if (orderType.value === "PICKUP") {
            setAddress("");
            setUseMockAddress(false);
        }
    };

    const handleCreateOrder = async () => {
        // Validate address for delivery orders
        if (selectedOrderType.value === "DELIVERY" && !address) {
            setError("กรุณากรอกที่อยู่ก่อนดำเนินการสั่งซื้อ");
            return;
        }
        
        if (!selectedMethod) {
            setError("กรุณาเลือกช่องทางการชำระเงิน");
            return;
        }
        
        if(session === null){
            setError("กรุณาเข้าสู่ระบบก่อนดำเนินการสั่งซื้อ");
            router.push('/login');
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
            
            // For pickup orders, set address to null or a placeholder
            const orderAddress = selectedOrderType.value === "PICKUP" ? null : address;

            const res = await fetch(`${process.env.NEXT_PUBLIC_CLIENT_API_URL}/api/orders`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    user_id: user_id,
                    table_id: null, 
                    address: orderAddress,
                    type: selectedOrderType.value,
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
                fetch(`${process.env.NEXT_PUBLIC_CLIENT_API_URL}/api/order_lists`, {
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

    // Show loading state while checking session
    if (status === 'loading') {
        return <Loading message="กำลังตรวจสอบข้อมูลผู้ใช้..." />;
    }

    // If user is not authenticated, this will be rendered briefly before redirect
    if (status === 'unauthenticated') {
        return <Loading message="กำลังเปลี่ยนเส้นทางไปยังหน้าเข้าสู่ระบบ..." />;
    }

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
                    {/* Left Side - Order Type */}
                    <div className="flex flex-col gap-4 w-4/5">
                        <div className="flex flex-col rounded-2xl p-6 w-full shadow-xl gap-4 border-2 border-primary">
                            <p className="font-bold text-2xl mb-2">รูปแบบการรับสินค้า</p>
                            
                            {/* Order type selection */}
                            {orderTypes.map((orderType) => (
                                <div 
                                    key={orderType.id}
                                    className={`border px-4 py-4 rounded-xl cursor-pointer hover:border-primary transition-all
                                    ${selectedOrderType?.id === orderType.id ? "bg-gray-200 border-primary" : ""}`}
                                    onClick={() => handleOrderTypeChange(orderType)}
                                    role="button"
                                    tabIndex={0}
                                >
                                    <input 
                                        type="radio"
                                        name="orderType"
                                        checked={selectedOrderType?.id === orderType.id} 
                                        readOnly
                                        className="mr-2"
                                        aria-checked={selectedOrderType?.id === orderType.id}
                                    />
                                    {orderType.name}
                                </div>
                            ))}
                        </div>
                        
                        {/* Conditional content based on order type */}
                        <div className="mt-4">
                            {selectedOrderType.value === "DELIVERY" && (
                                <div className="flex flex-col gap-4">
                                    <p className="font-bold text-xl">ที่อยู่จัดส่ง</p>
                                    <input
                                        type="text"
                                        className="border px-4 py-4 rounded-xl hover:border-primary disabled:bg-gray-200"
                                        placeholder="กรอกที่อยู่ ที่ต้องการให้จัดส่ง"
                                        value={address}
                                        onChange={(e) => setAddress(e.target.value)}
                                        disabled={useMockAddress}
                                    />
                                    {mockAddress && (
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
                                    )}
                                </div>
                            )}
                            
                            {selectedOrderType.value === "PICKUP" && (
                                <div className="border px-4 py-6 rounded-xl bg-gray-100">
                                    <p className="font-medium text-lg mb-2">รายละเอียดการรับอาหาร:</p>
                                    <p className="mt-2">- กรุณามารับอาหารที่ร้านภายใน 30 นาทีหลังได้รับการยืนยัน</p>
                                    <p className="mt-1">- แสดงหมายเลขคำสั่งซื้อเพื่อรับอาหาร</p>
                                    <p className="mt-1">- สามารถติดต่อร้านได้ที่เบอร์ 696-969-6969</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Side - Payment */}
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