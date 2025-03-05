'use client';

import { redirect, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import CartList from "@/components/Cart/CartList";
import SummaryOrderCard from "@/components/Order/SummaryOrderCard";
import Loading from "@/components/Loading"; 

interface Food {
    id: number;
    name: string;
    price: number;
    status: "available" | "unavailable";
    category: 'APPETIZER' | 'ENTREE' | 'MAIN COURSE' | 'DESSERT' | 'DRINK';
    description: string;
    image_url: string;
}

interface CartItem {
    food: Food;
    description: string;
    quantity: number;
}

export default function CartPage() {
    const router = useRouter();
    const [cart, setCart] = useState<CartItem[]>([]);
    const [totalPrice, setTotalPrice] = useState(0);
    const [fee, setFee] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState(false);

    // Load cart and calculate totals whenever component mounts or cart updates
    useEffect(() => {
        const loadCart = async () => {
            try {
                setIsLoading(true);
                
                // Simulate network delay (remove in production)
                // await new Promise(resolve => setTimeout(resolve, 500));
                
                const cartData = localStorage.getItem("cart");
                const parsedCart = cartData ? JSON.parse(cartData) : [];
                setCart(parsedCart);
                calculateTotals(parsedCart);
            } catch (error) {
                console.error("Error loading cart from localStorage:", error);
                setCart([]);
            } finally {
                setIsLoading(false);
            }
        };

        // Initial load
        loadCart();

        // Set up event listener for storage changes from other components
        const handleStorageChange = (event: StorageEvent) => {
            if (event.key === "cart") {
                loadCart();
            }
        };

        // Add event listener
        window.addEventListener('storage', handleStorageChange);

        // Remove event listener on cleanup
        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, []);

    // Calculate total price and fee
    const calculateTotals = (cartItems: CartItem[]) => {
        const total = cartItems.reduce(
            (sum, item) => sum + item.food.price * item.quantity,
            0
        );
        
        const serviceFee = 0;
        
        setTotalPrice(total);
        setFee(serviceFee);
    };

    // Handle cart updates from CartList component
    const handleCartUpdate = async () => {
        try {
            setIsUpdating(true);
            
            // Simulate network delay (remove in production)
            // await new Promise(resolve => setTimeout(resolve, 300));
            
            const updatedCart = JSON.parse(localStorage.getItem("cart") || "[]");
            setCart(updatedCart);
            calculateTotals(updatedCart);
        } catch (error) {
            console.error("Error updating cart:", error);
        } finally {
            setIsUpdating(false);
        }
    };

    const handleCheckout = () => {
        redirect("/checkout");
    };

    return (
        <>
            {/* Show loading overlay when initial loading */}
            {isLoading && <Loading message="กำลังโหลดข้อมูล..." />}
            
            {/* Show updating overlay when just updating items */}
            {isUpdating && <Loading message="กำลังอัพเดตตะกร้า..." />}
            
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
                        {cart.length > 0 ? (
                            cart.map((item) => (
                                <CartList 
                                    key={item.food.id} 
                                    item={item} 
                                    onCartUpdate={handleCartUpdate}
                                />
                            ))
                        ) : (
                            <div className="text-center py-8 text-gray-500">
                                {!isLoading && "ไม่มีสินค้าในตะกร้า"}
                            </div>
                        )}
                    </div>

                    {/* Summary Section */}
                    <div className="flex flex-col gap-4 w-2/5">
                        <SummaryOrderCard totalPrice={totalPrice} fee={fee} />
                        <button
                            onClick={handleCheckout}
                            disabled={cart.length === 0 || isLoading || isUpdating}
                            className={`
                                flex items-center justify-center p-6 rounded-2xl font-bold
                                ${cart.length > 0 && !isLoading && !isUpdating
                                    ? "bg-button text-white hover:bg-hoverButton cursor-pointer" 
                                    : "bg-gray-300 text-gray-500 cursor-not-allowed"}
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