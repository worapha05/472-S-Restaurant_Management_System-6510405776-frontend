'use client';

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import MenuCard from "@/components/Menu/MenuCard";
import Link from "next/link";
import FoodDescription from "@/components/Menu/FoodDescription";

const defaultFood: Food = {
    id: 0,
    name: 'NULL',
    price: 0,
    status: 'AVAILABLE',
    category: 'MAIN COURSE',
    description: 'NULL',
    image_url: 'https://placehold.co/600x400/png'
}

export default function MenuPage() {
    const searchParams = useSearchParams();
    const selectedCategory = searchParams.get('category') || 'ALL';
    const [menuItems, setMenuItems] = useState<Food[]>([]);
    const [selectedFood, setSelectedFood] = useState<Food>(defaultFood);
    const [isLoading, setIsLoading] = useState(true);
    const [showDescription, setShowDescription] = useState(false);

    // Fetch menu data when component mounts
    useEffect(() => {
        async function fetchData() {
            setIsLoading(true);
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_CLIENT_API_URL}/api/foods`);
                if (!res.ok) {
                    throw new Error('Failed to fetch data');
                }
                const resJson = await res.json();
                
                // Ensure the API response format matches our Food type
                if (resJson.data && Array.isArray(resJson.data)) {
                    const parsedFoods: Food[] = resJson.data.map((item: any) => ({
                        id: item.id,
                        name: item.name || '',
                        price: parseFloat(item.price) || 0,
                        status: item.status || 'UNAVAILABLE',
                        category: item.category || 'MAIN COURSE',
                        description: item.description || '',
                        image_url: item.image_url || 'https://placehold.co/600x400/png'
                    }));
                    setMenuItems(parsedFoods);
                }
            } catch (error) {
                console.error("Error fetching menu items:", error);
            } finally {
                setIsLoading(false);
            }
        }

        fetchData();
    }, []);

    function selectFood(foodId: number) {
        // Find the complete food object from the menuItems array using the ID
        const foundFood = menuItems.find(item => item.id === foodId);
        
        if (foundFood) {
            setSelectedFood(foundFood);
            setShowDescription(true);
            localStorage.setItem("selectedFood", JSON.stringify(foundFood));
        }
    }

    function closeDescription() {
        setShowDescription(false);
    }

    const filteredMenuItems = selectedCategory === 'ALL'
        ? menuItems
        : menuItems.filter(item => item.category === selectedCategory);

    return (
        <>
            <div className="flex flex-col justify-center w-full min-h-[calc(100vh-64px)] overflow-x-hidden">
                <div className="w-full px-4 md:px-8 lg:px-16">
                    {/* Header and nav content */}
                    <div className="flex items-center justify-between w-full">
                        <p className="font-bold text-2xl md:text-3xl w-full max-w-5xl py-8 md:py-12">รายการอาหาร</p>
                        <Link href="/cart" className="flex items-center justify-center p-2 rounded-xl bg-primary hover:bg-primary-dark transition-colors">
                            {/* Cart icon */}
                            <svg className="w-6 h-6 md:w-8 md:h-8 text-white dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                                <path fillRule="evenodd" d="M4 4a1 1 0 0 1 1-1h1.5a1 1 0 0 1 .979.796L7.939 6H19a1 1 0 0 1 .979 1.204l-1.25 6a1 1 0 0 1-.979.796H9.605l.208 1H17a3 3 0 1 1-2.83 2h-2.34a3 3 0 1 1-4.009-1.76L5.686 5H5a1 1 0 0 1-1-1Z" clipRule="evenodd" />
                            </svg>
                            <p className="font-bold text-white text-center no-wrap ml-2">ตะกร้า</p>
                        </Link>
                    </div>

                    {/* Category Navigation */}
                    <div className="w-full mb-8 overflow-x-auto">
                        <nav className="flex gap-4 md:gap-8 border-b border-gray-200 min-w-max">
                            {['ALL', 'APPETIZER', 'ENTREE', 'MAIN COURSE', 'DESSERT', 'DRINKS'].map((category) => (
                                <Link
                                    key={category}
                                    href={`?${new URLSearchParams({ category })}`}
                                    className={`pb-4 text-sm border-b-2 transition-colors whitespace-nowrap ${selectedCategory === category
                                        ? 'text-black border-black font-semibold'
                                        : 'text-gray-600 hover:text-gray-900 border-transparent hover:border-black'
                                        }`}
                                >
                                    {category}
                                </Link>
                            ))}
                        </nav>
                    </div>

                    {/* Menu Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 w-full pb-16">
                        {isLoading ? (
                            // Skeleton loading UI
                            Array(8).fill(0).map((_, index) => (
                                <div key={index} className="animate-pulse">
                                    <div className="bg-gray-200 h-48 rounded-lg mb-2"></div>
                                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                                </div>
                            ))
                        ) : filteredMenuItems.length === 0 ? (
                            <div className="col-span-full flex flex-col gap-5 items-center justify-center py-16">
                                <svg fill="#333333" width="10rem" height="10rem" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M12,22 C6.4771525,22 2,17.5228475 2,12 C2,6.4771525 6.4771525,2 12,2 C17.5228475,2 22,6.4771525 22,12 C22,17.5228475 17.5228475,22 12,22 Z M12,21 C16.9705627,21 21,16.9705627 21,12 C21,7.02943725 16.9705627,3 12,3 C7.02943725,3 3,7.02943725 3,12 C3,16.9705627 7.02943725,21 12,21 Z M9,16.5 C9,16.7761424 8.77614237,17 8.5,17 C8.22385763,17 8,16.7761424 8,16.5 C8,14.5670034 9.56700338,13 11.5,13 L12.5177814,13 C14.4508073,13 16.0178344,14.5670271 16.0178344,16.500053 C16.0178344,16.7761954 15.7939768,17.000053 15.5178344,17.000053 C15.241692,17.000053 15.0178344,16.7761954 15.0178344,16.500053 C15.0178344,15.1193119 13.8985226,14 12.5177814,14 L11.5,14 C10.1192881,14 9,15.1192881 9,16.5 Z M9,11 C8.44771525,11 8,10.5522847 8,10 C8,9.44771525 8.44771525,9 9,9 C9.55228475,9 10,9.44771525 10,10 C10,10.5522847 9.55228475,11 9,11 Z M15,11 C14.4477153,11 14,10.5522847 14,10 C14,9.44771525 14.4477153,9 15,9 C15.5522847,9 16,9.44771525 16,10 C16,10.5522847 15.5522847,11 15,11 Z" />
                                </svg>

                                <div className="flex flex-col gap-2">
                                    <p className="text-center text-2xl text-primary">ไม่พบอาหารในรายการดังกล่าว</p>
                                    <p className="text-center text-lg text-secondary">กรุณาเลือกหมวดหมู่อื่น</p>
                                </div>
                            </div>
                        ) : (
                            filteredMenuItems.map((menu: Food) => (
                                <MenuCard
                                    key={menu.id}
                                    menu={menu}
                                    onSelectFood={() => selectFood(menu.id)}
                                />
                            ))
                        )}
                    </div>
                </div>

                {/* Food description modal/overlay */}
                {showDescription && selectedFood.id !== 0 && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
                        <div className="bg-white rounded-lg shadow-xl w-full max-w-lg md:max-w-2xl max-h-[90vh] overflow-auto relative animate-fadeIn">
                            {/* Close button */}
                            <button 
                                onClick={closeDescription} 
                                className="absolute top-4 right-4 text-gray-600 hover:text-gray-900 z-10"
                                aria-label="Close"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                            
                            <FoodDescription food={selectedFood} />
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}