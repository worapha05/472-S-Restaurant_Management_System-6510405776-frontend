import Table from "@/components/Reservation/Table"

async function getData() {
    const res = await fetch("http:///omnidine-backend-laravel.test-1/api/tables")

    if (!res.ok) {
        throw new Error('Failed to fetch data')
    }
    
    const data = await res.json();

    console.log(data);

    return data.data || [];
}

export default async function ShowTables() {

    const tables = await getData();

    return (
        <div className="flex flex-col items-center justify-center w-full px-4">
            <p className="font-bold text-3xl w-full max-w-5xl py-12">Tables</p>

            <div className="flex flex-wrap gap-4 w-full max-w-5xl">

                {tables.length > 0 ? (
                    tables.map((table: any) => (
                        <Table key={table.id} id={table.id} seats={table.seats} />
                    ))
                ) : (
                    <p>No tables available</p>
                )}

            </div>
        </div>
    )
}