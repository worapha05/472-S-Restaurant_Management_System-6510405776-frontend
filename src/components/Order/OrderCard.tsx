'use client';

import Link from 'next/link';

export default function OrderCard({ order }: { order: Order }) {
    const getStatusColor = (status: string): string => {
        switch (status.toUpperCase()) {
            case 'PENDING': return 'bg-orange-100 text-orange-700';
            case 'IN_PROGRESS': return 'bg-primary-100 text-primary-700';
            case 'COMPLETED': return 'bg-green-100 text-green-700';
            case 'CANCELLED': return 'bg-red-100 text-red-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    // Format date for better display
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleString('th-TH', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Format accept time if present
    const formatAcceptTime = (acceptTime: string | null) => {
        if (!acceptTime) return 'ไม่มีข้อมูล';
        
        const date = new Date(acceptTime);
        return date.toLocaleString('th-TH', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    };

    // Format payment method for display
    const formatPaymentMethod = (method: string) => {
        switch (method) {
            case 'CREDIT_CARD': return 'บัตรเครดิต';
            case 'CASH': return 'เงินสด';
            case 'BANK_TRANSFER': return 'โอนเงิน';
            case 'QR_CODE': return 'QR Code';
            default: return method;
        }
    };

    return (
        <Link href={`/orders/${order.id}`} passHref>
            <div className="w-full bg-white rounded-xl border border-neutral-200 overflow-hidden hover:shadow-md transition-all">
                {/* Header with Order ID and Status */}
                <div className="grid grid-cols-12 bg-neutral-100 p-4 font-medium text-neutral-700">
                    <div className="col-span-3 flex items-center">
                        <span className="mr-2">รหัสคำสั่งซื้อ:</span>
                        <code className="bg-accent px-2 py-0.5 rounded text-white">
                            {order.id}
                        </code>
                    </div>
                    <div className="col-span-3">
                        <div className="flex items-center">
                            <svg className="w-5 h-5 mr-2 text-neutral-600" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M13.09 3.294c1.924.95 3.422 1.69 5.472.692a1 1 0 0 1 1.438.9v9.54a1 1 0 0 1-.562.9c-2.981 1.45-5.382.24-7.25-.701a38.739 38.739 0 0 0-.622-.31c-1.033-.497-1.887-.812-2.756-.77-.76.036-1.672.357-2.81 1.396V21a1 1 0 1 1-2 0V4.971a1 1 0 0 1 .297-.71c1.522-1.506 2.967-2.185 4.417-2.255 1.407-.068 2.653.453 3.72.967.225.108.443.216.655.32Z"/>
                            </svg>
                            <span>{order.table_id ? `โต๊ะที่ ${order.table_id}` : 'ไม่มีโต๊ะ'}</span>
                        </div>
                    </div>
                    <div className="col-span-3 flex items-center">
                        <div className="flex items-center">
                            <svg className="w-5 h-5 mr-2 text-neutral-600" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                                <path fillRule="evenodd" d="M5 5a1 1 0 0 0 1-1 1 1 0 1 1 2 0 1 1 0 0 0 1 1h1a1 1 0 0 0 1-1 1 1 0 1 1 2 0 1 1 0 0 0 1 1h1a1 1 0 0 0 1-1 1 1 0 1 1 2 0 1 1 0 0 0 1 1 2 2 0 0 1 2 2v1a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7a2 2 0 0 1 2-2ZM3 19v-7a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Zm6.01-6a1 1 0 1 0-2 0 1 1 0 0 0 2 0Zm2 0a1 1 0 1 1 2 0 1 1 0 0 1-2 0Zm6 0a1 1 0 1 0-2 0 1 1 0 0 0 2 0Zm-10 4a1 1 0 1 1 2 0 1 1 0 0 1-2 0Zm6 0a1 1 0 1 0-2 0 1 1 0 0 0 2 0Zm2 0a1 1 0 1 1 2 0 1 1 0 0 1-2 0Z" clipRule="evenodd"/>
                            </svg>
                            <time dateTime={order.created_at}>{formatDate(order.created_at)}</time>
                        </div>
                    </div>
                    <div className="col-span-3 flex justify-end">
                        <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(order.status)}`}>
                            {order.status}
                        </span>
                    </div>
                </div>

                {/* Main content */}
                <div className="p-4 flex flex-col gap-3">
                    <div className="flex justify-between items-center">
                        <div className="flex flex-col">
                            <span className="text-sm text-neutral-500">ประเภทคำสั่งซื้อ</span>
                            <span className="font-medium">{order.type}</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm text-neutral-500">การชำระเงิน</span>
                            <div className="flex items-center">
                                <svg className="w-5 h-5 mr-1 text-neutral-600" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M6 14h2m3 0h5M3 7v10a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1V7a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1Z"/>
                                </svg>
                                <span className="font-medium">{formatPaymentMethod(order.payment_method)}</span>
                            </div>
                        </div>
                        <div className="flex flex-col items-end">
                            <span className="text-sm text-neutral-500">ยอดรวมทั้งหมด</span>
                            <span className="text-xl font-bold">
                                {new Intl.NumberFormat('th-TH', {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2
                                }).format(order.sum_price)} ฿
                            </span>
                        </div>
                    </div>

                    {/* Address - for DELIVERY type */}
                    {order.type === 'DELIVERY' && order.address && (
                        <div className="mt-2">
                            <span className="text-sm text-neutral-500">ที่อยู่จัดส่ง</span>
                            <p className="text-neutral-800 whitespace-pre-line">{order.address}</p>
                        </div>
                    )}

                    {/* Accept time - if present */}
                    {order.accept && (
                        <div className="mt-2">
                            <span className="text-sm text-neutral-500">เวลารับออเดอร์</span>
                            <p>{formatAcceptTime(order.accept)}</p>
                        </div>
                    )}
                </div>

                {/* Footer with action buttons */}
                <div className="bg-neutral-50 p-3 flex justify-end space-x-2 border-t border-neutral-200">
                    <button className="p-2 rounded-full hover:bg-neutral-100 transition-colors">
                        <span className="material-symbols-outlined text-primary-600">visibility</span>
                    </button>
                    {order.status !== 'COMPLETED' && order.status !== 'CANCELLED' && (
                        <>
                            <button className="p-2 rounded-full hover:bg-neutral-100 transition-colors">
                                <span className="material-symbols-outlined text-green-600">check_circle</span>
                            </button>
                            <button className="p-2 rounded-full hover:bg-neutral-100 transition-colors">
                                <span className="material-symbols-outlined text-red-600">cancel</span>
                            </button>
                        </>
                    )}
                </div>
            </div>
        </Link>
    );
}