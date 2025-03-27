'use client';

import { useState } from "react";

interface CartListProps {
    item: CartItem;
    onCartUpdate: () => void; // Callback to notify parent
}

export default function CartList({ item, onCartUpdate }: CartListProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [quantity, setQuantity] = useState(item.quantity);
    const [description, setDescription] = useState(item.description);

    // Format price safely
    const formatPrice = (price: any): string => {
        const numPrice = typeof price === 'string' ? parseFloat(price) : Number(price);
        return isNaN(numPrice) ? `${price}` : numPrice.toFixed(2);
    };

    // Calculate total price
    const itemPrice = typeof item.food.price === 'string' ? 
        parseFloat(item.food.price) : Number(item.food.price);
    const totalPrice = itemPrice * quantity;

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
        window.dispatchEvent(new Event('storage'));
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

    // Increment and decrement quantity
    const incrementQuantity = () => {
        setQuantity(prev => prev + 1);
    };

    const decrementQuantity = () => {
        if (quantity > 1) {
            setQuantity(prev => prev - 1);
        }
    };

    return (
        <div className="relative bg-background rounded-xl p-5 shadow-md border border-searchBox/20 hover:shadow-lg transition-all duration-200">
            <div className="flex flex-col sm:flex-row gap-4">
                {/* Food Image */}
                <div className="relative">
                    <img 
                        src={`${process.env.NEXT_PUBLIC_S3_URL}/${item.food.image_url}`} 
                        alt={item.food.name} 
                        className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl object-cover bg-primary"
                    />
                    
                    {/* Quantity Badge - only show if quantity > 1 and not editing */}
                    {!isEditing && quantity > 1 && (
                        <div className="absolute -top-2 -right-2 bg-button text-background text-sm font-bold w-7 h-7 rounded-full flex items-center justify-center shadow-md">
                            {quantity}
                        </div>
                    )}
                </div>

                {/* Content Section */}
                <div className="flex-1">
                    <div className="flex flex-col sm:flex-row justify-between">
                        {/* Food Details */}
                        <div className="flex-1 pr-4">
                            <h3 className="font-bold text-xl text-mainText">{item.food.name}</h3>
                            
                            {/* Description field */}
                            <div className="mt-2 flex items-center gap-2">
                                <span className="text-secondText text-sm">เพิ่มเติม:</span>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        className="border border-searchBox px-2 py-1 rounded-md text-sm flex-1 max-w-xs focus:border-inputFieldFocus focus:ring-1 focus:ring-inputFieldFocus outline-none"
                                        placeholder="เพิ่มหมายเหตุ..."
                                    />
                                ) : (
                                    <p className="text-primary text-sm line-clamp-1">{description || "ไม่มี"}</p>
                                )}
                            </div>
                        </div>

                        {/* Price Section */}
                        <div className="mt-2 sm:mt-0 flex flex-col items-end">
                            {quantity > 1 ? (
                                <>
                                    <p className="font-bold text-mainText">${formatPrice(totalPrice)}</p>
                                    <p className="text-secondText text-sm">${formatPrice(item.food.price)} × {quantity}</p>
                                </>
                            ) : (
                                <p className="font-bold text-mainText">${formatPrice(item.food.price)}</p>
                            )}
                        </div>
                    </div>

                    {/* Controls Section */}
                    <div className="flex justify-between items-center mt-4">
                        {/* Quantity controls */}
                        {isEditing ? (
                            <div className="flex items-center gap-2">
                                <button 
                                    onClick={decrementQuantity}
                                    className="w-8 h-8 rounded-full bg-searchBox flex items-center justify-center hover:bg-searchBox/80 transition-colors"
                                    disabled={quantity <= 1}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                                    </svg>
                                </button>
                                
                                <input
                                    type="number"
                                    value={quantity}
                                    onChange={handleQuantityChange}
                                    min="1"
                                    className="w-14 h-10 border border-searchBox rounded-lg text-center focus:border-inputFieldFocus focus:ring-1 focus:ring-inputFieldFocus outline-none"
                                />
                                
                                <button 
                                    onClick={incrementQuantity}
                                    className="w-8 h-8 rounded-full bg-searchBox flex items-center justify-center hover:bg-searchBox/80 transition-colors"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                </button>
                            </div>
                        ) : (
                            <div className="text-secondText flex items-center">
                                <span className="text-sm">จำนวน: </span>
                                <span className="ml-1 font-medium">{quantity}</span>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2">
                            {/* Edit/Save Button */}
                            <button 
                                onClick={handleEditToggle} 
                                className={`rounded-full w-10 h-10 flex items-center justify-center transition-all duration-200 ${
                                    isEditing 
                                    ? 'bg-acceptGreen/10 text-acceptGreen hover:bg-acceptGreen hover:text-background' 
                                    : 'bg-primary/10 text-primary hover:bg-primary/20'
                                }`}
                                aria-label={isEditing ? "Save changes" : "Edit item"}
                            >
                                {isEditing ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                    </svg>
                                )}
                            </button>

                            {/* Delete Button */}
                            <button 
                                onClick={() => deleteItem(item.food.id)}
                                className="rounded-full w-10 h-10 flex items-center justify-center bg-cancelRed/10 text-cancelRed hover:bg-cancelRed hover:text-background transition-all duration-200"
                                aria-label="Remove item"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}