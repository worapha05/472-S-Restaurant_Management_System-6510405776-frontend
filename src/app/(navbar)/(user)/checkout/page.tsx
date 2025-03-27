'use client';

import Loading from "@/components/Loading";
import { useSession } from "next-auth/react";
import { redirect, useRouter } from "next/navigation";
import { useState, useEffect, JSX } from "react";

// Type definitions
interface PaymentMethod {
    id: number;
    name: string;
    value: string;
}

interface OrderType {
    id: number;
    name: string;
    value: 'DELIVERY' | 'TAKEAWAY' | 'DINE_IN';
}

const paymentMethods: PaymentMethod[] = [
    { id: 1, name: "เงินสด", value: "CASH" },
    // { id: 2, name: "QR Code", value: "QRCODE" },
];

// Modified order types based on user role
const userOrderTypes: OrderType[] = [
    { id: 1, name: "จัดส่ง", value: "DELIVERY" },
    { id: 2, name: "รับที่ร้าน", value: "TAKEAWAY" },
];

const staffOrderTypes: OrderType[] = [
    { id: 3, name: "กินที่ร้าน", value: "DINE_IN" }
];

export default function CheckoutPage(): JSX.Element {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [address, setAddress] = useState<string>("");
    const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>(paymentMethods[0]);
    const [selectedOrderType, setSelectedOrderType] = useState<OrderType | null>(null);
    const [orderTypes, setOrderTypes] = useState<OrderType[]>([]);
    const [useMockAddress, setUseMockAddress] = useState<boolean>(false);
    const [error, setError] = useState<string>("");
    const [mockAddress, setMockAddress] = useState<string>("");
    const [tables, setTables] = useState<Table[]>([]);
    const [selectedTable, setSelectedTable] = useState<Table | null>(null);
    const [isStaff, setIsStaff] = useState<boolean>(false);

    // Check for session and redirect if not authenticated
    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login');
        }
    }, [status, router]);

    // Set user role, order types, and default selection when session is loaded
    useEffect(() => {
        if (session && session.user) {
            // Check if user is staff
            const userIsStaff = session.user.role === 'STAFF' || session.user.role === 'ADMIN';
            setIsStaff(userIsStaff);
            
            // Set available order types based on role
            const availableOrderTypes = userIsStaff ? staffOrderTypes : userOrderTypes;
            setOrderTypes(availableOrderTypes);
            
            // Set default selected order type
            setSelectedOrderType(availableOrderTypes[0]);
            
            // Set mock address for regular users
            if (!userIsStaff && session.user.address) {
                setMockAddress(session.user.address);
            }
            
            // Fetch tables for staff users
            if (userIsStaff) {
                fetchTables();
            }
        }
    }, [session]);

    // Fetch available tables
    const fetchTables = async (): Promise<void> => {
        try {
            setIsLoading(true);
            const res = await fetch(`${process.env.NEXT_PUBLIC_CLIENT_API_URL}/api/tables`, {
                headers: {
                    'Authorization': `Bearer ${session?.user?.accessToken}`,
                }
            });
            if (!res.ok) {
                throw new Error("Failed to fetch tables");
            }
            const data = await res.json();
            // Filter only available tables
            const availableTables = data.data.filter((table: Table) => table.status === 'AVAILABLE');
            setTables(availableTables);
            if (availableTables.length > 0) {
                setSelectedTable(availableTables[0]);
            }
        } catch (error) {
            console.error("Error fetching tables:", error);
            setError("ไม่สามารถดึงข้อมูลโต๊ะได้");
        } finally {
            setIsLoading(false);
        }
    };

    const handleMockAddressToggle = (): void => {
        const newUseMockAddress = !useMockAddress;
        setUseMockAddress(newUseMockAddress);
        
        // Update address based on toggle state
        if (newUseMockAddress) {
            setAddress(mockAddress || "");
        } else {
            setAddress("");
        }
    };

    const handleOrderTypeChange = (orderType: OrderType): void => {
        setSelectedOrderType(orderType);
        
        // Clear address if changing to pickup
        if (orderType.value === "PICKUP") {
            setAddress("");
            setUseMockAddress(false);
        }
    };

    const handleTableSelection = (table: Table): void => {
        setSelectedTable(table);
    };

    const handleCreateOrder = async (): Promise<void> => {
        // Validate based on order type
        if (selectedOrderType?.value === "DELIVERY" && !address) {
            setError("กรุณากรอกที่อยู่ก่อนดำเนินการสั่งซื้อ");
            return;
        }
        
        if (selectedOrderType?.value === "DINE_IN" && !selectedTable) {
            setError("กรุณาเลือกโต๊ะก่อนดำเนินการสั่งซื้อ");
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

        let orderId = 0;

        try {
            const cartData = localStorage.getItem("cart");
            const cartItems: CartItem[] = cartData ? JSON.parse(cartData) : [];
            const sumPrice = cartItems.reduce((total: number, item: CartItem) => {
                return total + item.food.price * item.quantity;
            }, 0);

            let user_id: string | null;

            if (session.user.role === 'STAFF' || session.user.role === 'ADMIN') {
                user_id = null;
            } else {
                user_id = session.user.id;
            }
            
            // Set address based on order type
            let orderAddress: string | null = null;
            if (selectedOrderType?.value === "DELIVERY") {
                orderAddress = address;
            }

            // Set table_id based on order type
            const tableId = selectedOrderType?.value === "DINE_IN" ? selectedTable?.id : null;

            console.log("req", JSON.stringify({
                user_id: user_id,
                table_id: tableId, 
                address: orderAddress,
                type: selectedOrderType?.value,
                payment_method: selectedMethod.value,
                sum_price: sumPrice,
            }),);
            

            const res = await fetch(`${process.env.NEXT_PUBLIC_CLIENT_API_URL}/api/orders`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    'Authorization': `Bearer ${session?.user?.accessToken}`,
                },
                body: JSON.stringify({
                    user_id: user_id,
                    table_id: tableId, 
                    address: orderAddress,
                    type: selectedOrderType?.value,
                    payment_method: selectedMethod.value,
                    sum_price: sumPrice,
                }),
            });

            if (!res.ok) {
                throw new Error("Failed to create order");
            }
            const data = await res.json();
            console.log(data.data.id);
            
            // Create order list items
            for (const item of cartItems) {
                await fetch(`${process.env.NEXT_PUBLIC_CLIENT_API_URL}/api/order_lists`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        'Authorization': `Bearer ${session?.user?.accessToken}`,
                    },
                    body: JSON.stringify({
                        order_id: data.data.id,
                        food_id: item.food.id,
                        description: item.description || "",
                        price: item.food.price,
                        quantity: item.quantity
                    }),
                });
            }
            
            localStorage.removeItem("cart");
            orderId = data.data.id;
            
            if (session.user.role === 'STAFF' || session.user.role === 'ADMIN') {
                const getFormattedDate = () => {
                    const now = new Date();
                    return now.getFullYear() + '-' + 
                        String(now.getMonth() + 1).padStart(2, '0') + '-' + 
                        String(now.getDate()).padStart(2, '0') + ' ' + 
                        String(now.getHours()).padStart(2, '0') + ':' + 
                        String(now.getMinutes()).padStart(2, '0') + ':' + 
                        String(now.getSeconds()).padStart(2, '0');
                };
    
                const res2 = await fetch(`${process.env.NEXT_PUBLIC_CLIENT_API_URL}/api/orders/${orderId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${session.user.accessToken}`,
                    },
                    body: JSON.stringify({
                        status: 'IN_PROGRESS',
                        accept: getFormattedDate()
                    }),
                });
    
                if (!res2.ok) {
                    const errorData = await res2.json().catch(() => null);
                    console.error('API error response:', errorData);
                    throw new Error(errorData?.message);
                }
            }

            alert("ทำการสร้างคำสั่งซื้อสําเร็จ");    
        } catch (error) {
            console.error("Error creating order:", error);
            alert("ทำการสร้างคำสั่งซื้อไม่สําเร็จ กรุณาลองใหม่อีกครั้ง");
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
                            {selectedOrderType?.value === "DELIVERY" && (
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
                            
                            {selectedOrderType?.value === "PICKUP" && (
                                <div className="border px-4 py-6 rounded-xl bg-gray-100">
                                    <p className="font-medium text-lg mb-2">รายละเอียดการรับอาหาร:</p>
                                    <p className="mt-2">- กรุณามารับอาหารที่ร้านภายใน 30 นาทีหลังได้รับการยืนยัน</p>
                                    <p className="mt-1">- แสดงหมายเลขคำสั่งซื้อเพื่อรับอาหาร</p>
                                    <p className="mt-1">- สามารถติดต่อร้านได้ที่เบอร์ 696-969-6969</p>
                                </div>
                            )}
                            
                            {selectedOrderType?.value === "DINE_IN" && (
                                <div className="flex flex-col gap-4">
                                    <p className="font-bold text-xl">เลือกโต๊ะ</p>
                                    
                                    {tables.length === 0 ? (
                                        <div className="border px-4 py-6 rounded-xl bg-gray-100">
                                            <p className="text-center text-gray-500">ไม่มีโต๊ะว่าง</p>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-3 gap-4">
                                            {tables.map((table) => (
                                                <div 
                                                    key={table.id}
                                                    className={`border px-4 py-4 rounded-xl cursor-pointer hover:border-primary transition-all
                                                    ${selectedTable?.id === table.id ? "bg-gray-200 border-primary" : ""}`}
                                                    onClick={() => handleTableSelection(table)}
                                                    role="button"
                                                    tabIndex={0}
                                                >
                                                    <input 
                                                        type="radio"
                                                        name="tableSelection"
                                                        checked={selectedTable?.id === table.id} 
                                                        readOnly
                                                        className="mr-2"
                                                        aria-checked={selectedTable?.id === table.id}
                                                    />
                                                    โต๊ะที่ {table.id}
                                                </div>
                                            ))}
                                        </div>
                                    )}
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
                            disabled={
                                (selectedOrderType?.value === "DINE_IN" && tables.length === 0) ||
                                isLoading
                            }
                            className={`
                                flex items-center justify-center p-6 rounded-2xl font-bold transition-all
                                ${(selectedOrderType?.value === "DINE_IN" && tables.length === 0) || isLoading
                                    ? "bg-gray-400 cursor-not-allowed"
                                    : "bg-button text-white hover:bg-hoverButton cursor-pointer"
                                }
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