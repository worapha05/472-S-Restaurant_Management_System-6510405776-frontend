// src/components/MenuCard/MenuCard.tsx
'use client';

interface MenuItemProps {
    title: string;
    description: string;
    imageUrl: string;
    category: 'APPETIZER' | 'ENTREE' | 'MAIN COURSE' | 'DESSERT' | 'DRINK';
    price: number;
}

const MenuCard = ({ title, description, imageUrl, category, price }: MenuItemProps) => {
    return (
        <div className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <div className="aspect-square relative overflow-hidden">
                <img
                    src={imageUrl}
                    alt={title}
                    className="object-cover w-full h-full"
                />
                <div className="absolute top-4 left-4">
                    <span className="text-xs tracking-wider text-gray-600">
                        {category}
                    </span>
                </div>
            </div>
            <div className="p-4">
                <h3 className="text-lg font-semibold mb-2">{title}</h3>
                <p className="text-sm text-gray-600 line-clamp-2">
                    {description}
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
                    <span className="text-lg font-semibold">฿ {price}</span>
                    <button className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors">
                        ADD TO CART
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MenuCard;