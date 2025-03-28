'use client';

import { useState } from "react";
import { motion } from "framer-motion";

interface CartList {
    food: Food;
    description: string;
    quantity: number;
}

const FoodDescription = ({ food, onClose }: { food: Food; onClose: () => void }) => {
    const [quantity, setQuantity] = useState(1);

    const increaseQuantity = () => {
        setQuantity(prev => prev + 1);
    };

    const decreaseQuantity = () => {
        setQuantity(prev => prev > 1 ? prev - 1 : 1);
    };

    const formatFoodCategory = (category: string) => {
        switch (category.toUpperCase()) {
            case 'ALL': return 'ทั้งหมด';
            case 'MAIN COURSE': return 'จานหลัก';
            case 'DESSERT': return 'ของหวาน';
            case 'BEVERAGE': return 'เครื่องดื่ม';
            default: return category;
        }
    };

    const addToCart = () => {
        // Add the item to the cart
        const cart = JSON.parse(localStorage.getItem("cart") || "[]") as CartList[];

        const existingItemIndex = cart.findIndex((item) => item.food.id === food.id);

        if (existingItemIndex !== -1) {
            cart[existingItemIndex].quantity += quantity;
        } else {
            cart.push({
                food: food,
                description: "",
                quantity: quantity
            })
        }

        localStorage.setItem("cart", JSON.stringify(cart));
        alert(`เพิ่ม ${food.name} จำนวน ${quantity} ชิ้น ลงตะกร้าสำเร็จ!`);
    };

    return (
        <div className="flex flex-col gap-6 w-full p-10 h-full right-0 sticky shadow-md bg-background">
            <button
                className="absolute top-6 right-10 p-2 rounded-full bg-background text-gray-500 hover:bg-hoverButton hover:text-white transition-all"
                onClick={onClose}
                type="button"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>

            <motion.div
                className="w-full max-w-2xl mx-auto flex flex-col items-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
            >
                <div className="w-full mb-6 flex justify-center">
                    <div className="w-full max-w-xs md:max-w-sm">
                        <img
                            src={`${process.env.NEXT_PUBLIC_S3_URL}/${food.image_url}`}
                            alt={food.name}
                            className="w-full h-auto aspect-square object-cover rounded-lg"
                        />
                    </div>
                </div>

                <motion.h2
                    className="text-2xl font-light mb-4 text-center"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    {food.name}
                </motion.h2>

                <motion.h3
                    className="font-light mb-4 text-center text-secondary"
                    initial={{ opacity: 0, y: 0 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    {formatFoodCategory(food.category)}
                </motion.h3>

                <motion.p
                    className="text-gray-600 text-sm text-center mb-8 px-4 leading-relaxed"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    {food.description}
                </motion.p>

                <motion.div
                    className="w-full max-w-xs mb-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <span className="text-lg font-semibold">฿ {food.price}</span>
                </motion.div>

                <motion.div
                    className="flex items-center justify-between w-full max-w-xs mb-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                >
                    <div className="flex items-center border border-gray-300 rounded-md overflow-hidden">
                        <button
                            className="px-3 py-1 bg-gray-100 hover:bg-gray-200 transition-colors"
                            onClick={decreaseQuantity}
                            type="button"
                        >
                            -
                        </button>
                        <span className="px-4 py-1 text-center min-w-[40px]">{quantity}</span>
                        <button
                            className="px-3 py-1 bg-gray-100 hover:bg-gray-200 transition-colors"
                            onClick={increaseQuantity}
                            type="button"
                        >
                            +
                        </button>
                    </div>

                    <button
                        className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors flex items-center"
                        onClick={addToCart}
                        type="button"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            width="1.5em"
                            height="1.5em"
                            className="mr-2"
                        >
                            <path
                                fill="currentColor"
                                d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2s-.9-2-2-2M1 2v2h2l3.6 7.59l-1.35 2.45c-.16.28-.25.61-.25.96c0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12l.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49A1.003 1.003 0 0 0 20 4H5.21l-.94-2zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2s2-.9 2-2s-.9-2-2-2"
                            ></path>
                        </svg>
                        เพิ่มเข้าตะกร้า
                    </button>
                </motion.div>
            </motion.div>
        </div>
    );
}

export default FoodDescription;