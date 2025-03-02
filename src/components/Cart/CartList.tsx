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

interface CartItem {
    food: Food;
    description: string;
    quantity: number;
}

interface CartListProps {
    item: CartItem;
    onCartUpdate: () => void; // Callback to notify parent
}

export default function CartList({ item, onCartUpdate }: CartListProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [quantity, setQuantity] = useState(item.quantity);
    const [description, setDescription] = useState(item.description);

    // Function to update cart in localStorage
    const updateCart = (id: number, newQuantity: number, newDescription: string) => {
        const cart = JSON.parse(localStorage.getItem("cart") || "[]") as CartItem[];

        const updatedCart = cart.map((cartItem) =>
            cartItem.food.id === id
                ? { ...cartItem, quantity: newQuantity, description: newDescription }
                : cartItem
        );

        localStorage.setItem("cart", JSON.stringify(updatedCart));
        
        // Dispatch storage event for cross-tab synchronization
        window.dispatchEvent(new Event('storage'));
        
        // Notify parent component about the update
        onCartUpdate();
    };

    // Function to delete cart item
    const deleteItem = (id: number) => {
        const cart = JSON.parse(localStorage.getItem("cart") || "[]") as CartItem[];

        const updatedCart = cart.filter((cartItem) => cartItem.food.id !== id);

        localStorage.setItem("cart", JSON.stringify(updatedCart));

        // Dispatch storage event for cross-tab synchronization
        window.dispatchEvent(new Event('storage'));

        // Notify parent component about the update
        onCartUpdate();
    };

    // Toggle Edit Mode
    const handleEditToggle = () => {
        if (isEditing) {
            // Only update if quantity is valid
            if (quantity > 0) {
                updateCart(item.food.id, quantity, description);
            } else {
                // Reset to previous value if invalid
                setQuantity(item.quantity);
            }
        }
        setIsEditing(!isEditing);
    };

    // Handle quantity changes
    const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseInt(e.target.value);
        if (!isNaN(value) && value > 0) {
            setQuantity(value);
        }
    };

    return (
        <div className="grid grid-cols-[auto_1fr_auto_auto_auto] items-center rounded-xl p-4 w-full shadow-xl gap-6">
            {/* Food Image */}
            <img src={item.food.image_url} alt={item.food.name} className="w-24 h-24 rounded-lg object-cover bg-primary" />

            {/* Food Details */}
            <div className="flex flex-col gap-2 w-full">
                <p className="font-bold text-xl">{item.food.name}</p>
                <div className="flex items-center gap-2 text-sm">
                    <p className="text-secondary">เพิ่มเติม:</p>
                    {!isEditing ? (
                        <p className="truncate w-40">{description || "ไม่มี"}</p>
                    ) : (
                        <input
                            type="text"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="border px-2 py-1 rounded-md text-sm w-40"
                            placeholder="เพิ่มหมายเหตุ..."
                        />
                    )}
                </div>
            </div>

            <div className="flex flex-col items-end justify-end">
                <p>${item.food.price}</p>
            </div>

            {/* Quantity Section */}
            <div className="flex flex-col items-center gap-2">
                <p className="text-gray-500 text-sm">จำนวน</p>
                {!isEditing ? (
                    <p className="text-lg font-semibold">x {quantity}</p>
                ) : (
                    <input
                        type="number"
                        value={quantity}
                        onChange={handleQuantityChange}
                        min="1"
                        className="w-14 h-10 p-2 border-2 rounded-lg border-primary text-center"
                    />
                )}
            </div>

            {/* Edit and Delete Buttons */}
            <div className="flex gap-2">
                {/* Edit Button */}
                <button 
                    onClick={handleEditToggle} 
                    className="p-2 rounded-full transition-all duration-200 ease-in-out hover:scale-110"
                >
                    {isEditing ? (
                        <svg 
                            className="w-8 h-8 text-acceptGreen dark:text-white hover:bg-acceptGreen hover:text-white p-1 rounded-full" 
                            aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24"
                        >
                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 11.917 9.724 16.5 19 7.5"/>
                        </svg>
                    ) : (
                        <svg 
                            className="w-8 h-8 text-primary dark:text-white hover:bg-primary hover:text-white p-1 rounded-full" 
                            aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24"
                        >
                            <path fillRule="evenodd" d="M14 4.182A4.136 4.136 0 0 1 16.9 3c1.087 0 2.13.425 2.899 1.182A4.01 4.01 0 0 1 21 7.037c0 1.068-.43 2.092-1.194 2.849L18.5 11.214l-5.8-5.71 1.287-1.31.012-.012Zm-2.717 2.763L6.186 12.13l2.175 2.141 5.063-5.218-2.141-2.108Zm-6.25 6.886-1.98 5.849a.992.992 0 0 0 .245 1.026 1.03 1.03 0 0 0 1.043.242L10.282 19l-5.25-5.168Zm6.954 4.01 5.096-5.186-2.218-2.183-5.063 5.218 2.185 2.15Z" clipRule="evenodd"/>
                        </svg>
                    )}
                </button>

                {/* Delete Button */}
                <button
                    onClick={() => deleteItem(item.food.id)}
                    className="p-2 rounded-full transition-all duration-200 ease-in-out hover:scale-110 text-red-500"
                >
                    <svg
                        className="w-8 h-8 hover:bg-red-500 hover:text-white p-1 rounded-full"
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        fill="none"
                        viewBox="0 0 24 24"
                    >
                        <path
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M6 18L18 6M6 6l12 12"
                        />
                    </svg>
                </button>
            </div>
        </div>
    );
}