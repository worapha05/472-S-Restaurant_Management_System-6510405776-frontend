'use client';

export default function SummaryOrderCard({ totalPrice, fee }: { totalPrice: number, fee: number}) {
    return (
        <div className="flex flex-col rounded-2xl p-6 w-full shadow-xl gap-4 border-2 border-primary">
            
            <div>
                <p className="font-bold text-2xl">สรุปค่าใช้จ่าย</p>
            </div>

            <div className="flex flex-col gap-3 px-6 py-4">
                <div className="flex justify-between">
                    <p>ค่าอาหาร</p>
                    <p>$ {totalPrice}</p>
                </div>

                <div className="flex justify-between">
                    <p>ค่าบริการ</p>
                    <p>$ {fee}</p>
                </div>
            </div>

            <div className="border-t-2 border-primary"/>

            <div>
                <div className="flex justify-between font-bold text-xl">
                    <p>รวมยอดทั้งหมด</p>
                    <p>$ {totalPrice + fee}</p>
                </div>
            </div>

        </div>
    );
}