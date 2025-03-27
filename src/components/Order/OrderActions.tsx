'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useSession } from 'next-auth/react';

interface OrderActionsProps {
    orderId: number;
    status: string;
}

export default function OrderActions({ orderId, status }: OrderActionsProps) {
    const router = useRouter();
    const { data: session } = useSession();
    const userRole = session?.user?.role;
    
    // Check if user has staff/admin permissions
    const hasStaffPermission = (): boolean => {
        return userRole === 'ADMIN' || userRole === 'STAFF';
    };
    
    // Check if user can cancel the order (regular users can only cancel PENDING orders)
    const canCancelOrder = (): boolean => {
        if (hasStaffPermission()) {
            // Staff and admins can cancel orders that are PENDING or IN_PROGRESS
            return status === 'PENDING' || status === 'IN_PROGRESS';
        } else {
            // Regular users can only cancel PENDING orders
            return status === 'PENDING';
        }
    };
    
    // Set initial status to the next logical step based on current status
    const getInitialSelectedStatus = () => {
        if (status === 'PENDING') return 'IN_PROGRESS';
        if (status === 'IN_PROGRESS') return 'COMPLETED';
        return status;
    };
    
    const [selectedStatus, setSelectedStatus] = useState(getInitialSelectedStatus());
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    // Format date as YYYY-MM-DD HH:MM:SS
    const getFormattedDate = () => {
        const now = new Date();
        return now.getFullYear() + '-' + 
            String(now.getMonth() + 1).padStart(2, '0') + '-' + 
            String(now.getDate()).padStart(2, '0') + ' ' + 
            String(now.getHours()).padStart(2, '0') + ':' + 
            String(now.getMinutes()).padStart(2, '0') + ':' + 
            String(now.getSeconds()).padStart(2, '0');
    };

    // Translate status to Thai for user-friendly display
    const translateStatus = (status: string) => {
        const statusMap: {[key: string]: string} = {
            'PENDING': 'รอดำเนินการ',
            'IN_PROGRESS': 'กำลังดำเนินการ',
            'COMPLETED': 'เสร็จสิ้น',
            'CANCELLED': 'ยกเลิก',
            'ERROR': 'เกิดข้อผิดพลาด'
        };
        return statusMap[status] || status;
    };

    const handleApiRequest = async (newStatus: string) => {
        if (!session?.user?.accessToken) {
            setError('คุณไม่ได้ล็อกอิน กรุณาล็อกอินก่อนดำเนินการ');
            return false;
        }
        
        try {
            setIsLoading(true);
            setError(null);
            setSuccessMessage(null);
            
            const res = await fetch(`${process.env.NEXT_PUBLIC_CLIENT_API_URL}/api/orders/${orderId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.user.accessToken}`,
                },
                body: JSON.stringify({
                    status: newStatus,
                    accept: getFormattedDate()
                }),
            });

            if (!res.ok) {
                const errorData = await res.json().catch(() => null);
                console.error('API error response:', errorData);
                throw new Error(errorData?.message || `ไม่สามารถอัพเดทออเดอร์เป็น${translateStatus(newStatus)}ได้`);
            }

            return true;
        } catch (error: any) {
            console.error(`Failed to update order #${orderId} to ${newStatus}:`, error);
            setError(error.message || 'เกิดข้อผิดพลาดในการอัพเดทสถานะออเดอร์');
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    const onOrderCancel = async () => {
        // Confirm cancellation with custom dialog instead of browser alert
        if (!confirm(`คุณต้องการยกเลิกออเดอร์ #${orderId} ใช่หรือไม่?`)) {
            return;
        }

        const newStatus = 'CANCELLED';
        const success = await handleApiRequest(newStatus);
        
        if (success) {
            setSuccessMessage(`ยกเลิกออเดอร์ #${orderId} เรียบร้อยแล้ว`);
            
            // Use a timeout to reload for better UX
            setTimeout(() => {
                window.location.reload();
            }, 1500);
        }
    };

    const onOrderChange = async () => {
        // Confirm status change
        if (!confirm(`คุณต้องการเปลี่ยนสถานะออเดอร์ #${orderId} เป็น ${translateStatus(selectedStatus)} ใช่หรือไม่?`)) {
            return;
        }

        const success = await handleApiRequest(selectedStatus);
        
        if (success) {
            setSuccessMessage(`อัพเดทสถานะออเดอร์ #${orderId} เป็น ${translateStatus(selectedStatus)} เรียบร้อยแล้ว`);
            
            // Use a timeout to reload for better UX
            setTimeout(() => {
                window.location.reload();
            }, 1500);
        }
    };

    // Don't render anything for completed or cancelled orders
    if (status === 'COMPLETED' || status === 'CANCELLED') {
        return null;
    }
    
    // Don't show any controls for regular users if the order is not PENDING
    if (!hasStaffPermission() && !canCancelOrder()) {
        return null;
    }

    return (
        <div className="flex flex-col gap-3 my-6">
            {/* Feedback Messages */}
            {error && (
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded shadow-sm mb-4 animate-fadeIn" role="alert">
                    <div className="flex items-center">
                        <svg className="h-5 w-5 mr-2 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                            <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" />
                        </svg>
                        <span className="font-medium">{error}</span>
                    </div>
                </div>
            )}
            
            {successMessage && (
                <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded shadow-sm mb-4 animate-fadeIn" role="alert">
                    <div className="flex items-center">
                        <svg className="h-5 w-5 mr-2 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                            <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1
0 001.414 0l4-4z" />
                        </svg>
                        <span className="font-medium">{successMessage}</span>
                    </div>
                </div>
            )}
            
            {/* Current Status Indicator - Only shown for staff/admin */}
            {hasStaffPermission() && (
                <div className="mb-2">
                    <span className="text-sm text-gray-600">สถานะปัจจุบัน:</span>
                    <span className={`ml-2 px-3 py-1 rounded-full text-sm font-medium
                        ${status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : ''}
                        ${status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' : ''}
                        ${status === 'COMPLETED' ? 'bg-green-100 text-green-800' : ''}
                        ${status === 'CANCELLED' ? 'bg-red-100 text-red-800' : ''}
                    `}>
                        {translateStatus(status)}
                    </span>
                </div>
            )}
            
            <div className="flex flex-col sm:flex-row justify-between gap-3 bg-gray-50 p-4 rounded-lg shadow-sm border border-gray-200">
                {/* Cancel Button - shown for all users if order can be cancelled */}
                {canCancelOrder() && (
                    <button
                        className={`flex items-center justify-center bg-white hover:bg-red-50 px-6 py-3 rounded-lg border border-red-500 text-red-600 hover:text-red-700 transition-colors ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        onClick={onOrderCancel}
                        disabled={isLoading}
                    >
                        <svg className="mr-2" fill="currentColor" width="1.2rem" height="1.2rem" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                            <path d="M16 29c-7.18 0-13-5.82-13-13s5.82-13 13-13 13 5.82 13 13-5.82 13-13 13zM16 6c-5.522 0-10 4.478-10 10s4.478 10 10 10c5.523 0 10-4.478 10-10s-4.477-10-10-10zM20.537 19.535l-1.014 1.014c-0.186 0.186-0.488 0.186-0.675 0l-2.87-2.87-2.87 2.87c-0.187 0.186-0.488 0.186-0.675 0l-1.014-1.014c-0.186-0.186-0.186-0.488 0-0.675l2.871-2.869-2.871-2.87c-0.186-0.187-0.186-0.489 0-0.676l1.014-1.013c0.187-0.187 0.488-0.187 0.675 0l2.87 2.87 2.87-2.87c0.187-0.187 0.489-0.187 0.675 0l1.014 1.013c0.186 0.187 0.186 0.489 0 0.676l-2.871 2.87 2.871 2.869c0.186 0.187 0.186 0.49 0 0.675z"></path>
                        </svg>
                        {isLoading ? 'กำลังดำเนินการ...' : 'ยกเลิกออเดอร์'}
                    </button>
                )}

                {/* Status Update Section - only shown for staff/admin */}
                {hasStaffPermission() && (
                    <div className="flex flex-col sm:flex-row gap-2 mt-2 sm:mt-0">
                        <div className="flex flex-row items-center gap-2">
                            <label htmlFor="status-select" className="text-sm text-gray-600 whitespace-nowrap">
                                อัพเดทเป็น:
                            </label>
                            <select
                                id="status-select"
                                className="block w-full sm:w-auto px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 sm:text-sm"
                                value={selectedStatus}
                                onChange={(e) => setSelectedStatus(e.target.value)}
                                disabled={isLoading}
                            >
                                {status === 'PENDING' && (
                                    <option value="IN_PROGRESS">กำลังดำเนินการ</option>
                                )}
                                {status === 'IN_PROGRESS' && (
                                    <option value="COMPLETED">เสร็จสิ้น</option>
                                )}
                                {/* Fallback options if needed */}
                                {!['PENDING', 'IN_PROGRESS'].includes(status) && (
                                    <>
                                        <option value="IN_PROGRESS">กำลังดำเนินการ</option>
                                        <option value="COMPLETED">เสร็จสิ้น</option>
                                    </>
                                )}
                            </select>
                        </div>
                        <button
                            className={`flex items-center justify-center bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition-colors ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                            onClick={onOrderChange}
                            disabled={isLoading}
                        >
                            <svg className="mr-2" fill="currentColor" width="1.2rem" height="1.2rem" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path d="M9 16.17l-3.59-3.59L4 14l5 5 10-10-1.41-1.42L9 16.17z" />
                            </svg>
                            {isLoading ? 'กำลังดำเนินการ...' : 'บันทึกสถานะ'}
                        </button>
                    </div>
                )}
            </div>
            
            {/* Loading Indicator */}
            {isLoading && (
                <div className="flex justify-center items-center py-2">
                    <div className="w-6 h-6 border-2 border-gray-300 border-t-green-600 rounded-full animate-spin"></div>
                </div>
            )}
        </div>
    );
}