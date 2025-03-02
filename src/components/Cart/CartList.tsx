'use client';

import { useState } from "react";

interface Food {
    id: number;
    name: string;
    price: number;
    status: "available" | "unavailable";
    category: 'APPETIZER' | 'ENTREE' | 'MAIN COURSE' | 'DESSERT' | 'DRINK';
    description: string;
    image_url: string;
}

interface CartList {
    food: Food;
    description: string;
    quantity: number;
}

export default function OrderListCard({ item }: { item: CartList }) {
    const [isEditing, setIsEditing] = useState(false);
    const [quantity, setQuantity] = useState(item.quantity);
    const [description, setDescription] = useState(item.description);

    // Function to update cart in localStorage
    const updateCart = (id: number, newQuantity: number, newDescription: string) => {
        const cart = JSON.parse(localStorage.getItem("cart") || "[]") as CartList[];

        const updatedCart = cart.map((cartItem) =>
            cartItem.food.id === id
                ? { ...cartItem, quantity: newQuantity, description: newDescription }
                : cartItem
        );

        localStorage.setItem("cart", JSON.stringify(updatedCart));
    };

    // Toggle Edit Mode
    const handleEditToggle = () => {
        if (isEditing) {
            updateCart(item.food.id, quantity, description);
        }
        setIsEditing(!isEditing);
    };

    return (
        <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow-md">

            <div className="flex items-center gap-4">
                <img src={item.food.image_url} alt={item.food.name} className="w-16 h-16 rounded-lg object-cover" />

                <div>
                    <p className="font-bold text-lg">{item.food.name}</p>
                    
                    {!isEditing ? (
                        <p className="text-gray-600 text-sm">"{description}"</p>
                    ) : (
                        <input
                            type="text"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="border px-2 py-1 rounded-md text-sm w-full"
                            placeholder="Add a note..."
                        />
                    )}
                </div>
            </div>

            <div className="flex items-center gap-4">
                {!isEditing ? (
                    <p className="text-lg font-semibold">x {quantity}</p>
                ) : (
                    <input
                        type="number"
                        value={quantity}
                        onChange={(e) => setQuantity(Number(e.target.value))}
                        min="1"
                        className="border px-2 py-1 rounded-md text-sm w-16 text-center"
                    />
                )}

                <button onClick={handleEditToggle} className="text-gray-600 hover:text-black">
                    {isEditing ? (
                        <svg className="w-6 h-6 text-acceptGreen dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 11.917 9.724 16.5 19 7.5"/>
                        </svg>
                    ) : (
                        <svg className="w-6 h-6 text-primary dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.779 17.779 4.36 19.918 6.5 13.5m4.279 4.279 8.364-8.643a3.027 3.027 0 0 0-2.14-5.165 3.03 3.03 0 0 0-2.14.886L6.5 13.5m4.279 4.279L6.499 13.5m2.14 2.14 6.213-6.504M12.75 7.04 17 11.28"/>
                        </svg>
                    )}
                </button>
            </div>

        </div>
    );
}