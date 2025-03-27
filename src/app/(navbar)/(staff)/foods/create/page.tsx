"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import axios from "axios";
import { useState } from "react";
import StandaloneMinioUploader from "@/components/Upload/Upload";

const foodSchema = z.object({
    name: z.string().min(1, "กรุณากรอกชื่อเมนู"),
    price: z.coerce.number().min(1, "ราคาต้องมากกว่า 0"),
    status: z.enum(["AVAILABLE", "UNAVAILABLE"], { message: "เลือกสถานะ" }),
    category: z.enum(["main course", "dessert", "beverage"], { message: "เลือกหมวดหมู่" }),
    description: z.string().optional(),
    image_url: z.string().url("กรุณากรอก URL รูปภาพที่ถูกต้อง"),
});

export default function CreateFoodPage() {
    const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm({
        resolver: zodResolver(foodSchema),
    });

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    const onSubmit = async (data: any) => {
        setLoading(true);
        setMessage("");
        try {
            const res = await axios.post(`${process.env.NEXT_PUBLIC_CLIENT_API_URL}/api/foods`, data);
            setMessage("✅ เพิ่มเมนูสำเร็จ!");
            reset();
        } catch (error) {
            setMessage("❌ เกิดข้อผิดพลาด");
        } finally {
            setLoading(false);
        }
    };

    // Function to handle the image URL after upload
    const handleImageUpload = (uploadedUrl: string) => {
        setValue("image_url", uploadedUrl); // Set the uploaded URL into the form state
    };

    return (
        <div className="max-w-md mx-auto p-6 bg-white shadow-md rounded-lg mt-10">
            <h1 className="text-xl font-bold mb-4">เพิ่มเมนูอาหาร</h1>
            {message && <p className="mb-2 text-center">{message}</p>}

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
                        <option value="">-- เลือกสถานะ --</option>
                        <option value="AVAILABLE">AVAILABLE</option>
                        <option value="UNAVAILABLE">UNAVAILABLE</option>
                    </select>
                    {errors.status && <p className="text-red-500">{errors.status.message}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium">หมวดหมู่</label>
                    <select {...register("category")} className="w-full p-2 border rounded">
                        <option value="">-- เลือกหมวดหมู่ --</option>
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
                    <StandaloneMinioUploader/>
                    {errors.image_url && <p className="text-red-500">{errors.image_url.message}</p>}
                </div>

                <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
                >
                    {loading ? "กำลังเพิ่ม..." : "เพิ่มเมนู"}
                </button>
            </form>
        </div>
    );
}
