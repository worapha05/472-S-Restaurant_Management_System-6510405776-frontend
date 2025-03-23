'use client';

import { useState } from "react";

async function changeReservationStatus({ id, status }: { id: string; status: string }) {
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

        alert(`เปลี่ยนสถานะการจองโต๊ะที่ ${id} เป็น ${status} สำเร็จ`);

        const resJson = await res.json();
        return resJson.data;
        
    } catch (error) {
        console.error('Reservation error:', error);
        alert("ไม่สามารถเปลี่ยนสถานะการจองได้ กรุณาลองใหม่อีกครั้ง");
    }
}

const getStatusColor = (status: string): string => {
    switch (status.toUpperCase()) {
        case 'PENDING': return 'bg-orange-100 text-orange-700';
        case 'CONFIRMED': return 'bg-green-100 text-green-700';
        case 'CANCELLED': return 'bg-red-100 text-red-700';
        default: return 'bg-gray-100 text-gray-700';
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

export default function ReservationCard({ reservation }: { reservation: Reservation }) {
    const [currentStatus, setCurrentStatus] = useState(reservation.status);
    const [isUpdating, setIsUpdating] = useState(false);

    const handleStatusChange = async (status: string) => {
        const confirmMessage = status === "CONFIRMED" 
            ? "คุณแน่ใจหรือไม่ว่าต้องการอนุมัติการจองนี้?" 
            : "คุณแน่ใจหรือไม่ว่าต้องการปฏิเสธการจองนี้?";
        
        if (window.confirm(confirmMessage)) {
            setIsUpdating(true);
            const updatedReservation = await changeReservationStatus({ id: reservation.id, status });
            setIsUpdating(false);

            if (updatedReservation) {
                setCurrentStatus(updatedReservation.status); // Update UI instantly
            }
        }
    };

    return (
        <div className="w-full bg-white rounded-xl border border-neutral-200 overflow-hidden hover:shadow-md transition-all">
            <div className="p-4">
                {/* Header with status and table info */}
                <div className="flex justify-between items-center mb-4">
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(currentStatus)}`}>
                        {currentStatus}
                    </div>
                    <div className="bg-primary-50 text-primary-700 px-3 py-1 rounded-lg text-sm font-medium">
                        โต๊ะที่ {reservation.table_id}
                    </div>
                </div>
                
                {/* Reservation details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="flex flex-col">
                        <div className="flex items-center mb-2">
                            <span className="material-symbols-outlined text-neutral-500 mr-2">person</span>
                            <span className="text-sm text-neutral-500">ผู้จอง:</span>
                            <span className="ml-2 bg-accent px-2 py-0.5 rounded text-white text-sm">
                                {reservation.user_id}
                            </span>
                        </div>
                        <div className="flex items-center">
                            <span className="material-symbols-outlined text-neutral-500 mr-2">event</span>
                            <span className="text-sm text-neutral-500">วันที่จอง:</span>
                            <time className="ml-2 text-sm" dateTime={reservation.created_at}>
                                {formatUserFriendlyTime(reservation.created_at)}
                            </time>
                        </div>
                    </div>
                    
                    <div className="flex flex-col items-start md:items-end">
                        <p className="text-sm text-neutral-500 mb-1">เวลาที่จอง:</p>
                        <time className="font-medium text-lg text-neutral-800" dateTime={reservation.appointment_time}>
                            {formatUserFriendlyTime(reservation.appointment_time)}
                        </time>
                    </div>
                </div>
                
                {/* Action buttons */}
                <div className="flex justify-end space-x-3 pt-3 border-t border-neutral-100">
                    <button
                        onClick={() => handleStatusChange("CONFIRMED")}
                        disabled={isUpdating || currentStatus === "CONFIRMED" || currentStatus === "CANCELLED"}
                        className={`px-4 py-2 rounded-lg flex items-center ${
                            isUpdating || currentStatus === "CONFIRMED" || currentStatus === "CANCELLED"
                                ? "bg-neutral-100 text-neutral-400 cursor-not-allowed"
                                : "bg-green-500 hover:bg-green-600 text-white"
                        } transition-colors`}
                    >
                        <span className="material-symbols-outlined mr-1 text-sm">check_circle</span>
                        อนุมัติ
                    </button>

                    <button
                        onClick={() => handleStatusChange("CANCELLED")}
                        disabled={isUpdating || currentStatus === "CANCELLED"}
                        className={`px-4 py-2 rounded-lg flex items-center ${
                            isUpdating || currentStatus === "CANCELLED"
                                ? "bg-neutral-100 text-neutral-400 cursor-not-allowed"
                                : "bg-red-500 hover:bg-red-600 text-white"
                        } transition-colors`}
                    >
                        <span className="material-symbols-outlined mr-1 text-sm">cancel</span>
                        ปฏิเสธ
                    </button>
                </div>
            </div>
        </div>
    );
}