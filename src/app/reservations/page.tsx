import ReservationCard from "@/components/Reservation/ReservationCard";

async function getData() {
    const res = await fetch("http://omnidine-backend-laravel.test-1/api/reservations");

    if (!res.ok) {
        throw new Error('Failed to fetch data');
    }    
    const resJson = await res.json();
    console.log("Fetched Data:", resJson);
    return resJson.data || [];
}

export default async function ReservationsPage() {

    const reservations = await getData();

    return (
        <div className="flex flex-col items-center justify-center w-full px-4">
            <div className="flex flex-col gap-4 w-full max-w-5xl">
                <p className="font-bold text-3xl w-full max-w-5xl py-12">รายการการจอง</p>

                <div className="flex flex-wrap gap-4 w-full max-w-5xl rounded-lg
                                items-center justify-center">

                    {reservations.map((reservation : any) => (
                        <ReservationCard key={reservation.id} reservation={reservation} />
                    ))}

                </div>
            </div>
        </div>
    );
}