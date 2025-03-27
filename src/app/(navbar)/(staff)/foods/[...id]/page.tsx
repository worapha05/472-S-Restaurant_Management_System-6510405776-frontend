import Navbar from "@/components/Navbar/Navbar";
import Link from "next/link";

async function getData(id: string) {
    console.log("Fetching food with ID:", id);

    const res = await fetch(`${process.env.NEXT_PUBLIC_CLIENT_API_URL}/api/foods/${id}`);

    if (!res.ok) {
        throw new Error('Failed to fetch data');
    }

    const resJson = await res.json();
    console.log("Fetched Data:", resJson);
    return resJson.data;
}

export default async function FoodPage({ params }: { params: { id: string } }) {
    const food = await getData(params.id);

    return (
        <div className="flex flex-col items-center justify-center w-full px-4">
            <div className="flex items-center justify-between w-full max-w-5xl py-12">
                <p className="font-bold text-3xl w-full">รายละเอียดอาหาร</p>
            </div>


            {/* Food Details Section */}
            <div className="w-full max-w-5xl bg-white p-6 rounded-xl shadow-lg">
                <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
                    {/* Image Section */}
                    <div className="flex-shrink-0">
                        <img
                            src={food.image_url}
                            alt={food.name}
                            className="w-64 h-64 object-cover rounded-lg shadow-md"
                        />
                    </div>

                    {/* Food Information Section */}
                    <div className="flex flex-col items-start w-full">
                        <h2 className="text-2xl font-semibold text-gray-800">{food.name}</h2>
                        <p className="text-lg text-gray-600">{food.category.toUpperCase()}</p>

                        {/* Price */}
                        <p className="text-xl font-bold text-primary mt-4">{`฿${Number(food.price).toFixed(2)}`}</p>

                        {/* Description */}
                        <p className="text-sm text-gray-600 mt-4">{food.description}</p>

                        {/* Status */}
                        <p
                            className={`mt-4 text-white py-1 px-3 rounded-full ${
                                food.status === "available" ? "bg-green-500" : "bg-red-500"
                            }`}
                        >
                            {food.status}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
