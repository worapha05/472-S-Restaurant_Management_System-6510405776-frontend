export default function Table({ id, seats }: { id: string, seats: number}) {
        return (
            <div className="flex flex-col gap-2 rounded-2xl w-full max-w-xs border-2 border-primary p-6 shadow-lg items-center justify-center">
                <p className="font-bold text-2xl">Table {id}</p>
                
                <p>{seats} Seats</p>
            </div>  
        )
    }