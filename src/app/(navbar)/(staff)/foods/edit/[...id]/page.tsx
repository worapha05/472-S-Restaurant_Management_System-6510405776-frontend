"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import axios from "axios";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import StandaloneMinioUploader from "@/components/Upload/Upload";
import Link from "next/link";

const foodSchema = z.object({
    name: z.string().min(1, "กรุณากรอกชื่อเมนู"),
    price: z.coerce.number().min(1, "ราคาต้องมากกว่า 0"),
    status: z.enum(["available", "unavailable"]),
    category: z.enum(["main course", "dessert", "beverage"]),
    description: z.string().optional(),
    image_url: z.string().url("กรุณากรอก URL รูปภาพที่ถูกต้อง"),
});

export default function EditFoodPage({ params }: { params: { id: string } }) {
    const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm({
        resolver: zodResolver(foodSchema),
    });

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const router = useRouter();

    const { id } = params;

    useEffect(() => {
        async function fetchFood() {
            try {
                const res = await axios.get(`${process.env.NEXT_PUBLIC_CLIENT_API_URL}/api/foods/${id}`);
                reset(res.data.data);
            } catch (error) {
                console.error("Error fetching food data:", error);
            }
        }
        if (id) {
            fetchFood();
        }
    }, [id, reset]);

    const onSubmit = async (data: any) => {
        setLoading(true);
        setMessage("");
        try {
            await axios.put(`${process.env.NEXT_PUBLIC_CLIENT_API_URL}/api/foods/${id}`, data);
            setMessage("✅ แก้ไขเมนูสำเร็จ!");
            router.push(`/foods/${id}`);
        } catch (error) {
            setMessage("❌ เกิดข้อผิดพลาด");
        } finally {
            setLoading(false);
        }
    };

    // Function to handle the image URL after upload
    const handleImageUpload = (uploadedUrl: string) => {
        const fullUrl = `${process.env.NEXT_PUBLIC_S3_URL}${uploadedUrl}`;
        setValue("image_url", fullUrl); // Set the image URL in the form state
    };

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


            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium">ชื่อเมนู</label>
                    <input {...register("name")} className="w-full p-2 border rounded" />
                    {errors.name && <p className="text-red-500">{errors.name.message}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium">ราคา</label>
                    <input type="number" {...register("price")} className="w-full p-2 border rounded" />
                    {errors.price && <p className="text-red-500">{errors.price.message}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium">สถานะ</label>
                    <select {...register("status")} className="w-full p-2 border rounded">
                        <option value="available">Available</option>
                        <option value="unavailable">Unavailable</option>
                    </select>
                    {errors.status && <p className="text-red-500">{errors.status.message}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium">หมวดหมู่</label>
                    <select {...register("category")} className="w-full p-2 border rounded">
                        <option value="main course">Main Course</option>
                        <option value="dessert">Dessert</option>
                        <option value="beverage">Beverage</option>
                    </select>
                    {errors.category && <p className="text-red-500">{errors.category.message}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium">คำอธิบาย</label>
                    <textarea {...register("description")} className="w-full p-2 border rounded"></textarea>
                </div>

                <div>
                    <label className="block text-sm font-medium">ลิงก์รูปภาพ</label>
                    <StandaloneMinioUploader onImageUpload={handleImageUpload} />
                    {errors.image_url && <p className="text-red-500">{errors.image_url.message}</p>}
                </div>

                <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
                >
                    {loading ? "กำลังบันทึก..." : "บันทึกการแก้ไข"}
                </button>
                
                {message && <p className="mb-2 text-center">{message}</p>}
            </form>
        </div>
    );
}
