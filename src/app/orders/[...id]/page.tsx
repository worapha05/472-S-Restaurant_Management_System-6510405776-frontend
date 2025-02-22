import OrderListCard from "@/components/Order/OrderListCard";
import SummaryOrderCard from "@/components/Order/SummaryOrderCard"; 

async function getData(id: string) { // Ensure id is a string
    console.log("Fetching order with ID:", id);

    const res = await fetch(`http://omnidine-backend-laravel.test-1/api/orders/${id}`);

    if (!res.ok) {
        throw new Error('Failed to fetch data');
    }

    const resJson = await res.json();
    console.log("Fetched Data:", resJson);
    return resJson.data;
}

export default async function OrderPage({ params }: { params: { id: string } }) {
    const order = await getData(params.id); // Pass the correct order ID

    const totalPrice = order.order_lists.reduce(
        (sum: number, item: any) => sum + item.price * item.quantity,
        0
    );

    const fee = Math.round((totalPrice * 0.1) * 100) / 100;
    const finalTotal = Math.round((totalPrice + fee) * 100) / 100;

    return (
        <div className="flex flex-col items-center justify-center w-full px-4">
            <p className="font-bold text-3xl w-full max-w-5xl py-12">รายการคำสั่งซื้อ</p>

            <div className="flex items-start justify-center gap-12 w-full max-w-5xl">
                {/* Order List Section */}
                <div className="flex flex-col gap-4 w-5/6">
                    {order.order_lists.map((item: any) => (
                        <OrderListCard key={item.id} item={item} />
                    ))}
                </div>

                {/* Summary Section */}
                <div className="flex flex-col gap-4 w-2/5">
                    <SummaryOrderCard totalPrice={totalPrice} fee={fee} />
                    <div className="
                        cursor-pointer flex items-center justify-center p-6 bg-button text-white rounded-2xl font-bold
                        hover:bg-hoverButton
                        ">
                        สั่งซื้อ
                    </div>
                </div>
            </div>
        </div>
    );
}