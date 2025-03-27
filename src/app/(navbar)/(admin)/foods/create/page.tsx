"use client";

import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import axios from "axios";
import StandaloneMinioUploader from "@/components/Upload/Upload";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

// Define interfaces for form data and errors
interface FoodFormData {
  name: string;
  price: string;
  status: string;
  category: string;
  description: string;
  image_url: string;
}

interface FoodFormErrors {
  name: string;
  price: string;
  status: string;
  category: string;
  image_url: string;
}

export default function CreateFoodPage() {
  const router = useRouter();
  const { data: session } = useSession();
  
  const [formData, setFormData] = useState<FoodFormData>({
    name: "",
    price: "",
    status: "",
    category: "",
    description: "",
    image_url: "",
  });

  const [errors, setErrors] = useState<FoodFormErrors>({
    name: "",
    price: "",
    status: "",
    category: "",
    image_url: "",
  });

  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");

  // Check for authorization on component mount
  useEffect(() => {
    if (!session?.user?.accessToken) {
      router.push('/login');
    }
  }, [session, router]);

  const validateForm = (): boolean => {
    let valid = true;
    const newErrors: FoodFormErrors = {
      name: "",
      price: "",
      status: "",
      category: "",
      image_url: "",
    };

    // Validate name
    if (!formData.name.trim()) {
      newErrors.name = "กรุณากรอกชื่อเมนู";
      valid = false;
    }

    // Validate price (ensure it's an integer and greater than 0)
    const price = parseFloat(formData.price);
    if (!formData.price || price <= 0 || price !== Math.floor(price)) {
      newErrors.price = "ราคาต้องมากกว่า 0 และเป็นจำนวนเต็ม";
      valid = false;
    }

    // Validate status
    if (!formData.status) {
      newErrors.status = "เลือกสถานะ";
      valid = false;
    }

    // Validate category
    if (!formData.category) {
      newErrors.category = "เลือกหมวดหมู่";
      valid = false;
    }

    // Validate image URL
    if (!formData.image_url || !formData.image_url.startsWith('http')) {
      newErrors.image_url = "กรุณากรอก URL รูปภาพที่ถูกต้อง";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      // Prepare data with the right format
      const postData = {
        ...formData,
        price: parseFloat(formData.price)
      };

      // Make API request with authorization token
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_CLIENT_API_URL}/api/foods`, 
        postData, 
        {
          headers: {
            'Authorization': `Bearer ${session?.user?.accessToken}`
          }
        }
      );
      
      setMessage("✅ เพิ่มเมนูสำเร็จ!");
      
      // Reset form
      setFormData({
        name: "",
        price: "",
        status: "",
        category: "",
        description: "",
        image_url: "",
      });

      const createdFood: Food = response.data.data;
      
      // Redirect to the food details page after a short delay
      setTimeout(() => {
        router.push(`/foods/${createdFood.id}`);
      }, 1000);
      
    } catch (error : any) {
      console.error("Error creating food:", error.response.data);
      setMessage("❌ เกิดข้อผิดพลาด");
    } finally {
      setLoading(false);
    }
  };

  // Function to handle the image URL after upload
  const handleImageUpload = (uploadedUrl: string) => {
    const fullUrl = `${uploadedUrl}`;
    setFormData({
      ...formData,
      image_url: fullUrl
    });
  };

  return (
    <div className="max-w-lg mx-auto p-6 bg-white shadow-md rounded-lg mt-10">
      <div className="flex">
        <h1 className="text-xl font-bold mb-4">เพิ่มเมนูอาหาร</h1>

        <div className="ml-auto">
          <Link href="/foods">
            <button className="px-4 py-2 text-gray-500 rounded-xl hover:bg-gray-100">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3" />
              </svg>
            </button>
          </Link>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">ชื่อเมนู</label>
          <input 
            type="text" 
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full p-2 border rounded" 
          />
          {errors.name && <p className="text-red-500">{errors.name}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium">ราคา</label>
          <input 
            type="number" 
            name="price"
            value={formData.price}
            onChange={handleChange}
            step="1"  // Ensure no decimal values
            className="w-full p-2 border rounded" 
          />
          {errors.price && <p className="text-red-500">{errors.price}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium">สถานะ</label>
          <select 
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          >
            <option value="">-- เลือกสถานะ --</option>
            <option value="AVAILABLE">เปิดขาย</option>
            <option value="UNAVAILABLE">ไม่เปิดขาย</option>
          </select>
          {errors.status && <p className="text-red-500">{errors.status}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium">หมวดหมู่</label>
          <select 
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          >
            <option value="">-- เลือกหมวดหมู่ --</option>
            <option value="MAIN COURSE">จานหลัก</option>
            <option value="DESSERT">ของหวาน</option>
            <option value="BEVERAGE">เครื่องดื่ม</option>
          </select>
          {errors.category && <p className="text-red-500">{errors.category}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium">คำอธิบาย</label>
          <textarea 
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          ></textarea>
        </div>

        <div>
          <label className="block text-sm font-medium">ลิงก์รูปภาพ</label>
          <StandaloneMinioUploader onImageUpload={handleImageUpload} />
          {errors.image_url && <p className="text-red-500">{errors.image_url}</p>}
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
        >
          {loading ? "กำลังเพิ่ม..." : "เพิ่มเมนู"}
        </button>

        {message && <p className="mb-2 text-center">{message}</p>}
      </form>
    </div>
  );
}
