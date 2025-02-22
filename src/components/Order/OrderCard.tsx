'use client';

import Link from 'next/link';

interface Order {
    id: string;
    created_at: string;
    type: string;
    table_id: string | null;
    status: string;
    payment_method: string;
    sum_price: number;
}

export default function OrderCard({ order }: { order: Order }) {
    const getStatusColor = (status: string): string => {
        switch (status.toLowerCase()) {
            case 'pending': return 'bg-yellow-500 text-white';
            case 'completed': return 'bg-green-500 text-white';
            case 'cancelled': return 'bg-red-500 text-white';
            default: return 'bg-gray-500 text-white';
        }
    };

    return (
        <Link href={`/orders/${order.id}`} passHref>
        
            <div className="px-6 py-8 w-full rounded-xl shadow-lg border border-primary hover:scale-105 hover:shadow-xl">
                {/* Header with Status and Type */}
                <div className="px-6 py-1 flex justify-between items-center">
                    <div className={`px-3 py-1 rounded-full ${getStatusColor(order.status)}`}>
                        {order.status}
                    </div>
                    <div className="px-3 py-1 rounded-full font-bold border border-primary">
                        {order.type}
                    </div>
                </div>

                <div className="px-6 py-1 flex justify-between items-center">
                    
                    <div className="flex flex-col gap-2 text-mainText">
                        <div className="flex items-center gap-2">
                            <span>รหัสคำสั่งซื้อ:</span>
                            <code className="bg-accent px-2 py-0.5 rounded text-white">
                                {order.id}
                            </code>
                        </div>
                        <div className="flex items-center gap-2">
                            <svg className="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                                <path fillRule="evenodd" d="M5 5a1 1 0 0 0 1-1 1 1 0 1 1 2 0 1 1 0 0 0 1 1h1a1 1 0 0 0 1-1 1 1 0 1 1 2 0 1 1 0 0 0 1 1h1a1 1 0 0 0 1-1 1 1 0 1 1 2 0 1 1 0 0 0 1 1 2 2 0 0 1 2 2v1a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7a2 2 0 0 1 2-2ZM3 19v-7a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Zm6.01-6a1 1 0 1 0-2 0 1 1 0 0 0 2 0Zm2 0a1 1 0 1 1 2 0 1 1 0 0 1-2 0Zm6 0a1 1 0 1 0-2 0 1 1 0 0 0 2 0Zm-10 4a1 1 0 1 1 2 0 1 1 0 0 1-2 0Zm6 0a1 1 0 1 0-2 0 1 1 0 0 0 2 0Zm2 0a1 1 0 1 1 2 0 1 1 0 0 1-2 0Z" clipRule="evenodd"/>
                            </svg>
                            <time dateTime={order.created_at}>{order.created_at}</time>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <div>
                            <svg className="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M6 14h2m3 0h5M3 7v10a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1V7a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1Z"/>
                            </svg>
                        </div>
                        <span>{order.payment_method}</span>
                    </div>

                </div>

                <div className="px-6 py-1 flex justify-between items-center">
                    
                    <div className="flex items-center gap-2">

                        <svg className="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M13.09 3.294c1.924.95 3.422 1.69 5.472.692a1 1 0 0 1 1.438.9v9.54a1 1 0 0 1-.562.9c-2.981 1.45-5.382.24-7.25-.701a38.739 38.739 0 0 0-.622-.31c-1.033-.497-1.887-.812-2.756-.77-.76.036-1.672.357-2.81 1.396V21a1 1 0 1 1-2 0V4.971a1 1 0 0 1 .297-.71c1.522-1.506 2.967-2.185 4.417-2.255 1.407-.068 2.653.453 3.72.967.225.108.443.216.655.32Z"/>
                        </svg>

                        <span>{order.table_id ? `โต๊ะที่ ${order.table_id}` : 'ไม่มีโต๊ะ'}</span>
                    </div>

                    <div className="flex">
                    <div className="text-right">
                        <p className="text-secondary">ยอดรวมทั้งหมด</p>

                        <p className="text-xl font-bold">
                            {new Intl.NumberFormat('th-TH', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2
                            }).format(order.sum_price)} ฿
                        </p>
                    </div>
                </div>

                </div>
            </div>

        </Link>
    );
}