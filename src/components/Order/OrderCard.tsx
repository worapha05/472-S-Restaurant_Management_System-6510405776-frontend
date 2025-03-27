'use client';

import Link from 'next/link';

export default function OrderCard({ order }: { order: Order }) {
    // Get appropriate status color based on status
    const getStatusColor = (status: string): string => {
        switch (status.toUpperCase()) {
            case 'PENDING': return 'bg-orange-100 text-orange-700';
            case 'IN_PROGRESS': return 'bg-inputFieldFocus bg-opacity-10 text-inputFieldFocus';
            case 'COMPLETED': return 'bg-acceptGreen bg-opacity-10 text-acceptGreen';
            case 'CANCELLED': return 'bg-cancelRed bg-opacity-10 text-cancelRed';
            default: return 'bg-secondary bg-opacity-10 text-secondary';
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

    // Format order type
    const formatOrderType = (type: string) => {
        switch (type) {
            case 'DINE_IN': return 'ทานที่ร้าน';
            case 'TAKEAWAY': return 'รับกลับบ้าน';
            case 'DELIVERY': return 'จัดส่ง';
            default: return type;
        }
    };

    // Get order type icon
    const getOrderTypeIcon = (type: string) => {
        switch (type) {
            case 'DINE_IN':
                return (
                    <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                );
            case 'TAKEAWAY':
                return (
                    <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                );
            case 'DELIVERY':
                return (
                    <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                );
            default:
                return (
                    <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                );
        }
    };

    return (
        <Link href={`/orders/${order.id}`} passHref>
            <div className="group w-full bg-white rounded-xl border border-neutral-200 overflow-hidden hover:shadow-lg transition-all duration-200">
                {/* Order ID and Date */}
                <div className="p-4 flex justify-between border-b border-neutral-100">
                    <div className="flex items-center">
                        <div className="font-mono text-sm text-secondary mr-3">#{order.id}</div>
                        <div className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                            {order.status}
                        </div>
                    </div>
                    <div className="flex items-center text-sm text-secondary">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        <time dateTime={order.created_at}>{formatDate(order.created_at)}</time>
                    </div>
                </div>

                {/* Order Details */}
                <div className="p-4">
                    <div className="grid grid-cols-12 gap-4">
                        {/* Order Type and Table */}
                        <div className="col-span-4 flex flex-col">
                            <div className="flex items-center mb-4">
                                <div className="bg-accent bg-opacity-10 p-2 rounded-lg mr-3">
                                    {getOrderTypeIcon(order.type)}
                                </div>
                                <div>
                                    <div className="text-xs text-secondText">ประเภทคำสั่งซื้อ</div>
                                    <div className="font-medium text-mainText">{formatOrderType(order.type)}</div>
                                </div>
                            </div>
                            
                            {order.table_id && (
                                <div className="flex items-center">
                                    <div className="bg-accent bg-opacity-10 p-2 rounded-lg mr-3">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
                                        </svg>
                                    </div>
                                    <div>
                                        <div className="text-xs text-secondText">โต๊ะ</div>
                                        <div className="font-medium text-mainText">{order.table_id}</div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Payment Method */}
                        <div className="col-span-4 flex flex-col">
                            <div className="flex items-center">
                                <div className="bg-accent bg-opacity-10 p-2 rounded-lg mr-3">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path>
                                    </svg>
                                </div>
                                <div>
                                    <div className="text-xs text-secondText">การชำระเงิน</div>
                                    <div className="font-medium text-mainText">{formatPaymentMethod(order.payment_method)}</div>
                                </div>
                            </div>

                            {/* Delivery Address (conditional) */}
                            {order.type === 'DELIVERY' && order.address && (
                                <div className="mt-4">
                                    <div className="text-xs text-secondText mb-1">ที่อยู่จัดส่ง</div>
                                    <div className="text-sm text-mainText line-clamp-2">{order.address}</div>
                                </div>
                            )}
                        </div>

                        {/* Price and Action Buttons */}
                        <div className="col-span-4 flex flex-col items-end justify-between">
                            <div className="text-right">
                                <div className="text-xs text-secondText">ยอดรวมทั้งหมด</div>
                                <div className="text-xl font-bold text-mainText">
                                    {new Intl.NumberFormat('th-TH', {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2
                                    }).format(order.sum_price)} ฿
                                </div>
                            </div>

                            {/* Action buttons */}
                            {/* <div className="flex space-x-2 mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                <button className="bg-searchBox hover:bg-neutral-300 text-mainText p-2 rounded-lg transition-colors">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                                    </svg>
                                </button>
                                {order.status !== 'COMPLETED' && order.status !== 'CANCELLED' && (
                                    <>
                                        <button className="bg-acceptGreen bg-opacity-10 hover:bg-acceptGreen hover:bg-opacity-20 text-acceptGreen p-2 rounded-lg transition-colors">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"></path>
                                            </svg>
                                        </button>
                                        <button className="bg-cancelRed bg-opacity-10 hover:bg-cancelRed hover:bg-opacity-20 text-cancelRed p-2 rounded-lg transition-colors">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"></path>
                                            </svg>
                                        </button>
                                    </>
                                )}
                            </div> */}
                        </div>
                    </div>
                </div>

                {/* Order Items Count and Status Indicator */}
                <div className="px-4 py-3 bg-searchBox bg-opacity-30 flex justify-end items-center border-t border-neutral-100">
                    <div className="text-xs text-secondary">
                        คลิกเพื่อดูรายละเอียด
                        <svg className="w-4 h-4 inline-block ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                        </svg>
                    </div>
                </div>
            </div>
        </Link>
    );
}