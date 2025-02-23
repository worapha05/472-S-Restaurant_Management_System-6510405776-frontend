'use client';

async function makeReservation({ id, time }: { id: string; time: string }) {
    try {
        const currentDate = new Date().toISOString().split("T")[0];
        const appointmentTime = `${currentDate}T${String(Number(time)).padStart(2, "0")}:00:00`;

        const body = {
            user_id: 1, // TO DO: Get UID From Token Login User
            table_id: id,
            appointment_time: appointmentTime,
        };
        
        const res = await fetch("http://localhost/api/reservations", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });

        if (!res.ok) {
            // Log the error response
            const errorText = await res.text();
            console.error('Server error response:', errorText);
            throw new Error(`HTTP error! status: ${res.status}`);
        }

        alert(`Reservation confirmed for Table ${id} at ${appointmentTime}`);
        return await res.json();
        
    } catch (error) {
        console.error('Reservation error:', error);
        alert("Failed to make a reservation. Please try again.");
    }
}

export default function Table({ id, seats, time }: { id: string; seats: number; time: string }) {
    // Make handleReservation async
    const handleReservation = async () => {
        const confirm = window.confirm(`Do you want to reserve Table ${id} at ${time}:00?`);
        if (confirm) {
            try {
                await makeReservation({ id, time });
            } catch (error) {
                console.error('Error in handleReservation:', error);
            }
        }
    };

    return (
        <div
            className="flex flex-col gap-2 rounded-xl w-full max-w-xs border-2 border-primary p-6
                        shadow-md items-center justify-center hover:cursor-pointer hover:shadow-2xl hover:scale-105"
            onClick={handleReservation}
        >
            <p className="font-bold text-2xl">Table {id}</p>
            <p>{seats} Seats</p>
        </div>
    );
}