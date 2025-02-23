import TimeCard from "@/components/Reservation/TimeCard";

export default async function ShowTimeSlots() {
    return (
        <div className="flex flex-col items-center justify-center w-full px-4">
            <p className="font-bold text-3xl w-full max-w-5xl py-12">เลือกเวลาที่ท่านต้องการจะจอง</p>

            <div className="flex flex-wrap gap-4 w-full max-w-5xl rounded-lg
                            items-center justify-center">

            {Array.from({ length: 11 }, (_, i) => (
                <TimeCard key={i} time={(10 + i).toString()} />
            ))}

            </div>
        </div>
    )
}