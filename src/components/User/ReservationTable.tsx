'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

interface ReservationListProps {
  userId?: string;
}

export default function ReservationList({ userId }: ReservationListProps) {
  const { data: session } = useSession();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        setIsLoading(true);
        const id = userId || session?.user?.id;
        
        if (!id) {
          setIsLoading(false);
          return;
        }

        const response = await fetch(`${process.env.NEXT_PUBLIC_CLIENT_API_URL}/api/users/${id}/reservations`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch reservation data');
        }
        
        const data = await response.json();
        setReservations(data.data || []);
      } catch (err) {
        console.error('Error fetching reservations:', err);
        setError('ไม่สามารถโหลดรายการการจองได้');
      } finally {
        setIsLoading(false);
      }
    };

    fetchReservations();
  }, [session, userId]);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
      case 'completed':
        return 'bg-acceptGreen text-background';
      case 'pending':
        return 'bg-searchBox text-primary';
      case 'cancelled':
        return 'bg-cancelRed text-background';
      default:
        return 'bg-searchBox text-primary';
    }
  };

  const getStatusText = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed': return 'ยืนยันแล้ว';
      case 'completed': return 'เสร็จสิ้น';
      case 'pending': return 'รอยืนยัน';
      case 'cancelled': return 'ยกเลิก';
      default: return status;
    }
  };

  const handleCancelReservation = async (reservationId: string) => {
    try {
      if (!confirm('คุณต้องการยกเลิกการจองนี้ใช่หรือไม่?')) {
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_CLIENT_API_URL}/api/reservations/${reservationId}/cancel`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error('ไม่สามารถยกเลิกการจองได้');
      }

      // Update the local state to reflect the change
      setReservations(prevReservations => 
        prevReservations.map(reservation => 
          reservation.id === reservationId 
            ? { ...reservation, status: 'cancelled' } 
            : reservation
        )
      );

    } catch (err) {
      console.error('Error cancelling reservation:', err);
      alert('ไม่สามารถยกเลิกการจองได้ กรุณาลองใหม่อีกครั้ง');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-inputFieldFocus"></div>
        <span className="ml-2 text-secondText">กำลังโหลด...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-cancelRed/10 border-l-4 border-cancelRed p-4 rounded">
        <p className="text-cancelRed">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-background shadow-sm rounded-lg p-6 border border-searchBox">
      <h2 className="text-2xl font-semibold text-mainText mb-6">ประวัติการจอง</h2>
      
      {reservations.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-searchBox">
            <thead>
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-secondText tracking-wider">
                  เลขที่การจอง
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-secondText tracking-wider">
                  วันที่
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-secondText tracking-wider">
                  เวลา
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-secondText tracking-wider">
                  จำนวนคน
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-secondText tracking-wider">
                  สถานะ
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-secondText tracking-wider">
                  การจัดการ
                </th>
              </tr>
            </thead>
            <tbody className="bg-background divide-y divide-searchBox">
              {reservations.map((reservation) => (
                <tr key={reservation.id}>
                  <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-mainText">
                    {reservation.id}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-primary">
                    {new Date(reservation.date).toLocaleDateString('th-TH')}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-primary">
                    {reservation.appointment_time}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-primary">
                    {reservation.table_id}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(reservation.status)}`}>
                      {getStatusText(reservation.status)}
                    </span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-primary">
                    <Link href={`/reservations/${reservation.id}`} className="text-inputFieldFocus hover:text-primary">
                      ดูรายละเอียด
                    </Link>
                    {reservation.status.toLowerCase() === 'pending' && (
                      <button 
                        onClick={() => handleCancelReservation(reservation.id)}
                        className="ml-3 text-cancelRed hover:text-hoverCancel"
                      >
                        ยกเลิก
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-10">
          <p className="text-secondText">ไม่มีประวัติการจอง</p>
        </div>
      )}
    </div>
  );
}