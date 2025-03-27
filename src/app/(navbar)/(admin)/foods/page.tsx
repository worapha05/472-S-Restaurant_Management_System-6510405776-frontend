"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function FoodsPage() {
  const [foodItems, setFoodItems] = useState<Food[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ประเภทอาหารทั้งหมด");
  const [selectedStatus, setSelectedStatus] = useState("สถานะทั้งหมด");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12; // จำนวนรายการต่อหน้า

  const categories = ["ประเภทอาหารทั้งหมด", "MAIN COURSE", "DESSERT", "BEVERAGE"];
  const statuses = ["สถานะทั้งหมด", "AVAILABLE" , "UNAVAILABLE"];

  const formatFoodStatus = (status: string) => {
      switch (status.toUpperCase()) {
          case 'AVAILABLE': return 'เปิดขาย';
          case 'UNAVAILABLE': return 'ไม่เปิดขาย';
          default: return status;
      }
  };

  const formatFoodCategory = (category: string) => {
    switch (category.toUpperCase()) {
        case 'MAIN COURSE': return 'จานหลัก';
        case 'DESSERT': return 'ของหวาน';
        case 'BEVERAGE': return 'เครื่องดื่ม';
        default: return category;
    }
  };

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

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredFoodItems.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredFoodItems.length / itemsPerPage);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold mb-6">เมนูอาหาร</h1>

        {/* Add food */}
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

      {/* search */}
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
              {formatFoodCategory(category)}
            </option>
          ))}
        </select>
        <select 
          className="md:w-1/5 p-2 border border-gray-300 rounded"
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
        >
          {statuses.map((status) => (
            <option key={status} value={status}>
              {formatFoodStatus(status)}
            </option>
          ))}
        </select>
      </div>
      
      {/* menu */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {currentItems.length > 0 ? (
          currentItems.map((item) => (
            <div key={item.id} className="border rounded-lg overflow-hidden shadow-md">
              <div className="relative h-48 w-full overflow-hidden">
                <img
                  src={`${process.env.NEXT_PUBLIC_S3_URL}/${item.image_url}`}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-4">
                <h2 className="text-xl font-semibold mb-2">{item.name}</h2>

                <div className="flex gap-4 mb-2">
                  <span className="text-sm text-gray-500">ประเภทอาหาร: {formatFoodCategory(item.category)}</span>
                </div>
                <div className="flex mb-4">
                  <span
                    className={`text-sm px-2 py-1 rounded ${
                      item.status === "AVAILABLE"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {formatFoodStatus(item.status.toUpperCase())}
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

      {/* Pagination */}
      <div className="flex justify-center mt-6">
        {Array.from({ length: totalPages }, (_, index) => (
          <button
            key={index}
            onClick={() => setCurrentPage(index + 1)}
            className={`mx-1 px-4 py-2 border rounded ${
              currentPage === index + 1 ? "bg-blue-500 text-white" : "bg-gray-200"
            }`}
          >
            {index + 1}
          </button>
        ))}
      </div>
    </div>
  );
}
