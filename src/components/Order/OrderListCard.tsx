'use client';

export default function OrderListCard() {
    return (
        <div className="grid grid-cols-[auto_1fr_auto_auto] justify-center items-center rounded-xl p-4 w-full shadow-xl gap-8">
            
            {/* food img */}
            <div className="w-24 h-24 bg-primary rounded-lg" />

            {/* food details */}
            <div className="flex justify-between gap-4">
                <div className="flex flex-col gap-2 flex-1">
                    <p className="font-bold text-xl">foodName</p>
                    <p>orderListDescription</p>
                </div>

                <div className="flex flex-col items-end justify-end">
                    <p>$10</p>
                </div>
            </div>

            {/* quantity section */}
            <div className="flex flex-col items-center gap-2">
                <p>จำนวน</p>
                <div className="p-5 border-2 rounded-lg border-primary shadow-md font-bold">
                    10
                </div>
            </div>

            {/* remove button */}
            <div>
                <p className="font-black text-cancelRed hover:scale-105 hover:text-hoverCancelRed cursor-pointer">
                    X
                </p>
            </div>

        </div>
    );
}