'use client';

interface Food {
    id: number;
    name: string;
    price: number;
    status: "AVAILABLE" | "UNAVAILABLE";
    category: 'APPETIZER' | 'ENTREE' | 'MAIN COURSE' | 'DESSERT' | 'DRINK';
    description: string;
    image_url: string;
}

interface CartList {
    food: Food;
    description: string;
    quantity: number;
}

const FoodDescription = ({ food }: { food: Food }) => {
    const addToCart = () => {
        // Add the item to the cart

        const cart = JSON.parse(localStorage.getItem("cart") || "[]") as CartList[];

        const existingItemIndex = cart.findIndex((item) => item.food.id === food.id);

        if (existingItemIndex !== -1) {
            cart[existingItemIndex].quantity += 1;
        } else {
            cart.push({
                food: food,
                description: "",
                quantity: 1
            })
        }

        localStorage.setItem("cart", JSON.stringify(cart));
        alert(`Added ${food.name} to cart!`);
    };

    return (
        <div className="flex flex-col gap-6 w-3/6 p-10 h-full right-0 sticky bg-red-950">
            {/* close button */}
            <button className="absolute top-6 right-24 text-gray-500 hover:text-gray-700">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>

            <div className="w-full max-w-md flex flex-col items-center mt-10">
                {/* image */}
                <div className="w-full mb-6">
                    <img
                        src={food.image_url}
                        alt={food.name}
                        className="w-full h-auto object-cover"
                    />
                </div>

                {/* title */}
                <h2 className="text-2xl font-light mb-4 text-center">{food.name}</h2>

                {/* description */}
                <p className="text-gray-600 text-sm text-center mb-8 px-4 leading-relaxed">
                    {food.description}
                </p>

                {/* buttons */}
                <div className="flex items-center justify-between w-full">
                    <span className="text-lg font-semibold">฿ {food.price}</span>
                    <form>
                        <button
                            className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors"
                            onClick={addToCart}
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                width="1.8em"
                                height="1.8em"
                            >
                                <path
                                    fill="currentColor"
                                    d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2s-.9-2-2-2M1 2v2h2l3.6 7.59l-1.35 2.45c-.16.28-.25.61-.25.96c0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12l.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49A1.003 1.003 0 0 0 20 4H5.21l-.94-2zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2s2-.9 2-2s-.9-2-2-2"
                                ></path>
                            </svg>
                        </button>
                    </form>
                </div>

            </div>
        </div>
    );
}

export default FoodDescription;