'use client';

import { useState, useEffect } from "react";
import ReservationCard from "@/components/Reservation/ReservationCard";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

// Client component for the reservations page with filtering
export default function ReservationsPage() {
    // Fix: Initialize with proper typing
    const { data: session, status } = useSession();
    const router = useRouter();
    const [reservations, setReservations] = useState<Reservation[]>([]);
    const [filteredReservations, setFilteredReservations] = useState<Reservation[]>([]);
    const [loading, setLoading] = useState(true);
    
    // Date filter state
    const [dateFilter, setDateFilter] = useState("all");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    
    // Status filter
    const [statusFilter, setStatusFilter] = useState("all");

    // Status options with translations
    const statusOptions = [
        { value: "all", label: "ทั้งหมด" },
        { value: "confirmed", label: "ยืนยันแล้ว" },
        { value: "pending", label: "รอยืนยัน" },
        { value: "completed", label: "เสร็จสิ้น" },
        { value: "cancelled", label: "ยกเลิก" }
    ];

    // Get status text based on status value
    const getStatusText = (status: string) => {
        const option = statusOptions.find(opt => opt.value.toLowerCase() === status.toLowerCase());
        return option ? option.label : status;
    };

    useEffect(() => {
        // Redirect to login if not authenticated
        if (status === 'unauthenticated') {
            router.push('/login');
        }
    }, [status, router]);

    // Fetch reservations data - only when session is authenticated
    useEffect(() => {
        async function fetchData() {
            try {
                setLoading(true);

                if (status !== 'authenticated' || !session?.user?.accessToken) {
                    // Don't attempt to fetch if we don't have a session yet
                    return;
                }

                const res = await fetch(`${process.env.NEXT_PUBLIC_CLIENT_API_URL}/api/reservations`, {
                    headers: {
                        'Authorization': `Bearer ${session.user.accessToken}`,
                    }
                });

                if (!res.ok) {
                    throw new Error('Failed to fetch data');
                }    
                const resJson = await res.json();
                console.log("Fetched Data:", resJson);
                const data = resJson.data || [];

                setReservations(data);
                setFilteredReservations(data);
            } catch (error) {
                console.error("Error fetching reservations:", error);
            } finally {
                setLoading(false);
            }
        }
        
        fetchData();
    }, [session, status]);

    // Apply date and status filters when they change
    useEffect(() => {
        filterReservations();
    }, [dateFilter, statusFilter, startDate, endDate, reservations]);

    // Filter reservations based on date and status filter
    const filterReservations = () => {
        if (!reservations.length) return;

        let filtered = [...reservations];
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        // Apply date filter
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
                // "all" - no date filtering needed
                break;
        }
        
        // Apply status filter
        if (statusFilter !== "all") {
            filtered = filtered.filter(res => 
                res.status.toLowerCase() === statusFilter.toLowerCase()
            );
        }
        
        setFilteredReservations(filtered);
    };

    // Count reservations by status
    const getStatusCount = (status: string) => {
        if (status === "all") return reservations.length;
        
        return reservations.filter(res => 
            res.status.toLowerCase() === status.toLowerCase()
        ).length;
    };

    return (
        <div className="flex flex-col items-center justify-center w-full px-4">
            <div className="flex flex-col gap-4 w-full max-w-5xl">
                <div className="flex justify-between items-center w-full max-w-5xl py-12">
                    <p className="font-bold text-3xl text-mainText">รายการการจอง</p>
                    
                    <button className="bg-button hover:bg-hoverButton text-white px-4 py-2 rounded-lg flex items-center">
                        <span className="mr-2">+</span>
                        เพิ่มการจอง
                    </button>
                </div>

                {/* Filter Controls */}
                <div className="bg-background p-6 rounded-xl shadow-sm mb-4 w-full border border-searchBox">
                    <div className="flex flex-col space-y-5">
                        {/* Date Filter Label */}
                        <div className="flex items-center">
                            <div className="w-7 h-7 bg-searchBox rounded-full flex items-center justify-center text-mainText mr-2">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <span className="font-medium text-mainText">กรองตามวันที่</span>
                        </div>
                    
                        {/* Date Filter Buttons */}
                        <div className="flex flex-wrap gap-2">
                            {[
                                { id: "all", label: "ทั้งหมด" },
                                { id: "today", label: "วันนี้" },
                                { id: "tomorrow", label: "พรุ่งนี้" },
                                { id: "thisWeek", label: "สัปดาห์นี้" },
                                { id: "custom", label: "กำหนดเอง" }
                            ].map((option) => (
                                <button 
                                    key={option.id}
                                    onClick={() => setDateFilter(option.id)}
                                    className={`px-4 py-2 rounded-lg transition-colors ${
                                        dateFilter === option.id 
                                            ? "bg-button text-white" 
                                            : "bg-searchBox text-primary hover:bg-hoverButton hover:text-white"
                                    }`}
                                >
                                    {option.label}
                                </button>
                            ))}
                        </div>
                        
                        {/* Custom Date Inputs */}
                        {dateFilter === "custom" && (
                            <div className="flex flex-wrap gap-4 pt-2">
                                <div className="flex flex-col">
                                    <label className="text-sm text-secondText mb-1">จากวันที่</label>
                                    <input 
                                        type="date" 
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        className="border border-searchBox rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-inputFieldFocus"
                                    />
                                </div>
                                <div className="flex flex-col">
                                    <label className="text-sm text-secondText mb-1">ถึงวันที่</label>
                                    <input 
                                        type="date" 
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                        className="border border-searchBox rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-inputFieldFocus"
                                    />
                                </div>
                            </div>
                        )}
                        
                        {/* Status Filter Label */}
                        <div className="flex items-center pt-2">
                            <div className="w-7 h-7 bg-searchBox rounded-full flex items-center justify-center text-mainText mr-2">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <span className="font-medium text-mainText">กรองตามสถานะ</span>
                        </div>
                        
                        {/* Status Filter Buttons */}
                        <div className="flex flex-wrap gap-2">
                            {statusOptions.map((option) => (
                                <button 
                                    key={option.value}
                                    onClick={() => setStatusFilter(option.value)}
                                    className={`px-4 py-2 rounded-lg transition-colors ${
                                        statusFilter === option.value 
                                            ? "bg-button text-white" 
                                            : "bg-searchBox text-primary hover:bg-hoverButton hover:text-white"
                                    }`}
                                >
                                    {option.label}
                                    {option.value !== "all" && (
                                        <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-white text-primary">
                                            {getStatusCount(option.value)}
                                        </span>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {status === 'loading' || loading ? (
                    <div className="flex justify-center items-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-inputFieldFocus"></div>
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
                            <div className="text-center py-12 bg-background rounded-xl shadow-sm w-full border border-searchBox">
                                <p className="text-secondText">ไม่พบรายการจอง</p>
                                {(dateFilter !== "all" || statusFilter !== "all") && (
                                    <button 
                                        onClick={() => {
                                            setDateFilter("all");
                                            setStatusFilter("all");
                                        }}
                                        className="mt-2 text-inputFieldFocus hover:underline"
                                    >
                                        ล้างตัวกรอง
                                    </button>
                                )}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}