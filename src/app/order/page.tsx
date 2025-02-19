import OrderListCard from "@/components/Order/OrderListCard";
import SummaryOrderCard from "@/components/Order/SummaryOrderCard"; 

async function getData() {
    const res = await fetch("http://host.docker.internal/api/orders/12");
    
    // console.log("Response Status:", res.status); // Logs status code
    // console.log("Response Headers:", res.headers); // Logs headers
    
    
    if (!res.ok) {
        throw new Error('Failed to fetch data');
    }
    
    const resJson = await res.json();
    console.log("Fetched Data:", resJson); // Logs the response JSON
    return resJson.data;
}

export default async function OrderPage() {

    const order = await getData();

    const totalPrice = order.order_lists.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0);
    // Calculate 10% fee (rounded to 2 decimal places)
    const fee = Math.round((totalPrice * 0.1) * 100) / 100;

    // Calculate final total (rounded to 2 decimal places)
    const finalTotal = Math.round((totalPrice + fee) * 100) / 100;

    return (
        <div className="flex flex-col items-center justify-center w-full px-4">
            
            <p className="font-bold text-3xl w-full max-w-5xl py-12">รายการคำสั่งซื้อ</p>

            <div className="flex items-start justify-center gap-12 w-full max-w-5xl">
                
                {/* Order List Section - Increased Width */}
                <div className="flex flex-col gap-4 w-5/6">
                {order.order_lists.map((item : any) => (
                        <OrderListCard key={item.id} item={item} />
                    ))}
                </div>

                {/* Summary Section */}
                <div className="flex flex-col gap-4 w-2/5">
                    {/* <p>{order.order_lists[0].id}</p> */}

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