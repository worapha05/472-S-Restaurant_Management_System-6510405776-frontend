import OrderCard from "@/components/Order/OrderCard";

async function getData() {
    const res = await fetch("http:///omnidine-backend-laravel.test-1/api/orders");
    
    // console.log("Response Status:", res.status); // Logs status code
    // console.log("Response Headers:", res.headers); // Logs headers
    
    
    if (!res.ok) {
        throw new Error('Failed to fetch data');
    }
    
    const resJson = await res.json();
    console.log("Fetched Data:", resJson); // Logs the response JSON
    return resJson.data;
}

export default async function OrdersPage() {
    const orders = await getData();

    return (
        <div className="flex flex-col items-center justify-center w-full px-4">
            <p className="font-bold text-3xl w-full max-w-5xl py-12">รายการคำสั่งซื้อ</p>
            <div className="flex flex-col gap-4 w-full max-w-5xl">
                {orders.map((order : any) => (
                    <OrderCard key={order.id} order={order} />
                ))}
            </div>
        </div>
    );
}
