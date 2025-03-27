"use client";

import React, { useState, useEffect, ChangeEvent, FormEvent } from "react";
import axios from "axios";
import { useRouter, useParams } from "next/navigation";
import StandaloneMinioUploader from "@/components/Upload/Upload";
import Link from "next/link";
import { useSession } from "next-auth/react";

interface ApiResponse {
    success: boolean;
    data: {
        id: string;
        name: string;
        price: number;
        status: "AVAILABLE" | "UNAVAILABLE";
        category: "MAIN COURSE"| "DESSERT"| "BEVERAGE";
        description: string;
        image_url: string;
        created_at: string;
        updated_at: string;
    };
    message?: string;
}

interface FormErrors {
    name: string;
    price: string;
    image_url: string;
}

export default function EditFoodPage() {
    const [formData, setFormData] = useState<Food>({
        name: "",
        price: 0,
        status: "AVAILABLE",
        category: "MAIN COURSE",
        description: "",
        image_url: "",
    });
    
    const [errors, setErrors] = useState<FormErrors>({
        name: "",
        price: "",
        image_url: ""
    });
    
    const [loading, setLoading] = useState<boolean>(false);
    const [fetchLoading, setFetchLoading] = useState<boolean>(true);
    const [message, setMessage] = useState<string>("");
    const router = useRouter();
    const { data: session, status: sessionStatus } = useSession();
    
    // Get params from client-side hook
    const params = useParams();
    const id = params.id as string;

    // Fetch food data when component mounts or id/session changes
    useEffect(() => {
        async function fetchFood() {
            if (!id || sessionStatus !== 'authenticated') return;
            
            setFetchLoading(true);
            try {
                const token = (session?.user.accessToken);
                
                const res = await axios.get<ApiResponse>(
                    `${process.env.NEXT_PUBLIC_CLIENT_API_URL}/api/foods/${id}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );
                
                // Format the data for the form
                const foodData = res.data.data;
                setFormData({
                    name: foodData.name,
                    price: foodData.price,
                    status: foodData.status,
                    category: foodData.category,
                    description: foodData.description || "",
                    image_url: foodData.image_url,
                });
                
            } catch (error) {
                console.error("Error fetching food data:", error);
                setMessage("❌ ไม่สามารถดึงข้อมูลเมนูได้");
            } finally {
                setFetchLoading(false);
            }
        }
        
        fetchFood();
    }, [id, session, sessionStatus]);

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        
        // Clear error when field is edited
        if (errors[name as keyof FormErrors]) {
            setErrors(prev => ({
                ...prev,
                [name]: ""
            }));
        }
    };

    const validateForm = (): boolean => {
        let isValid = true;
        const newErrors = { ...errors };
        
        if (!formData.name.trim()) {
            newErrors.name = "กรุณากรอกชื่อเมนู";
            isValid = false;
        }
        
        if (!formData.price || formData.price <= 0) {
            newErrors.price = "ราคาต้องมากกว่า 0";
            isValid = false;
        }
        
        if (!formData.image_url) {
            newErrors.image_url = "กรุณากรอก URL รูปภาพที่ถูกต้อง";
            isValid = false;
        }
        
        setErrors(newErrors);
        return isValid;
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }
        
        setLoading(true);
        setMessage("");
        
        try {
            const token = (session?.user.accessToken);
            
            if (!token) {
                setMessage("❌ กรุณาเข้าสู่ระบบก่อนดำเนินการ");
                setLoading(false);
                return;
            }
            
            const dataToSubmit = {
                ...formData,
                price: formData.price
            };
            
            await axios.put(
                `${process.env.NEXT_PUBLIC_CLIENT_API_URL}/api/foods/${id}`, 
                dataToSubmit,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            
            setMessage("✅ แก้ไขเมนูสำเร็จ!");
            
            // Delay redirect to allow user to see success message
            setTimeout(() => {
                router.push(`/foods/${id}`);
            }, 1000);
            
        } catch (error) {
            console.error("Error updating food:", error);
            if (axios.isAxiosError(error) && error.response) {
                // Display specific error message from API if available
                setMessage(`❌ ${error.response.data.message || "เกิดข้อผิดพลาดในการแก้ไขเมนู"}`);
            } else {
                setMessage("❌ เกิดข้อผิดพลาดในการแก้ไขเมนู");
            }
        } finally {
            setLoading(false);
        }
    };

    // Function to handle the image URL after upload
    const handleImageUpload = (uploadedUrl: string) => {
        const fullUrl = `${uploadedUrl}`;
        setFormData(prev => ({
            ...prev,
            image_url: fullUrl
        }));
        
        // Clear image error if it exists
        if (errors.image_url) {
            setErrors(prev => ({
                ...prev,
                image_url: ""
            }));
        }
    };

    // Show loading state while session is loading
    if (sessionStatus === "loading") {
        return (
            <div className="max-w-lg mx-auto p-6 bg-white shadow-md rounded-lg mt-10 text-center">
                <p className="text-gray-500">กำลังโหลด...</p>
            </div>
        );
    }

    // Redirect if not authenticated
    if (sessionStatus === "unauthenticated") {
        return (
            <div className="max-w-lg mx-auto p-6 bg-white shadow-md rounded-lg mt-10 text-center">
                <p className="text-red-500 mb-4">กรุณาเข้าสู่ระบบก่อนแก้ไขเมนู</p>
                <Link href="/login">
                    <button className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600">
                        เข้าสู่ระบบ
                    </button>
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-lg mx-auto p-6 bg-white shadow-md rounded-lg mt-10">
            <div className="flex">
                <h1 className="text-xl font-bold mb-4">แก้ไขเมนูอาหาร</h1>

                <div className="ml-auto">
                    <Link href={`/foods/${id}`}>
                        <button className="px-4 py-2 text-gray-500 rounded-xl hover:bg-gray-100">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3" />
                            </svg>
                        </button>
                    </Link>
                </div>
            </div>

            {fetchLoading ? (
                <div className="py-20 text-center">
                    <p className="text-gray-500">กำลังโหลดข้อมูลเมนู...</p>
                </div>
            ) : (
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
                            <option value="AVAILABLE">เปิดขาย</option>
                            <option value="UNAVAILABLE">ไม่เปิดขาย</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium">หมวดหมู่</label>
                        <select 
                            name="category" 
                            value={formData.category} 
                            onChange={handleChange} 
                            className="w-full p-2 border rounded"
                        >
                            <option value="MAIN COURSE">จานหลัก</option>
                            <option value="DESSERT">ของหวาน</option>
                            <option value="BEVERAGE">เครื่องดื่ม</option>
                        </select>
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
                        {formData.image_url && (
                            <div className="mt-2">
                                <p className="text-sm text-green-600 mb-2">
                                    รูปภาพถูกอัปโหลดแล้ว
                                </p>
                                <img 
                                    src={`${process.env.NEXT_PUBLIC_S3_URL}/${formData.image_url}`} 
                                    alt={formData.name} 
                                    className="w-32 h-32 object-cover rounded-md"
                                />
                            </div>
                        )}
                        {errors.image_url && <p className="text-red-500">{errors.image_url}</p>}
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 disabled:bg-blue-300"
                    >
                        {loading ? "กำลังบันทึก..." : "บันทึกการแก้ไข"}
                    </button>
                    
                    {message && <p className={`mb-2 text-center ${message.includes("✅") ? "text-green-500" : "text-red-500"}`}>{message}</p>}
                </form>
            )}
        </div>
    );
}