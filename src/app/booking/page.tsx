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
    const [dateError, setDateError] = useState<string>("");
    const [timeError, setTimeError] = useState<string>("");
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

    const validateDate = (selectedDate: Date): boolean => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const maxDate = new Date();
        maxDate.setFullYear(maxDate.getFullYear() + 1);

        if (selectedDate <= today) {
            setDateError("กรุณาเลือกวันที่ในอนาคต");
            return false;
        }

        if (selectedDate > maxDate) {
            setDateError("ไม่สามารถจองล่วงหน้าเกิน 1 ปีได้");
            return false;
        }

        setDateError("");
        return true;
    };

    const validateTime = (selectedTime: string, selectedDate: Date | null): boolean => {
        const currentDate = new Date();
        const currentHour = currentDate.getHours();

        // If selected date is today, validate time
        if (selectedDate && 
            selectedDate.toDateString() === currentDate.toDateString()) {
            const selectedHour = Number(selectedTime);

            // Ensure selected time is in the future
            if (selectedHour <= currentHour) {
                setTimeError("กรุณาเลือกเวลาในอนาคต");
                return false;
            }
        }

        // Restaurant operating hours (assuming 10:00 - 20:00)
        const selectedHour = Number(selectedTime);
        if (selectedHour < 10 || selectedHour > 20) {
            setTimeError("กรุณาเลือกเวลาระหว่าง 10:00 - 20:00");
            return false;
        }

        setTimeError("");
        return true;
    };

    const handleDateSelect = (selectedDate: Date) => {
        if (validateDate(selectedDate)) {
            setDate(selectedDate);
            setCompletedSteps(prev => ({...prev, date: true}));
            
            // Reset subsequent steps
            setTime("");
            setTable_id("");
            setCompletedSteps(prev => ({
                ...prev, 
                time: false, 
                table: false
            }));
        }
    };

    const handleTimeSelect = (selectedTime: string) => {
        if (validateTime(selectedTime, date)) {
            setTime(selectedTime);
            setCompletedSteps(prev => ({...prev, time: true}));
            
            // Reset table selection
            setTable_id("");
            setCompletedSteps(prev => ({...prev, table: false}));
        }
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

    // Helper function to get step status classes
    const getStepStatusClasses = (isActive: boolean, isCompleted: boolean) => {
        if (!isActive) return "opacity-50 pointer-events-none";
        if (isCompleted) return "border-primary-600";
        return "border-neutral-200";
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <h1 className="text-3xl font-bold mb-8 text-center">จองโต๊ะอาหาร</h1>
            
            {isLoading ? (
                <div className="flex justify-center items-center h-64">
                    <Loading message="กำลังโหลดข้อมูล..." />
                </div>
            ) : (
                <div className="space-y-6">
                    {/* Step indicators */}
                    <div className="flex justify-between mb-8 px-6">
                        {[
                            { step: 1, label: "เลือกวันที่", completed: completedSteps.date },
                            { step: 2, label: "เลือกเวลา", completed: completedSteps.time },
                            { step: 3, label: "เลือกโต๊ะ", completed: completedSteps.table },
                            { step: 4, label: "ยืนยัน", completed: false }
                        ].map((stepInfo, index) => (
                            <div key={index} className="flex flex-col items-center">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                                    stepInfo.completed 
                                        ? "bg-primary-600 text-white" 
                                        : (
                                            (index === 0) || 
                                            (index === 1 && completedSteps.date) || 
                                            (index === 2 && completedSteps.time) ||
                                            (index === 3 && completedSteps.table)
                                                ? "bg-white border-2 border-primary-600 text-primary-600" 
                                                : "bg-neutral-100 text-neutral-400"
                                        )
                                }`}>
                                    {stepInfo.completed ? (
                                        <span className="material-symbols-outlined text-sm">check</span>
                                    ) : (
                                        stepInfo.step
                                    )}
                                </div>
                                <span className={`text-sm ${
                                    (index === 0) || 
                                    (index === 1 && completedSteps.date) || 
                                    (index === 2 && completedSteps.time) ||
                                    (index === 3 && completedSteps.table)
                                        ? "text-neutral-900" 
                                        : "text-neutral-400"
                                }`}>
                                    {stepInfo.label}
                                </span>
                            </div>
                        ))}
                    </div>

                    {/* Date Selection */}
                    <div className={`bg-white rounded-xl shadow-sm p-6 transition-all ${getStepStatusClasses(true, completedSteps.date)}`}>
                        <div className="flex items-center mb-4">
                            <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center mr-3">
                                1
                            </div>
                            <h2 className="text-xl font-semibold">เลือกวันที่ต้องการจอง</h2>
                        </div>
                        
                        <div className="flex flex-col items-center">
                            <div className="w-full max-w-xs">
                                <input 
                                    type="date" 
                                    value={date ? date.toISOString().split('T')[0] : ''} 
                                    onChange={(e) => handleDateSelect(new Date(e.target.value))}
                                    min={new Date().toISOString().split('T')[0]}
                                    className="w-full px-4 py-3 border border-neutral-300 rounded-lg text-center focus:outline-none focus:ring-2 focus:ring-primary-500"
                                />
                            </div>
                            {dateError && (
                                <p className="text-red-500 mt-3 text-sm">
                                    {dateError}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Time Selection */}
                    <div className={`bg-white rounded-xl shadow-sm p-6 transition-all ${getStepStatusClasses(completedSteps.date, completedSteps.time)}`}>
                        <div className="flex items-center mb-4">
                            <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center mr-3">
                                2
                            </div>
                            <h2 className="text-xl font-semibold">เลือกเวลา</h2>
                        </div>
                        
                        <div className="flex flex-wrap gap-3 justify-center">
                            {Array.from({ length: 11 }, (_, i) => {
                                const timeValue = (10 + i).toString();
                                return (
                                    <div 
                                        key={i}
                                        onClick={() => handleTimeSelect(timeValue)}
                                        className={`cursor-pointer transition-all ${
                                            time === timeValue 
                                                ? 'ring-2 ring-primary-600 scale-105' 
                                                : 'hover:scale-105'
                                        }`}
                                    >
                                        <TimeCard time={timeValue} />
                                    </div>
                                );
                            })}
                        </div>

                        {timeError && (
                            <p className="text-red-500 mt-4 text-sm text-center">
                                {timeError}
                            </p>
                        )}
                    </div>

                    {/* Table Selection */}
                    <div className={`bg-white rounded-xl shadow-sm p-6 transition-all ${getStepStatusClasses(completedSteps.time, completedSteps.table)}`}>
                        <div className="flex items-center mb-4">
                            <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center mr-3">
                                3
                            </div>
                            <h2 className="text-xl font-semibold">เลือกโต๊ะ</h2>
                        </div>

                        <div className="flex flex-wrap gap-3 justify-center">
                            {tables.map((table: any) => (
                                <div
                                    key={table.id}
                                    onClick={() => handleTableSelect(table.id.toString())}
                                    className={`cursor-pointer transition-all ${
                                        table_id === table.id.toString() 
                                            ? 'ring-2 ring-primary-600 scale-105' 
                                            : 'hover:scale-105'
                                    }`}
                                >
                                    <Table id={table.id} seats={table.seats} />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Reservation Confirmation */}
                    <div className={`bg-white rounded-xl shadow-sm p-6 transition-all ${getStepStatusClasses(completedSteps.table, false)}`}>
                        <div className="flex items-center mb-4">
                            <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center mr-3">
                                4
                            </div>
                            <h2 className="text-xl font-semibold">ยืนยันการจอง</h2>
                        </div>
                        
                        {completedSteps.table && (
                            <div className="bg-neutral-50 p-6 rounded-lg text-center">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                    <div className="flex flex-col items-center p-3 bg-white rounded-lg">
                                        <span className="material-symbols-outlined text-primary-600 mb-2">calendar_today</span>
                                        <p className="text-sm text-neutral-500">วันที่</p>
                                        <p className="font-medium">{date?.toLocaleDateString('th-TH')}</p>
                                    </div>
                                    
                                    <div className="flex flex-col items-center p-3 bg-white rounded-lg">
                                        <span className="material-symbols-outlined text-primary-600 mb-2">schedule</span>
                                        <p className="text-sm text-neutral-500">เวลา</p>
                                        <p className="font-medium">{time}:00 น.</p>
                                    </div>
                                    
                                    <div className="flex flex-col items-center p-3 bg-white rounded-lg">
                                        <span className="material-symbols-outlined text-primary-600 mb-2">table_restaurant</span>
                                        <p className="text-sm text-neutral-500">โต๊ะ</p>
                                        <p className="font-medium">โต๊ะที่ {table_id}</p>
                                    </div>
                                </div>
                                
                                <button 
                                    onClick={handleReservation}
                                    className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center justify-center mx-auto"
                                >
                                    <span className="material-symbols-outlined mr-2">check_circle</span>
                                    ยืนยันการจอง
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}