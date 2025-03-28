// src/components/MenuCard/MenuCard.tsx
'use client';

interface CartList {
    food: Food;
    description: string;
    quantity: number;
}

const MenuCard = ({ menu, onSelectFood }: { menu: Food, onSelectFood: () => void }) => {

    const addToCart = (e: React.MouseEvent) => {
        // Prevent default form submission
        e.preventDefault();

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
        alert(`เพิ่ม ${menu.name} จำนวน 1 ชิ้น ลงตะกร้าสำเร็จ!`);
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

    return (
        <div className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <div className="aspect-square relative overflow-hidden">
                <img
                    src={`${process.env.NEXT_PUBLIC_S3_URL}/${menu.image_url}`}
                    alt={menu.name}
                    className="object-cover w-full h-full"
                />
                <div className="absolute top-4 left-4">
                    <span className="text-xs tracking-wider text-gray-600 rounded-xl bg-white p-2 opacity-80">
                        {formatFoodCategory(menu.category)}
                    </span>
                </div>
                
            </div>
            <div className="p-4">
                <h3 className="text-lg font-semibold mb-2">{menu.name}</h3>

                <button
                    className="mt-4 text-sm text-gray-800 hover:text-gray-600 flex items-center"
                    onClick={onSelectFood}
                    type="button"
                >
                    ดูรายละเอียด
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
                <div className="flex items-center justify-between mt-4">
                    <span className="text-lg font-semibold">฿ {menu.price}</span>
                    <button
                        className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors"
                        onClick={addToCart}
                        type="button"
                    >
                        เพิ่มเข้าตะกร้า
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MenuCard;