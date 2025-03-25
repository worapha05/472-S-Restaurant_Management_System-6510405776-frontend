'use client';

import { useState } from "react";

async function changeReservationStatus({ id, status }: { id: string; status: string }) {
    try {
        const body = {
            status: status
        };
        
        const res = await fetch(`${process.env.NEXT_PUBLIC_CLIENT_API_URL}/api/reservations/${id}`, {
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
        case 'NOT_ARRIVED': return 'bg-red-100 text-red-700';
        case 'ARRIVED': return 'bg-blue-100 text-blue-700';
        default: return 'bg-gray-100 text-gray-700';
    }
};

const getStatusText = (status: string): string => {
    switch (status.toUpperCase()) {
        case 'PENDING': return 'รอยืนยัน';
        case 'CONFIRMED': return 'ยืนยันแล้ว';
        case 'CANCELLED': return 'ยกเลิก';
        case 'NOT_ARRIVED': return 'ไม่มา';
        case 'ARRIVED': return 'มาแล้ว';
        default: return status;
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
    const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
    const [isUpdating, setIsUpdating] = useState(false);
    const [showStatusModal, setShowStatusModal] = useState(false);

    // Status options
    const statusOptions = ['PENDING', 'CONFIRMED', 'CANCELLED', 'NOT_ARRIVED', 'ARRIVED'];

    const handleStatusSelect = (status: string) => {
        setSelectedStatus(status);
    };

    const confirmStatusChange = async () => {
        if (!selectedStatus) return;
        
        setIsUpdating(true);
        const updatedReservation = await changeReservationStatus({ 
            id: reservation.id, 
            status: selectedStatus 
        });
        setIsUpdating(false);
        setShowStatusModal(false);

        if (updatedReservation) {
            setCurrentStatus(updatedReservation.status); // Update UI instantly
        }
        
        // Reset selected status
        setSelectedStatus(null);
    };

    const cancelStatusChange = () => {
        setSelectedStatus(null);
        setShowStatusModal(false);
    };

    // SVG Icons
    const PersonIcon = () => (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-secondary" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
        </svg>
    );

    const CalendarIcon = () => (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-secondary" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
        </svg>
    );

    const ClockIcon = () => (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-secondary" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
        </svg>
    );
    
    const EditIcon = () => (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
            <path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" />
        </svg>
    );

    return (
        <div className="w-full bg-white rounded-xl border border-neutral-200 shadow-sm hover:shadow-md transition-all">
            <div className="p-6">
                {/* Header with table number and status */}
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-5 border-b border-gray-100 pb-4">
                    <div className="flex items-center">
                        <div className="bg-primary-50 text-primary-700 px-4 py-2 rounded-lg text-base font-medium mr-3">
                            โต๊ะที่ {reservation.table_id}
                        </div>
                        <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(currentStatus)}`}>
                            {getStatusText(currentStatus)}
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="text-sm bg-gray-100 px-3 py-1.5 rounded-md text-secondary border border-gray-200">
                            <span className="font-medium">รหัสการจอง:</span> {reservation.id}
                        </div>
                        <button 
                            onClick={() => setShowStatusModal(true)}
                            disabled={isUpdating}
                            className="flex items-center gap-2 px-4 py-2 bg-button text-white rounded-lg hover:bg-hoverButton transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                        >
                            <EditIcon />
                            <span>เปลี่ยนสถานะ</span>
                        </button>
                    </div>
                </div>
                
                {/* Reservation details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center">
                            <PersonIcon />
                            <span className="text-sm text-secondary font-medium ml-2">ผู้จอง:</span>
                            <span className="ml-2 bg-accent px-3 py-1 rounded text-white text-sm">
                                {reservation.user_name} | ID: {reservation.user_id}
                            </span>
                        </div>
                        <div className="flex items-center">
                            <CalendarIcon />
                            <span className="text-sm text-secondary font-medium ml-2">วันที่จอง:</span>
                            <time className="ml-2 text-sm text-mainText" dateTime={reservation.created_at}>
                                {formatUserFriendlyTime(reservation.created_at)}
                            </time>
                        </div>
                    </div>
                    
                    <div className="flex flex-col border-l border-gray-100 pl-6">
                        <div className="flex items-center mb-2">
                            <ClockIcon />
                            <span className="text-sm text-secondary font-medium ml-2">เวลาที่จอง:</span>
                        </div>
                        <time className="font-medium text-lg text-mainText" dateTime={reservation.appointment_time}>
                            {formatUserFriendlyTime(reservation.appointment_time)}
                        </time>
                    </div>
                </div>
                
                {/* Status update info */}
                {isUpdating && (
                    <div className="flex items-center justify-center py-3 mt-4 text-sm text-secondary bg-gray-50 rounded-lg">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-secondary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        กำลังอัปเดตสถานะ...
                    </div>
                )}
            </div>

            {/* Change Status Modal */}
            {showStatusModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
                        <div className="flex justify-between items-center mb-5 pb-3 border-b border-gray-100">
                            <h3 className="text-lg font-medium text-mainText">เปลี่ยนสถานะการจอง</h3>
                            <button 
                                onClick={cancelStatusChange}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        
                        {/* Status Dropdown */}
                        <div className="mb-6">
                            <label htmlFor="status-select" className="block text-sm font-medium text-secondary mb-2">
                                เลือกสถานะใหม่:
                            </label>
                            <select
                                id="status-select"
                                value={selectedStatus || currentStatus}
                                onChange={(e) => handleStatusSelect(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-inputFieldFocus focus:border-inputFieldFocus"
                            >
                                {statusOptions.map((status) => (
                                    <option key={status} value={status}>
                                        {getStatusText(status)}
                                    </option>
                                ))}
                            </select>
                        </div>
                        
                        {/* Status Preview */}
                        {selectedStatus && selectedStatus !== currentStatus && (
                            <div className="mb-6 bg-gray-50 p-4 rounded-lg">
                                <p className="text-secondText text-sm mb-3 font-medium">ตัวอย่างการเปลี่ยนแปลง:</p>
                                <div className="flex items-center space-x-3">
                                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(currentStatus)}`}>
                                        {getStatusText(currentStatus)}
                                    </div>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                    </svg>
                                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedStatus)}`}>
                                        {getStatusText(selectedStatus)}
                                    </div>
                                </div>
                            </div>
                        )}
                        
                        <div className="flex justify-end space-x-3">
                            <button 
                                onClick={cancelStatusChange}
                                className="px-5 py-2 text-sm font-medium text-cancelRed bg-white border border-cancelRed rounded-lg hover:bg-cancelRed hover:text-white transition-colors"
                            >
                                ยกเลิก
                            </button>
                            <button 
                                onClick={confirmStatusChange}
                                disabled={!selectedStatus || selectedStatus === currentStatus}
                                className={`px-5 py-2 text-sm font-medium text-white rounded-lg transition-colors ${(!selectedStatus || selectedStatus === currentStatus) ? 'bg-gray-400 cursor-not-allowed' : 'bg-acceptGreen hover:bg-hoverAccept'}`}
                            >
                                ยืนยัน
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}