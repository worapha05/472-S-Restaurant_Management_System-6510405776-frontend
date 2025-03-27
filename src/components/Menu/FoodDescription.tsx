'use client';

import { useState } from "react";
interface CartList {
    food: Food;
    description: string;
    quantity: number;
}

const FoodDescription = ({ food }: { food: Food }) => {
    const [quantity, setQuantity] = useState(1);
    
    const increaseQuantity = () => {
        setQuantity(prev => prev + 1);
    };
    
    const decreaseQuantity = () => {
        setQuantity(prev => prev > 1 ? prev - 1 : 1);
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
        alert(`Added ${quantity} ${food.name} to cart!`);
    };

    return (
        <div className="flex flex-col w-full p-6 md:p-8 h-full bg-background">
            <div className="w-full max-w-2xl mx-auto flex flex-col items-center">
                {/* image - more constrained size */}
                <div className="w-full mb-6 flex justify-center">
                    <div className="w-full max-w-xs md:max-w-sm">
                        <img
                            src={food.image_url}
                            alt={food.name}
                            className="w-full h-auto aspect-square object-cover rounded-lg"
                        />
                    </div>
                </div>

                {/* title */}
                <h2 className="text-2xl font-light mb-4 text-center">{food.name}</h2>

                {/* description */}
                <p className="text-gray-600 text-sm text-center mb-8 px-4 leading-relaxed">
                    {food.description}
                </p>

                {/* price */}
                <div className="w-full max-w-xs mb-4">
                    <span className="text-lg font-semibold">฿ {food.price}</span>
                </div>
                
                {/* quantity selector and add to cart */}
                <div className="flex items-center justify-between w-full max-w-xs mb-6">
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
                        Add to Cart
                    </button>
                </div>
            </div>
        </div>
    );
}

export default FoodDescription;