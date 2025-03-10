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
                        <svg className="w-8 h-8 text-white dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                            <path fillRule="evenodd" d="M4 4a1 1 0 0 1 1-1h1.5a1 1 0 0 1 .979.796L7.939 6H19a1 1 0 0 1 .979 1.204l-1.25 6a1 1 0 0 1-.979.796H9.605l.208 1H17a3 3 0 1 1-2.83 2h-2.34a3 3 0 1 1-4.009-1.76L5.686 5H5a1 1 0 0 1-1-1Z" clipRule="evenodd"/>
                        </svg>
                        <p className="font-bold text-white w-full text-center no-wrap">ตะกร้า</p>

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