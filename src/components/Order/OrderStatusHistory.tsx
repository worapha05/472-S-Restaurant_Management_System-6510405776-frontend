'use client';

interface OrderProps {
    id: number;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
    status: string;
    accept: string | null;
}

// Get status color class
function getStatusColor(status: string): string {
    switch (status.toUpperCase()) {
        case 'PENDING': return 'bg-orange-100 text-orange-700';
        case 'IN_PROGRESS': return 'bg-inputFieldFocus text-white';
        case 'COMPLETED': return 'bg-green-100 text-green-700';
        case 'CANCELLED': return 'bg-red-100 text-red-700';
        default: return 'bg-gray-100 text-gray-700';
    }
}

function getStatusDescription(status: string): string {
    switch (status.toUpperCase()) {
        case 'PENDING': return 'ออเดอร์รอการยืนยัน';
        case 'ACCEPTED': return 'ออเดอร์ได้รับการยืนยัน';
        case 'IN_PROGRESS': return 'ออเดอร์กำลังดำเนินการ';
        case 'COMPLETED': return 'ออเดอร์สำเร็จ';
        case 'CANCELLED': return 'ออเดอร์ถูกยกเลิก';
        default: return 'เกิดข้อผิดพลาด';
    }
}

const formatOrderStatus = (status: string) => {
    switch (status) {
        case 'PENDING': return 'รอดำเนินการ';
        case 'IN_PROGRESS': return 'กำลังดำเนินการ';
        case 'ACCEPTED': return 'ตอบรับคำสั่งซื้อ';
        case 'COMPLETED': return 'เสร็จสิ้น';
        case 'CANCELLED': return 'ยกเลิก';
        default: return status;
    }
  };
// Format date for display
function formatDate(dateString: string) {
    let date: Date;

    if (dateString.includes('T')) {
        // ISO format with timezone - parse as is
        date = new Date(dateString);
    } else {
        // Local time format (YYYY-MM-DD HH:mm:ss) - treat as Bangkok time
        const [datePart, timePart] = dateString.split(' ');
        date = new Date(`${datePart}T${timePart}+07:00`);
    }

    const formatter = new Intl.DateTimeFormat('th-TH', {
        timeZone: 'Asia/Bangkok',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    });

    return formatter.format(date);
}

// component housing each status history
function Status({ status, date }: { status: string, date: string }) {
    return (
        <div className="flex items-start">
            <div className="mr-4 relative">
                <div className={`w-4 h-4 rounded-full mt-1 ${getStatusColor(status).split(' ')[0].replace('bg-', 'bg-')}`}></div>
                {status !== 'PENDING' && (
                    <span className="absolute top-6 bottom-0 left-2 w-0.5 -ml-px h-[185%] bg-secondary opacity-40" />
                )}
            </div>
            <div className="flex-1">
                <div className="flex justify-between">
                    <div className="flex flex-col gap-2">
                        <span className={`px-2 py-0.5 rounded-full text-xs max-w-fit ${getStatusColor(status)}`}>
                            {formatOrderStatus(status)}
                        </span>
                        <p className="text-sm text-neutral-500">
                            {getStatusDescription(status)}
                        </p>
                    </div>
                    <time className="text-sm text-neutral-500">
                        {formatDate(date)}
                    </time>
                </div>
            </div>
        </div>
    );
}

export default function OrderStatusHistory({ order }: { order: OrderProps }) {
    return (
        <div className="space-y-4">
            {/* if any other status exists that is not PENDING, display it with description inside, if not hide it */}
            {order.status !== 'PENDING' && (
                <Status status={order.status} date={order.updated_at} />
            )}

            {/* if status accept exists, display it, if not hide it */}
            {order.accept && (
                <Status status='ACCEPTED' date={order.accept} />
            )}


            {/* initial status (always visible) */}
            <Status status='PENDING' date={order.created_at} />
        </div>
    );
}