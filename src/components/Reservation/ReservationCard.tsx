'use client';

interface Reservation {
    appointment_time: string;
    date: string;
    id: string;
    status: string;
    table_id: string;
    created_at: string;
    user_id: string;
}

async function chageReservationStatus({ id, status }: { id: string; status: string }) {
    try {
        const body = {
            status: status
        };
        
        const res = await fetch(`http://localhost/api/reservations/${id}`, {
            method: 'PUT',
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

        alert(`Changeed Reservation Status confirmed for Table ${id} to ${status}`);
        return await res.json();
        
    } catch (error) {
        console.error('Reservation error:', error);
        alert("Failed to change a reservation status. Please try again.");
    }
}

export default function ReservationCard({ reservation }: { reservation: Reservation }) {

    const getStatusColor = (status: string): string => {
        switch (status.toLowerCase()) {
            case 'pending': return 'bg-yellow-500 text-white';
            case 'confirmed': return 'bg-green-500 text-white';
            case 'cancelled': return 'bg-red-500 text-white';
            default: return 'bg-gray-500 text-white';
        }
    };

    // Format the time for better UX/UI
    function formatUserFriendlyTime(datetime: string): string {
        const date = new Date(datetime.replace(" ", "T")); // Ensure proper Date conversion

        return date.toLocaleString("th-TH", {
            weekday: "long",  // พฤหัสบดี
            year: "numeric",  // 2025
            month: "long",    // กุมภาพันธ์
            day: "2-digit",   // 20
            hour: "2-digit",  // 10 AM
            minute: "2-digit",
        });
    }

    // function formatUserFriendlyTime(datetime: string): string {
    //     const date = new Date(datetime);  
    //     date.setHours(date.getHours() + 7); // Adjust to UTC+7
    
    //     return date.toLocaleString("th-TH", {
    //         weekday: "long",  // วันอาทิตย์
    //         day: "numeric",   // 23
    //         month: "long",    // กุมภาพันธ์
    //         year: "numeric",  // 2025
    //         hour: "2-digit",  // 18
    //         minute: "2-digit",
    //         hour12: true,     // แสดง AM/PM
    //     });
    // }

    const handleStatusChange = async (status: string) => {
        const confirmMessage = status === "CONFIRMED" ? "คุณแน่ใจหรือไม่ว่าต้องการอนุมัติการจองนี้?" : "คุณแน่ใจหรือไม่ว่าต้องการปฏิเสธการจองนี้?";
        
        if (window.confirm(confirmMessage)) {
            await chageReservationStatus({ id: reservation.id, status });
            // Optional: Add state management or refresh logic here
        }
    };

    return (
        <div className="px-6 py-8 w-full rounded-xl shadow-lg border border-primary hover:scale-105 hover:shadow-xl">
            {/* Header with Status and Type */}
            <div className="px-6 py-1 flex justify-between items-center">
                <div className={`px-3 py-1 rounded-full ${getStatusColor(reservation.status)}`}>
                    {reservation.status}
                </div>
                <div className="px-3 py-1 rounded-full font-bold breservation breservation-primary">
                    โต๊ะที่: {reservation.table_id}
                </div>
            </div>

            <div className="px-6 py-1 flex justify-between items-center">
                
                <div className="flex flex-col gap-2 text-mainText">
                    <div className="flex items-center gap-2">
                        <span>ผู้จอง:</span>
                        <code className="bg-accent px-2 py-0.5 rounded text-white">
                            {reservation.user_id}
                        </code>
                    </div>
                    <div className="flex items-center gap-2">
                        <svg className="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                            <path fillRule="evenodd" d="M5 5a1 1 0 0 0 1-1 1 1 0 1 1 2 0 1 1 0 0 0 1 1h1a1 1 0 0 0 1-1 1 1 0 1 1 2 0 1 1 0 0 0 1 1h1a1 1 0 0 0 1-1 1 1 0 1 1 2 0 1 1 0 0 0 1 1 2 2 0 0 1 2 2v1a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7a2 2 0 0 1 2-2ZM3 19v-7a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Zm6.01-6a1 1 0 1 0-2 0 1 1 0 0 0 2 0Zm2 0a1 1 0 1 1 2 0 1 1 0 0 1-2 0Zm6 0a1 1 0 1 0-2 0 1 1 0 0 0 2 0Zm-10 4a1 1 0 1 1 2 0 1 1 0 0 1-2 0Zm6 0a1 1 0 1 0-2 0 1 1 0 0 0 2 0Zm2 0a1 1 0 1 1 2 0 1 1 0 0 1-2 0Z" clipRule="evenodd"/>
                        </svg>
                        <time dateTime={reservation.created_at}>
                            {reservation.created_at}
                        </time>
                    </div>
                </div>

                <div className="text-right">
                    <p className="text-secondary">เวลาที่จอง:</p>

                    <div className="flex items-center gap-2">
                        <svg className="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                            <path fillRule="evenodd" d="M5 5a1 1 0 0 0 1-1 1 1 0 1 1 2 0 1 1 0 0 0 1 1h1a1 1 0 0 0 1-1 1 1 0 1 1 2 0 1 1 0 0 0 1 1h1a1 1 0 0 0 1-1 1 1 0 1 1 2 0 1 1 0 0 0 1 1 2 2 0 0 1 2 2v1a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7a2 2 0 0 1 2-2ZM3 19v-7a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Zm6.01-6a1 1 0 1 0-2 0 1 1 0 0 0 2 0Zm2 0a1 1 0 1 1 2 0 1 1 0 0 1-2 0Zm6 0a1 1 0 1 0-2 0 1 1 0 0 0 2 0Zm-10 4a1 1 0 1 1 2 0 1 1 0 0 1-2 0Zm6 0a1 1 0 1 0-2 0 1 1 0 0 0 2 0Zm2 0a1 1 0 1 1 2 0 1 1 0 0 1-2 0Z" clipRule="evenodd"/>
                        </svg>
                        <time className="font-bold" dateTime={reservation.appointment_time}>
                            {formatUserFriendlyTime(reservation.appointment_time)}
                        </time>
                    </div>
                </div>

            </div>

            <div className="px-6 py-1 flex justify-end items-center gap-4">
                <button
                    onClick={() => handleStatusChange("CONFIRMED")}
                    className="px-4 py-2 rounded-lg bg-acceptGreen hover:bg-hoverAccept text-white">
                    อนุมัติ
                </button>

                <button
                    onClick={() => handleStatusChange("CANCELLED")}
                    className="px-4 py-2 rounded-lg bg-cancelRed hover:bg-hoverCancel text-white">
                    ปฏิเสธ
                </button>
            </div>
        </div>
    );
}