'use client';

import { useState, useEffect } from "react";
import TimeCard from "@/components/Reservation/TimeCard";
import Table from "@/components/Reservation/TableCard";
import Loading from "@/components/Loading";

export default function ShowTimeSlots() {
    const [date, setDate] = useState<Date | null>(null);
    const [time, setTime] = useState<string>("");
    const [table_id, setTable_id] = useState<string>("");
    const [tables, setTables] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [completedSteps, setCompletedSteps] = useState({
        date: false,
        time: false,
        table: false
    });

    async function getData() {
        try {
            const res = await fetch(`http://localhost/api/tables`);
            if (!res.ok) {
                throw new Error('Failed to fetch data');
            }
            const resJson = await res.json();
            return resJson.data || [];
        } catch (error) {
            console.error("Error fetching tables:", error);
            return [];
        }
    }

    useEffect(() => {
        async function fetchData() {
            setIsLoading(true);
            const fetchedTables = await getData();
            setTables(fetchedTables);
            setIsLoading(false);
        }

        fetchData();
    }, []);

    const handleDateSelect = (selectedDate: Date) => {
        setDate(selectedDate);
        setCompletedSteps(prev => ({...prev, date: true}));
    };

    const handleTimeSelect = (selectedTime: string) => {
        setTime(selectedTime);
        setCompletedSteps(prev => ({...prev, time: true}));
    };

    const handleTableSelect = (selectedTableId: string) => {
        setTable_id(selectedTableId);
        setCompletedSteps(prev => ({...prev, table: true}));
    };

    async function makeReservation() {
        try {
            const appointmentTime = `${date?.getFullYear()}-${Number(date?.getMonth()) +1}-${date?.getDate()} ${String(Number(time)).padStart(2, "0")}:00:00`;
            
            const body = {
                user_id: 1, // TO DO: Get UID From Token Login User
                table_id: Number(table_id),
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
    
            const resJson = await res.json();
            return resJson.data;
            
        } catch (error) {
            console.error('Reservation error:', error);
            alert("Failed to make a reservation. Please try again.");
        }
    }

    const handleReservation = async () => {
        if (!date || !time || !table_id) {
            alert("กรุณาเลือกข้อมูลให้ครบถ้วน");
            return;
        }

        const confirm = window.confirm(`ยืนยันการจองโต๊ะ ${table_id} เวลา ${time}:00 วันที่ ${date.toLocaleDateString()}?`);
        if (confirm) {
            try {
                const res = await makeReservation();
                alert("จองสำเร็จ!");
            } catch (error) {
                console.error('Reservation error:', error);
                alert("การจองล้มเหลว กรุณาลองอีกครั้ง");
            }
        }
    };

    return (
        <div className="container mx-auto px-4 py-8 space-y-8">
            {isLoading ? (
                <Loading message="กำลังโหลดข้อมูล..." />
            ) : (
                <>
                    {/* Date Selection */}
                    <div className={`
                        border-2 rounded-xl p-6 
                        ${completedSteps.date ? 'border-green-500' : 'border-gray-300'}
                    `}>
                        <h2 className="text-2xl font-bold mb-4">
                            1. เลือกวันที่ต้องการจอง
                        </h2>
                        <div className="flex items-center justify-center">
                            <input 
                                type="date" 
                                value={date ? date.toISOString().split('T')[0] : ''} 
                                onChange={(e) => handleDateSelect(new Date(e.target.value))}
                                className="w-full max-w-md p-2 border rounded-lg"
                            />
                        </div>
                    </div>

                    {/* Time Selection */}
                    <div className={`
                        border-2 rounded-xl p-6 
                        ${completedSteps.date ? 'opacity-100' : 'opacity-50 pointer-events-none'}
                        ${completedSteps.time ? 'border-green-500' : 'border-gray-300'}
                    `}>
                        <h2 className="text-2xl font-bold mb-4">
                            2. เลือกเวลา
                        </h2>
                        <div className="flex flex-wrap gap-4 justify-center">
                            {Array.from({ length: 11 }, (_, i) => (
                                <div 
                                    key={i}
                                    onClick={() => handleTimeSelect((10 + i).toString())}
                                    className={`
                                        cursor-pointer 
                                        ${time === (10 + i).toString() ? 'bg-black text-white' : 'bg-gray-100'}
                                        rounded-xl p-2
                                    `}
                                >
                                    <TimeCard time={(10 + i).toString()} />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Table Selection */}
                    <div className={`
                        border-2 rounded-xl p-6 
                        ${completedSteps.time ? 'opacity-100' : 'opacity-50 pointer-events-none'}
                        ${completedSteps.table ? 'border-green-500' : 'border-gray-300'}
                    `}>
                        <h2 className="text-2xl font-bold mb-4">
                            3. เลือกโต๊ะ
                        </h2>
                        <div className="flex flex-wrap gap-4 justify-center">
                            {tables.map((table: any) => (
                                <div
                                    key={table.id}
                                    onClick={() => handleTableSelect(table.id.toString())}
                                    className={`
                                        cursor-pointer 
                                        ${table_id === table.id.toString() ? 'bg-black text-white' : 'bg-gray-100'}
                                        rounded-xl
                                    `}
                                >
                                    <Table id={table.id} seats={table.seats} />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Reservation Confirmation */}
                    <div className={`
                        border-2 rounded-xl p-6 
                        ${completedSteps.table ? 'opacity-100' : 'opacity-50 pointer-events-none'}
                    `}>
                        <h2 className="text-2xl font-bold mb-4">
                            4. ยืนยันการจอง
                        </h2>
                        {completedSteps.table && (
                            <div className="text-center">
                                <p>วันที่: {date?.toLocaleDateString()}</p>
                                <p>เวลา: {time}:00</p>
                                <p>โต๊ะ: {table_id}</p>
                                <button 
                                    onClick={handleReservation}
                                    className="mt-4 bg-green-500 text-white px-6 py-3 rounded-xl hover:bg-green-600"
                                >
                                    ยืนยันการจอง
                                </button>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}