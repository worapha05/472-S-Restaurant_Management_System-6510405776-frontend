'use client';

import { useRouter } from 'next/navigation';

interface OrderActionsProps {
    orderId: number;
    status: string;
}

export default function OrderActions({ orderId, status }: OrderActionsProps) {
    const router = useRouter();

    const onOrderCancel = async () => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_CLIENT_API_URL}/api/orders/${orderId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    // if status is not completed, set to cancelled, otherwise set to error
                    status: status === 'PENDING' ? 'CANCELLED' : 'ERROR',
                }),
            });

            if (!res.ok) {
                throw new Error('Failed to cancel order');
            }

            router.refresh();
        } catch (error) {
            console.error('Failed to cancel order:', error);
        }
    };

    const onOrderAccept = async () => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_CLIENT_API_URL}/api/orders/${orderId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    // if status is pending, set to completed, otherwise set to in progress
                    status: status === 'PENDING' ? 'COMPLETED' : 'ERR',
                }),
            });

            if (!res.ok) {
                throw new Error('Failed to update order status');
            }

            router.refresh();
        } catch (error) {
            console.error('Failed to update order:', error);
        }
    };

    if (status === 'COMPLETED' || status === 'CANCELLED') {
        return null;
    }

    return (
        <div className="flex justify-end gap-3 my-6">
            <button
                className="bg-white hover:bg-neutral-100 px-6 py-2 rounded-lg border border-cancelRed text-cancelRed hover:text-hoverCancel flex flex-row gap-2 items-center transition-colors"
                onClick={onOrderCancel}
            >
                <svg fill="#a91d3a" width="1.5rem" height="1.5rem" viewBox="0 0 32 32" version="1.1" xmlns="http://www.w3.org/2000/svg">
                    <path d="M16 29c-7.18 0-13-5.82-13-13s5.82-13 13-13 13 5.82 13 13-5.82 13-13 13zM16 6c-5.522 0-10 4.478-10 10s4.478 10 10 10c5.523 0 10-4.478 10-10s-4.477-10-10-10zM20.537 19.535l-1.014 1.014c-0.186 0.186-0.488 0.186-0.675 0l-2.87-2.87-2.87 2.87c-0.187 0.186-0.488 0.186-0.675 0l-1.014-1.014c-0.186-0.186-0.186-0.488 0-0.675l2.871-2.869-2.871-2.87c-0.186-0.187-0.186-0.489 0-0.676l1.014-1.013c0.187-0.187 0.488-0.187 0.675 0l2.87 2.87 2.87-2.87c0.187-0.187 0.489-0.187 0.675 0l1.014 1.013c0.186 0.187 0.186 0.489 0 0.676l-2.871 2.87 2.871 2.869c0.186 0.187 0.186 0.49 0 0.675z"></path>
                </svg>
                ยกเลิกออเดอร์
            </button>
            <button
                className="bg-acceptGreen hover:bg-hoverAccept text-white px-6 py-2 rounded-lg flex flex-row gap-2 items-center transition-colors"
                onClick={onOrderAccept}
            >
                <svg fill="#FFFFFF" width="1.3rem" height="1.3rem" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path id="accept" d="M1008,120a12,12,0,1,1,12-12A12,12,0,0,1,1008,120Zm0-22a10,10,0,1,0,10,10A10,10,0,0,0,1008,98Zm-0.08,14.333a0.819,0.819,0,0,1-.22.391,0.892,0.892,0,0,1-.72.259,0.913,0.913,0,0,1-.94-0.655l-2.82-2.818a0.9,0.9,0,0,1,1.27-1.271l2.18,2.184,4.46-7.907a1,1,0,0,1,1.38-.385,1.051,1.051,0,0,1,.36,1.417Z" transform="translate(-996 -96)" />
                </svg>
                {status === 'PENDING' ? 'รับออเดอร์' : 'เสร็จสิ้นออเดอร์'}
            </button>
        </div>
    );
}
