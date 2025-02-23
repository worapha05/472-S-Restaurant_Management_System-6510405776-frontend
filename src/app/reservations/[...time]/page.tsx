import Table from "@/components/Reservation/TableCard";

async function getData() {
    const res = await fetch("http://omnidine-backend-laravel.test-1/api/tables");

    if (!res.ok) {
        throw new Error('Failed to fetch data');
    }

    const resJson = await res.json();
    console.log("Fetched Data:", resJson);
    return resJson.data || [];
}

export default async function ReservationPage({ params }: { params: { time: string } }) {

    const tables = await getData();

    return (
        <div className="flex flex-col items-center justify-center w-full">
            <div className="py-12 flex flex-col items-center justify-center max-w-5xl gap-6">
                <p className="text-xl">เวลาที่ท่านเลือกจองคือ {params.time}:00</p>

                <div className="flex flex-wrap gap-4 w-full max-w-5xl rounded-lg
                                items-center justify-center">

                    {tables.map((table : any) => (
                        <Table key={table.id} id={table.id} seats={table.seats} time={params.time} />
                    ))}
                </div>
            </div>
        </div>
    );
}