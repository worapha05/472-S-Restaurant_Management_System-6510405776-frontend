// src/components/MenuCard/MenuCard.tsx
'use client';

interface Menu {
    id: number;
    name: string;
    price: number;  // Price as a number
    status: "available" | "unavailable";  // Assuming status can only be these two
    category: 'APPETIZER' | 'ENTREE' | 'MAIN COURSE' | 'DESSERT' | 'DRINK';
    description: string;
    image_url: string;
}

interface CartList {
    food: Menu;
    description: string;
    quantity: number;
}

const MenuCard = ({ menu }: {menu : Menu}) => {

    const addToCart = () => {
        // Add the item to the cart

        const cart = JSON.parse(localStorage.getItem("cart") || "[]") as CartList[];

        const existingItemIndex = cart.findIndex((item) => item.food.id === menu.id);

        if (existingItemIndex !== -1) {
            cart[existingItemIndex].quantity += 1;
        } else {
            cart.push({
                food: menu,
                description: "",
                quantity: 1
            })
        }

        localStorage.setItem("cart", JSON.stringify(cart));
        alert(`Added ${menu.name} to cart!`);
    };

    return (
        <div className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <div className="aspect-square relative overflow-hidden">
                <img
                    src={menu.image_url}
                    alt={menu.name}
                    className="object-cover w-full h-full"
                />
                <div className="absolute top-4 left-4">
                    <span className="text-xs tracking-wider text-gray-600">
                        {menu.category}
                    </span>
                </div>
            </div>
            <div className="p-4">
                <h3 className="text-lg font-semibold mb-2">{menu.name}</h3>
                <p className="text-sm text-gray-600 line-clamp-2">
                    {menu.description}
                </p>

                <button className="mt-4 text-sm text-gray-800 hover:text-gray-600 flex items-center">
                    SEE MORE DETAILS
                    <svg
                        className="w-4 h-4 ml-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                        />
                    </svg>
                </button>

                {/* add to cart button on the right, price on the left*/}
                <div className="flex justify-between mt-4">
                    <span className="text-lg font-semibold">฿ {menu.price}</span>
                    <form>
                        <button className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors"
                                onClick={addToCart}>
                            ADD TO CART
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default MenuCard;