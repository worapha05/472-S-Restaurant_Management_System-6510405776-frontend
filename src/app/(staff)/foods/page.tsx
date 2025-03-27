"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

interface Food {
  id: number;
  name: string;
  price: number;
  status: "available" | "unavailable";
  category: "main course" | "dessert" | "beverage";
  description: string;
  image_url: string;
}

export default function FoodsPage() {
  const [foodItems, setFoodItems] = useState<Food[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ประเภทอาหารทั้งหมด");
  const [selectedStatus, setSelectedStatus] = useState("สถานะทั้งหมด");
  const categories = ["ประเภทอาหารทั้งหมด", "main course" , "dessert", "beverage"];
  const status = ["สถานะทั้งหมด", "available", "unavailable"];

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_CLIENT_API_URL}/api/foods`);
        if (!res.ok) {
          throw new Error("Failed to fetch data");
        }
        const data = await res.json();
        setFoodItems(data.data || []);
      } catch (error) {
        console.error("Error fetching food items:", error);
      }
    }
    fetchData();
  }, []);

  const filteredFoodItems = foodItems.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "ประเภทอาหารทั้งหมด" || item.category === selectedCategory;
    const matchesStatus = selectedStatus === "สถานะทั้งหมด" || item.status === selectedStatus;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold mb-6">เมนูอาหาร</h1>

            {/* ปุ่มเพิ่มเมนูอาหาร */}
            <div className="mb-6">
                <Link 
                    href="/foods/create" 
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary hover:bg-primary-dark transition-colors w-fit text-white font-bold"
                >
                    <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        strokeWidth="1.5" 
                        stroke="currentColor" 
                        className="size-6 text-white"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>

                    <span className="whitespace-nowrap">เพิ่มเมนู</span>
                </Link>
            </div>
        </div>

      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <input
          type="text"
          placeholder="ค้นหาเมนูอาหาร..."
          className="w-full md:w-3/5 p-2 border border-gray-300 rounded"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select 
          className="md:w-1/5 p-2 border border-gray-300 rounded"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          {categories.map((category) => (
            <option key={category} value={category}>
              {category.replace("_", " ")}
            </option>
          ))}
        </select>
        <select 
          className="md:w-1/5 p-2 border border-gray-300 rounded"
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
        >
          {status.map((status) => (
            <option key={status} value={status}>
              {status.replace("_", " ")}
            </option>
          ))}
        </select>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredFoodItems.length > 0 ? (
          filteredFoodItems.map((item) => (
            <div key={item.id} className="border rounded-lg overflow-hidden shadow-md">
              <div className="relative h-48 w-full">
                <img
                  src={item.image_url}
                  alt={item.name}
                  className="w-full h-auto object-cover"
                />
              </div>
              <div className="p-4">
                <h2 className="text-xl font-semibold mb-2">{item.name}</h2>

                {/* แสดง category และ status */}
                <div className="flex gap-4 mb-2">
                  <span className="text-sm text-gray-500">ประเภทอาหาร: {item.category}</span>
                </div>
                <div className="flex mb-4">
                    <span
                        className={`text-sm px-2 py-1 rounded ${
                        item.status === "available"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                    >
                    {item.status}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold">
                    ฿ {item.price}
                  </span>
                  <Link href={`/foods/${item.id}`} className="text-blue-500 hover:underline">
                    ดูรายละเอียด
                  </Link>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-8">
            <p className="text-xl text-gray-500">ไม่พบรายการอาหาร ลองค้นหาใหม่อีกครั้ง!</p>
          </div>
        )}
      </div>
    </div>
  );
}
