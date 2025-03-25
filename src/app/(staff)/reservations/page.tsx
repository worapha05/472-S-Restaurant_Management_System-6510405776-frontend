'use client';

import { useState, useEffect } from "react";
import ReservationCard from "@/components/Reservation/ReservationCard";

// Type definition for reservation objects
interface Reservation {
    appointment_time: string;
    date: string;
    id: string;
    status: string;
    table_id: string;
    created_at: string;
    user_id: string;
}

// Server component for data fetching
async function getData() {
    const res = await fetch(`${process.env.NEXT_PUBLIC_CLIENT_API_URL}/api/reservations`);

    if (!res.ok) {
        throw new Error('Failed to fetch data');
    }    
    const resJson = await res.json();
    console.log("Fetched Data:", resJson);
    return resJson.data || [];
}

// Client component for the reservations page with filtering
export default function ReservationsPage() {
    // Fix: Initialize with proper typing
    const [reservations, setReservations] = useState<Reservation[]>([]);
    const [filteredReservations, setFilteredReservations] = useState<Reservation[]>([]);
    const [loading, setLoading] = useState(true);
    const [dateFilter, setDateFilter] = useState("all");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    // Fetch reservations data
    useEffect(() => {
        async function fetchData() {
            try {
                setLoading(true);
                const data = await getData();
                setReservations(data);
                setFilteredReservations(data);
            } catch (error) {
                console.error("Error fetching reservations:", error);
            } finally {
                setLoading(false);
            }
        }
        
        fetchData();
    }, []);

    // Apply date filters when they change
    useEffect(() => {
        filterReservations();
    }, [dateFilter, startDate, endDate, reservations]);

    // Filter reservations based on date filter
    const filterReservations = () => {
        if (!reservations.length) return;

        let filtered = [...reservations];
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        switch (dateFilter) {
            case "today":
                filtered = reservations.filter(res => {
                    const appointmentDate = new Date(res.appointment_time);
                    return (
                        appointmentDate.getDate() === today.getDate() &&
                        appointmentDate.getMonth() === today.getMonth() &&
                        appointmentDate.getFullYear() === today.getFullYear()
                    );
                });
                break;
                
            case "tomorrow":
                const tomorrow = new Date(today);
                tomorrow.setDate(tomorrow.getDate() + 1);
                filtered = reservations.filter(res => {
                    const appointmentDate = new Date(res.appointment_time);
                    return (
                        appointmentDate.getDate() === tomorrow.getDate() &&
                        appointmentDate.getMonth() === tomorrow.getMonth() &&
                        appointmentDate.getFullYear() === tomorrow.getFullYear()
                    );
                });
                break;
                
            case "thisWeek":
                const endOfWeek = new Date(today);
                endOfWeek.setDate(today.getDate() + (7 - today.getDay()));
                filtered = reservations.filter(res => {
                    const appointmentDate = new Date(res.appointment_time);
                    return appointmentDate >= today && appointmentDate <= endOfWeek;
                });
                break;
                
            case "custom":
                if (startDate) {
                    const startDateTime = new Date(startDate);
                    filtered = filtered.filter(res => {
                        const appointmentDate = new Date(res.appointment_time);
                        return appointmentDate >= startDateTime;
                    });
                }
                
                if (endDate) {
                    const endDateTime = new Date(endDate);
                    endDateTime.setHours(23, 59, 59, 999);
                    filtered = filtered.filter(res => {
                        const appointmentDate = new Date(res.appointment_time);
                        return appointmentDate <= endDateTime;
                    });
                }
                break;
                
            default:
                // "all" - no filtering needed
                break;
        }
        
        setFilteredReservations(filtered);
    };

    return (
        <div className="flex flex-col items-center justify-center w-full px-4">
            <div className="flex flex-col gap-4 w-full max-w-5xl">
                <div className="flex justify-between items-center w-full max-w-5xl py-12">
                    <p className="font-bold text-3xl">รายการการจอง</p>
                    
                    <button className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg flex items-center">
                        <span className="mr-2">+</span>
                        เพิ่มการจอง
                    </button>
                </div>

                {/* Date Filter Controls */}
                <div className="bg-white p-4 rounded-xl shadow-sm mb-4 w-full">
                    <div className="flex flex-col space-y-4">
                        <div className="flex flex-wrap gap-2">
                            <button 
                                onClick={() => setDateFilter("all")}
                                className={`px-4 py-2 rounded-lg ${dateFilter === "all" 
                                    ? "bg-primary-600 text-white" 
                                    : "bg-gray-100 hover:bg-gray-200"}`}
                            >
                                ทั้งหมด
                            </button>
                            <button 
                                onClick={() => setDateFilter("today")}
                                className={`px-4 py-2 rounded-lg ${dateFilter === "today" 
                                    ? "bg-primary-600 text-white" 
                                    : "bg-gray-100 hover:bg-gray-200"}`}
                            >
                                วันนี้
                            </button>
                            <button 
                                onClick={() => setDateFilter("tomorrow")}
                                className={`px-4 py-2 rounded-lg ${dateFilter === "tomorrow" 
                                    ? "bg-primary-600 text-white" 
                                    : "bg-gray-100 hover:bg-gray-200"}`}
                            >
                                พรุ่งนี้
                            </button>
                            <button 
                                onClick={() => setDateFilter("thisWeek")}
                                className={`px-4 py-2 rounded-lg ${dateFilter === "thisWeek" 
                                    ? "bg-primary-600 text-white" 
                                    : "bg-gray-100 hover:bg-gray-200"}`}
                            >
                                สัปดาห์นี้
                            </button>
                            <button 
                                onClick={() => setDateFilter("custom")}
                                className={`px-4 py-2 rounded-lg ${dateFilter === "custom" 
                                    ? "bg-primary-600 text-white" 
                                    : "bg-gray-100 hover:bg-gray-200"}`}
                            >
                                กำหนดเอง
                            </button>
                        </div>
                        
                        {dateFilter === "custom" && (
                            <div className="flex flex-wrap gap-4">
                                <div className="flex flex-col">
                                    <label className="text-sm text-gray-600 mb-1">จากวันที่</label>
                                    <input 
                                        type="date" 
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        className="border border-gray-300 rounded-lg px-3 py-2"
                                    />
                                </div>
                                <div className="flex flex-col">
                                    <label className="text-sm text-gray-600 mb-1">ถึงวันที่</label>
                                    <input 
                                        type="date" 
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                        className="border border-gray-300 rounded-lg px-3 py-2"
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
                    </div>
                ) : (
                    <>
                        {filteredReservations.length > 0 ? (
                            <div className="flex flex-wrap gap-4 w-full max-w-5xl rounded-lg
                                            items-center justify-center">
                                {filteredReservations.map((reservation) => (
                                    <ReservationCard key={reservation.id} reservation={reservation} />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12 bg-white rounded-xl shadow-sm w-full">
                                <p className="text-gray-500">ไม่พบรายการจอง</p>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}