'use client';

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import TimeCard from "@/components/Reservation/TimeCard";
import Table from "@/components/Reservation/TableCard";
import Loading from "@/components/Loading";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function ShowTimeSlots() {
    const router = useRouter();
    const { data: session, status } = useSession();
    const [date, setDate] = useState<Date | null>(null);
    const [time, setTime] = useState<string>("");
    const [table_id, setTable_id] = useState<string>("");
    const [tables, setTables] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [dateError, setDateError] = useState<string>("");
    const [timeError, setTimeError] = useState<string>("");
    const [currentStep, setCurrentStep] = useState(1);
    const [completedSteps, setCompletedSteps] = useState({
        date: false,
        time: false,
        table: false
    });

    async function getData() {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_CLIENT_API_URL}/api/tables`);
            
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

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login');
        }
    }, [status, router]);

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
            
            // Move to next step
            setCurrentStep(2);
        }
    };

    const handleTimeSelect = (selectedTime: string) => {
        if (validateTime(selectedTime, date)) {
            setTime(selectedTime);
            setCompletedSteps(prev => ({...prev, time: true}));
            
            // Reset table selection
            setTable_id("");
            setCompletedSteps(prev => ({...prev, table: false}));
            
            // Move to next step
            setCurrentStep(3);
        }
    };

    const handleTableSelect = (selectedTableId: string) => {
        setTable_id(selectedTableId);
        setCompletedSteps(prev => ({...prev, table: true}));
        
        // Move to next step
        setCurrentStep(4);
    };

    async function makeReservation() {
        try {
            const appointmentTime = `${date?.getFullYear()}-${Number(date?.getMonth()) +1}-${date?.getDate()} ${String(Number(time)).padStart(2, "0")}:00:00`;
            const user_id = session?.user.id;
            
            const body = {
                user_id: user_id,
                table_id: Number(table_id),
                appointment_time: appointmentTime,
            };
            
            const res = await fetch(`${process.env.NEXT_PUBLIC_CLIENT_API_URL}/api/reservations`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session?.user?.accessToken}`,
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
            throw error;
        }
    }

    const handleReservation = async () => {
        if (!date || !time || !table_id) {
            alert("กรุณาเลือกข้อมูลให้ครบถ้วน");
            return;
        }

        try {
            setIsLoading(true);
            await makeReservation();
            setIsLoading(false);
            
            // Show success modal or redirect
            setReservationSuccess(true);
        } catch (error) {
            setIsLoading(false);
            setReservationError("การจองล้มเหลว กรุณาลองอีกครั้ง");
        }
    };

    const [reservationSuccess, setReservationSuccess] = useState(false);
    const [reservationError, setReservationError] = useState("");

    // Function to go to a specific step
    const goToStep = (step: number) => {
        // Only allow going to steps that are available (completed previous steps or current step)
        if (
            step === 1 || 
            (step === 2 && completedSteps.date) || 
            (step === 3 && completedSteps.time) || 
            (step === 4 && completedSteps.table)
        ) {
            setCurrentStep(step);
        }
    };

    // Format date for display
    const formatDate = (date: Date | null) => {
        if (!date) return "";
        
        // Formatting for Thai locale
        const options: Intl.DateTimeFormatOptions = { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        };
        
        return date.toLocaleDateString('th-TH', options);
    };

    return (
        <div className="min-h-screen py-12 px-4 sm:px-6">
            {/* Success Modal */}
            {reservationSuccess && (
                <div className="fixed inset-0 bg-primary bg-opacity-50 z-50 flex items-center justify-center">
                    <motion.div 
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-background rounded-2xl shadow-xl p-8 max-w-md mx-auto"
                    >
                        <div className="text-center">
                            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-acceptGreen bg-opacity-10 mb-6">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-acceptGreen" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <h3 className="text-2xl font-bold text-mainText mb-2">จองโต๊ะเรียบร้อย!</h3>
                            <p className="text-secondary mb-6">
                                ขอบคุณสำหรับการจอง เราจะรอให้บริการคุณในวันที่ {formatDate(date)} เวลา {time}:00 น.
                            </p>
                            <div className="mt-6">
                                <button 
                                    onClick={() => window.location.href = '/profile?section=reservations'}
                                    className="inline-flex justify-center px-6 py-3 rounded-lg bg-button text-background hover:bg-hoverButton focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-inputFieldFocus transition-colors"
                                >
                                    ไปยังหน้ารายการจอง
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}

            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-mainText mb-2">จองโต๊ะอาหาร</h1>
                    <p className="text-secondText">ใช้เวลาเพียงไม่กี่นาทีในการจองโต๊ะสำหรับมื้ออาหารพิเศษของคุณ</p>
                </div>
                
                {isLoading ? (
                    <div className="flex justify-center items-center h-64">
                        <Loading message="กำลังโหลดข้อมูล..." />
                    </div>
                ) : (
                    <div className="bg-background rounded-2xl shadow-lg overflow-hidden">
                        {/* Progress bar */}
                        <div className="bg-searchBox px-8 py-6 border-b border-searchBox">
                            <div className="flex justify-between relative">
                                {/* Progress line */}
                                <div className="absolute top-1/2 left-0 right-0 h-1 bg-searchBox -translate-y-1/2 z-0"></div>
                                <div className="absolute top-1/2 left-0 h-1 bg-inputFieldFocus -translate-y-1/2 z-0" style={{
                                    width: `${(currentStep - 1) * 33.33}%`
                                }}></div>
                                
                                {/* Step indicators */}
                                {[
                                    { step: 1, label: "เลือกวันที่", completed: completedSteps.date },
                                    { step: 2, label: "เลือกเวลา", completed: completedSteps.time },
                                    { step: 3, label: "เลือกโต๊ะ", completed: completedSteps.table },
                                    { step: 4, label: "ยืนยัน", completed: false }
                                ].map((stepInfo, index) => (
                                    <div 
                                        key={index} 
                                        className={`flex flex-col items-center relative z-10 ${
                                            (index <= currentStep - 1) || stepInfo.completed 
                                                ? "cursor-pointer" 
                                                : "cursor-default"
                                        }`}
                                        onClick={() => goToStep(stepInfo.step)}
                                    >
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                            stepInfo.completed 
                                                ? "bg-inputFieldFocus text-background" 
                                                : currentStep === stepInfo.step
                                                    ? "bg-background border-2 border-inputFieldFocus text-inputFieldFocus" 
                                                    : index < currentStep - 1
                                                        ? "bg-searchBox text-secondText"
                                                        : "bg-background border-2 border-searchBox text-secondText"
                                        }`}>
                                            {stepInfo.completed ? (
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                            ) : (
                                                stepInfo.step
                                            )}
                                        </div>
                                        <span className={`text-sm font-medium mt-2 ${
                                            currentStep === stepInfo.step
                                                ? "text-inputFieldFocus" 
                                                : stepInfo.completed
                                                    ? "text-mainText" 
                                                    : "text-secondText"
                                        }`}>
                                            {stepInfo.label}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        
                        {/* Step content */}
                        <div className="p-8">
                            <AnimatePresence mode="wait">
                                {currentStep === 1 && (
                                    <motion.div
                                        key="step1"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <h2 className="text-2xl font-bold text-mainText mb-6">เลือกวันที่คุณต้องการมาทานอาหาร</h2>
                                        
                                        <div className="max-w-sm mx-auto">
                                            <label htmlFor="reservation-date" className="block text-sm font-medium text-secondText mb-2">วันที่</label>
                                            <input 
                                                id="reservation-date"
                                                type="date" 
                                                value={date ? date.toISOString().split('T')[0] : ''} 
                                                onChange={(e) => handleDateSelect(new Date(e.target.value))}
                                                min={new Date().toISOString().split('T')[0]}
                                                className="w-full px-4 py-3 border border-searchBox rounded-lg text-mainText focus:outline-none focus:ring-2 focus:ring-inputFieldFocus focus:border-inputFieldFocus transition-colors"
                                            />
                                            
                                            {dateError && (
                                                <div className="mt-2 text-sm text-cancelRed bg-cancelRed bg-opacity-5 px-3 py-2 rounded-md">
                                                    <div className="flex items-center">
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                                        </svg>
                                                        {dateError}
                                                    </div>
                                                </div>
                                            )}
                                            
                                            {date && !dateError && (
                                                <div className="mt-2 text-sm text-acceptGreen bg-acceptGreen bg-opacity-5 px-3 py-2 rounded-md">
                                                    <div className="flex items-center">
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                        </svg>
                                                        คุณเลือกวันที่ {formatDate(date)}
                                                    </div>
                                                </div>
                                            )}
                                            
                                            <div className="mt-8 flex justify-end">
                                                <button 
                                                    onClick={() => date && setCurrentStep(2)}
                                                    disabled={!date || !!dateError}
                                                    className={`px-6 py-3 rounded-lg flex items-center ${
                                                        !date || !!dateError
                                                            ? "bg-searchBox text-secondText cursor-not-allowed"
                                                            : "bg-button text-background hover:bg-hoverButton"
                                                    } transition-colors`}
                                                >
                                                    ถัดไป
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                                
                                {currentStep === 2 && (
                                    <motion.div
                                        key="step2"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <div className="flex justify-between mb-6">
                                            <button 
                                                onClick={() => setCurrentStep(1)}
                                                className="flex items-center text-secondText hover:text-mainText transition-colors"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                                </svg>
                                                ย้อนกลับ
                                            </button>
                                            <div className="text-secondText">
                                                วันที่: <span className="font-medium text-mainText">{formatDate(date)}</span>
                                            </div>
                                        </div>
                                        
                                        <h2 className="text-2xl font-bold text-mainText mb-6">เลือกเวลาที่คุณต้องการมาทานอาหาร</h2>
                                        
                                        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-4 mb-8">
                                            {Array.from({ length: 11 }, (_, i) => {
                                                const timeValue = (10 + i).toString();
                                                return (
                                                    <button 
                                                        key={i}
                                                        onClick={() => handleTimeSelect(timeValue)}
                                                        className={`py-3 px-4 rounded-lg border text-center transition-all ${
                                                            time === timeValue 
                                                                ? 'border-inputFieldFocus bg-inputFieldFocus bg-opacity-5 text-inputFieldFocus ring-2 ring-inputFieldFocus ring-opacity-30' 
                                                                : 'border-searchBox hover:border-inputFieldFocus hover:bg-inputFieldFocus hover:bg-opacity-5'
                                                        }`}
                                                    >
                                                        {timeValue}:00
                                                    </button>
                                                );
                                            })}
                                        </div>

                                        {timeError && (
                                            <div className="mb-6 text-sm text-cancelRed bg-cancelRed bg-opacity-5 px-4 py-3 rounded-md">
                                                <div className="flex items-center">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                                    </svg>
                                                    {timeError}
                                                </div>
                                            </div>
                                        )}
                                        
                                        {time && !timeError && (
                                            <div className="mb-6 text-sm text-acceptGreen bg-acceptGreen bg-opacity-5 px-4 py-3 rounded-md">
                                                <div className="flex items-center">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                    คุณเลือกเวลา {time}:00 น.
                                                </div>
                                            </div>
                                        )}
                                        
                                        <div className="flex justify-between">
                                            <button 
                                                onClick={() => setCurrentStep(1)}
                                                className="px-6 py-3 border border-searchBox rounded-lg text-primary hover:bg-searchBox transition-colors"
                                            >
                                                ย้อนกลับ
                                            </button>
                                            <button 
                                                onClick={() => time && setCurrentStep(3)}
                                                disabled={!time || !!timeError}
                                                className={`px-6 py-3 rounded-lg flex items-center ${
                                                    !time || !!timeError
                                                        ? "bg-searchBox text-secondText cursor-not-allowed"
                                                        : "bg-button text-background hover:bg-hoverButton"
                                                } transition-colors`}
                                            >
                                                ถัดไป
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                </svg>
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                                
                                {currentStep === 3 && (
                                    <motion.div
                                        key="step3"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <div className="flex justify-between mb-6">
                                            <button 
                                                onClick={() => setCurrentStep(2)}
                                                className="flex items-center text-secondText hover:text-mainText transition-colors"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                                </svg>
                                                ย้อนกลับ
                                            </button>
                                            <div className="text-secondText">
                                                {formatDate(date)} · <span className="font-medium text-mainText">{time}:00 น.</span>
                                            </div>
                                        </div>
                                        
                                        <h2 className="text-2xl font-bold text-mainText mb-6">เลือกโต๊ะที่คุณต้องการ</h2>
                                        
                                        <div className="relative mb-8">
                                            <div className="absolute inset-0 bg-searchBox rounded-lg"></div>
                                            <div className="relative grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
                                                {tables.map((table: any) => (
                                                    <button
                                                        key={table.id}
                                                        onClick={() => handleTableSelect(table.id.toString())}
                                                        className={`p-4 bg-background rounded-lg border shadow-sm hover:shadow transition-all ${
                                                            table_id === table.id.toString() 
                                                                ? 'border-inputFieldFocus ring-2 ring-inputFieldFocus ring-opacity-30' 
                                                                : 'border-searchBox hover:border-inputFieldFocus'
                                                        }`}
                                                    >
                                                        <div className="flex flex-col items-center">
                                                            <svg xmlns="http://www.w3.org/2000/svg" className={`h-12 w-12 mb-2 ${
                                                                table_id === table.id.toString() ? 'text-inputFieldFocus' : 'text-secondText'
                                                            }`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                                            </svg>
                                                            <span className="text-lg font-medium text-mainText">โต๊ะ {table.id}</span>
                                                            <span className="text-sm text-secondText">{table.seats} ที่นั่ง</span>
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {table_id && (
                                            <div className="mb-6 text-sm text-acceptGreen bg-acceptGreen bg-opacity-5 px-4 py-3 rounded-md">
                                                <div className="flex items-center">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                    คุณเลือกโต๊ะที่ {table_id}
                                                </div>
                                            </div>
                                        )}
                                        
                                        <div className="flex justify-between">
                                            <button 
                                                onClick={() => setCurrentStep(2)}
                                                className="px-6 py-3 border border-searchBox rounded-lg text-primary hover:bg-searchBox transition-colors"
                                            >
                                                ย้อนกลับ
                                            </button>
                                            <button 
                                                onClick={() => table_id && setCurrentStep(4)}
                                                disabled={!table_id}
                                                className={`px-6 py-3 rounded-lg flex items-center ${
                                                    !table_id
                                                        ? "bg-searchBox text-secondText cursor-not-allowed"
                                                        : "bg-button text-background hover:bg-hoverButton"
                                                } transition-colors`}
                                            >
                                                ถัดไป
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                </svg>
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                                
                                {currentStep === 4 && (
                                    <motion.div
                                        key="step4"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <div className="flex justify-between mb-6">
                                            <button 
                                                onClick={() => setCurrentStep(3)}
                                                className="flex items-center text-secondText hover:text-mainText transition-colors"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                                </svg>
                                                ย้อนกลับ
                                            </button>
                                        </div>
                                        
                                        <h2 className="text-2xl font-bold text-mainText mb-6">ยืนยันการจองของคุณ</h2>
                                        
                                        <div className="bg-searchBox rounded-lg p-6 mb-8">
                                            <h3 className="text-lg font-medium text-mainText mb-4">รายละเอียดการจอง</h3>
                                            
                                            <div className="space-y-4">
                                                <div className="flex items-start">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-inputFieldFocus mt-0.5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                    </svg>
                                                    <div>
                                                        <p className="text-sm text-secondText">วันที่</p>
                                                        <p className="font-medium text-mainText">{formatDate(date)}</p>
                                                    </div>
                                                </div>
                                                
                                                <div className="flex items-start">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-inputFieldFocus mt-0.5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                    <div>
                                                        <p className="text-sm text-secondText">เวลา</p>
                                                        <p className="font-medium text-mainText">{time}:00 น.</p>
                                                    </div>
                                                </div>
                                                
                                                <div className="flex items-start">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-inputFieldFocus mt-0.5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                                    </svg>
                                                    <div>
                                                        <p className="text-sm text-secondText">โต๊ะ</p>
                                                        <p className="font-medium text-mainText">
                                                            โต๊ะที่ {table_id} 
                                                            <span className="text-sm text-secondText ml-1">
                                                                ({tables.find(t => t.id.toString() === table_id)?.seats || 0} ที่นั่ง)
                                                            </span>
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <div className="mt-6 text-secondText text-sm p-3 bg-amber-50 rounded-md">
                                                <div className="flex">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-500 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                    <p>
                                                        กรุณามาถึงร้านก่อนเวลาจอง 10 นาที หากไม่มาตามเวลาที่จอง 
                                                        ทางร้านขอสงวนสิทธิ์ในการยกเลิกการจอง
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {reservationError && (
                                            <div className="mb-6 text-sm text-cancelRed bg-cancelRed bg-opacity-5 px-4 py-3 rounded-md">
                                                <div className="flex items-center">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                                    </svg>
                                                    {reservationError}
                                                </div>
                                            </div>
                                        )}
                                        
                                        <div className="flex justify-between">
                                            <button 
                                                onClick={() => setCurrentStep(3)}
                                                className="px-6 py-3 border border-searchBox rounded-lg text-primary hover:bg-searchBox transition-colors"
                                            >
                                                ย้อนกลับ
                                            </button>
                                            <button 
                                                onClick={handleReservation}
                                                disabled={isLoading}
                                                className={`px-8 py-3 rounded-lg flex items-center font-medium ${
                                                    isLoading
                                                        ? "bg-searchBox text-secondText cursor-not-allowed"
                                                        : "bg-button text-background hover:bg-hoverButton"
                                                } transition-colors`}
                                            >
                                                {isLoading ? (
                                                    <>
                                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-background" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                        </svg>
                                                        กำลังดำเนินการ...
                                                    </>
                                                ) : (
                                                    <>
                                                        ยืนยันการจอง
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                        </svg>
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}