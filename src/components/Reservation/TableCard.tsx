'use client';

export default function Table({ id, seats }: { id: string; seats: number;}) {
    return (
        <div
            className="flex flex-col gap-2 rounded-xl w-full max-w-xs border-2 border-primary p-6
                        shadow-md items-center justify-center hover:cursor-pointer hover:shadow-2xl hover:scale-105"
        >
            <p className="font-bold text-2xl">Table {id}</p>
            <p>{seats} Seats</p>
        </div>
    );
}