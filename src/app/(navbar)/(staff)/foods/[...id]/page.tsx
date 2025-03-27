import Link from "next/link";

async function getData(id: string) {
    console.log("Fetching food with ID:", id);

    const res = await fetch(`${process.env.NEXT_PUBLIC_SERVER_API_URL}/api/foods/${id}`);

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


            <div className="w-full max-w-5xl bg-white p-6 rounded-xl shadow-lg relative">
                <div className="absolute top-4 right-4">
                    <Link href={`edit/${food.id}`}>
                        <button className="flex items-center px-4 py-2 rounded-lg bg-primary hover:bg-primary-dark transition-colors w-fit text-white font-bold">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="mr-1 size-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                            </svg>
                            แก้ไขเมนู
                        </button>
                    </Link>
                </div>

                <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
                    {/* Image Section */}
                    <div className="flex-shrink-0">
                        <img
                            src={food.image_url}
                            alt={food.name}
                            className="w-64 h-64 object-cover rounded-lg shadow-md"
                        />
                    </div>

                    {/* Food Information */}
                    <div className="flex flex-col items-start w-full">
                        <h2 className="text-2xl font-semibold text-gray-800">{food.name}</h2>
                        <p className="text-lg text-gray-600">{food.category.toUpperCase()}</p>

                        <p className="text-xl font-bold text-primary mt-4">{`฿${Number(food.price).toFixed(2)}`}</p>

                        <p className="text-sm text-gray-600 mt-4">{food.description}</p>

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