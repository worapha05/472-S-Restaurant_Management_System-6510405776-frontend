// app/menu/page.tsx
import Navbar from "@/components/Navbar/Navbar";
import MenuCard from "@/components/Menu/MenuCard";
import Link from "next/link";

async function getData() {
    const res = await fetch("http://omnidine-backend-laravel.test-1/api/foods");

    if (!res.ok) {
        throw new Error('Failed to fetch data');
    }

    const resJson = await res.json();
    console.log("Fetched Data:", resJson);
    return resJson.data || [];
}

export default async function MenuPage() {
    const menuItems = await getData();

    return (
        <>
            <Navbar />
            <div className="flex flex-col items-center justify-center w-full px-4">
                <div className="flex items-center justify-between w-full max-w-5xl">
                    <p className="font-bold text-3xl w-full max-w-5xl py-12">รายการอาหาร</p>

                    <Link 
                        href="/cart" 
                        className="flex items-center justify-center p-2 rounded-xl bg-primary hover:bg-primary-dark transition-colors"
                    >
                        <p className="font-bold text-white w-full text-center no-wrap">ตะกร้าสินค้า</p>
                    </Link>
                </div>

                {/* Category Navigation */}
                <div className="w-full max-w-5xl mb-8">
                    <nav className="flex gap-8 border-b border-gray-200">
                        {['APPETIZER', 'ENTREE', 'MAIN COURSE', 'DESSERT', 'DRINKS'].map((category) => (
                            <button
                                key={category}
                                className="pb-4 text-sm text-gray-600 hover:text-gray-900 border-b-2 border-transparent hover:border-black transition-colors"
                            >
                                {category}
                            </button>
                        ))}
                    </nav>
                </div>

                {/* Menu Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-5xl">
                    {menuItems.map((menu: any) => (
                        <MenuCard
                            menu={menu}
                        />
                    ))}
                </div>
            </div>
        </>
    );
}