'use client';

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar/Navbar";
import MenuCard from "@/components/Menu/MenuCard";
import Link from "next/link";
import FoodDescription from "@/components/Menu/FoodDescription";

type Food = {
    id: number;
    name: string;
    price: number;
    status: "AVAILABLE" | "UNAVAILABLE";
    category: 'APPETIZER' | 'ENTREE' | 'MAIN COURSE' | 'DESSERT' | 'DRINK';
    description: string;
    image_url: string;
}

const selectedFood: Food = {
    id: 0,
    name: 'NULL',
    price: 0,
    status: 'AVAILABLE',
    category: 'MAIN COURSE',
    description: 'NULL',
    image_url: 'https://placehold.co/600x400/png'
}

// Convert to client component
export default function MenuPage() {
    const [menuItems, setMenuItems] = useState<Food[]>([]);
    const [food, setFood] = useState<Food>(selectedFood);

    useEffect(() => {
        // Fetch data when component mounts
        async function fetchData() {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_CLIENT_API_URL}/api/foods`);
                if (!res.ok) {
                    throw new Error('Failed to fetch data');
                }
                const resJson = await res.json();
                setMenuItems(resJson.data || []);
            } catch (error) {
                console.error("Error fetching menu items:", error);
            }
        }

        fetchData();
    }, []);

    function selectFood(food: Food) {
        setFood(food);
        localStorage.setItem("selectedFood", JSON.stringify(food));
    }

    return (
        <>
            <div className="flex flex-row justify-center w-full h-[calc(100vh-64px)] overflow-x-hidden">
                <div className="w-full mx-16">
                    {/* Header and nav content */}
                    <div className="flex items-center justify-between w-full">
                        <p className="font-bold text-3xl w-full max-w-5xl py-12">รายการอาหาร</p>
                        <Link href="/cart" className="flex items-center justify-center p-2 rounded-xl bg-primary hover:bg-primary-dark transition-colors">
                            {/* Cart icon */}
                            <svg className="w-8 h-8 text-white dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                                <path fillRule="evenodd" d="M4 4a1 1 0 0 1 1-1h1.5a1 1 0 0 1 .979.796L7.939 6H19a1 1 0 0 1 .979 1.204l-1.25 6a1 1 0 0 1-.979.796H9.605l.208 1H17a3 3 0 1 1-2.83 2h-2.34a3 3 0 1 1-4.009-1.76L5.686 5H5a1 1 0 0 1-1-1Z" clipRule="evenodd" />
                            </svg>
                            <p className="font-bold text-white w-full text-center no-wrap">ตะกร้า</p>
                        </Link>
                    </div>

                    {/* Category Navigation */}
                    <div className="w-full mb-8">
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
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full overflow-y-auto">
                        {menuItems.map((menu: Food) => (
                            <MenuCard
                                key={menu.id}
                                menu={menu}
                                onSelectFood={selectFood}
                            />
                        ))}
                    </div>
                </div>

                {/* Food description pane */}
                <FoodDescription food={food} />
            </div>
        </>
    );
}