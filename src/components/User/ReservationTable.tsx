'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import Loading from '../Loading';

interface ReservationListProps {
  userId?: string;
}

export default function ReservationList({ userId }: ReservationListProps) {
  const { data: session } = useSession();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [filteredReservations, setFilteredReservations] = useState<Reservation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filter state
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const reservationsPerPage = 10;

  // Status options for the filter
  const statusOptions = [
    { value: 'all', label: 'ทั้งหมด' },
    { value: 'confirmed', label: 'ยืนยันแล้ว' },
    { value: 'pending', label: 'รอยืนยัน' },
    { value: 'completed', label: 'เสร็จสิ้น' },
    { value: 'cancelled', label: 'ยกเลิก' }
  ];

  // Format date and time from appointment_time (2025-03-21 15:00:00)
  const formatAppointmentDate = (dateTimeString: string) => {
    try {
      const [datePart, timePart] = dateTimeString.split(' ');
      
      if (!datePart || !timePart) return dateTimeString;
      
      // Format date: DD/MM/YYYY
      const [year, month, day] = datePart.split('-');
      return `${day}/${month}/${year}`;
    } catch (error) {
      console.error('Error formatting appointment date:', error);
      return dateTimeString;
    }
  };

  // Format time from appointment_time (2025-03-21 15:00:00)
  const formatAppointmentTime = (dateTimeString: string) => {
    try {
      const [datePart, timePart] = dateTimeString.split(' ');
      
      if (!datePart || !timePart) return dateTimeString;
      
      // Format time: HH:MM
      return timePart.substring(0, 5);
    } catch (error) {
      console.error('Error formatting appointment time:', error);
      return dateTimeString;
    }
  };

  // Format timestamp (2025-03-20T06:03:19.000000Z)
  const formatTimestamp = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return timestamp;
      }
      
      // Format date: DD/MM/YYYY HH:MM
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      
      return `${day}/${month}/${year} ${hours}:${minutes}`;
    } catch (error) {
      console.error('Error formatting timestamp:', error);
      return timestamp;
    }
  };

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        setIsLoading(true);
        const id = userId || session?.user?.id;
        
        if (!id) {
          setIsLoading(false);
          return;
        }

        const response = await fetch(`${process.env.NEXT_PUBLIC_CLIENT_API_URL}/api/users/${id}/reservations`, {
          headers: {
            'Authorization': `Bearer ${session?.user?.accessToken}`,
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch reservation data');
        }
        
        const data = await response.json();
        const allReservations = data.data || [];
        
        setReservations(allReservations);
        setFilteredReservations(allReservations);
        
        // Calculate total pages based on all reservations
        setTotalPages(Math.ceil(allReservations.length / reservationsPerPage));
      } catch (err) {
        console.error('Error fetching reservations:', err);
        setError('ไม่สามารถโหลดรายการการจองได้');
      } finally {
        setIsLoading(false);
      }
    };

    fetchReservations();
  }, [session, userId]);

  // Apply filters when statusFilter changes
  useEffect(() => {
    // Reset to first page when filter changes
    setCurrentPage(1);
    
    if (statusFilter === 'all') {
      setFilteredReservations(reservations);
    } else {
      const filtered = reservations.filter(reservation => 
        reservation.status.toLowerCase() === statusFilter.toLowerCase()
      );
      setFilteredReservations(filtered);
    }
    
    // Update total pages based on filtered reservations
    setTotalPages(Math.max(1, Math.ceil(
      (statusFilter === 'all' ? reservations.length : filteredReservations.length) / reservationsPerPage
    )));
  }, [statusFilter, reservations]);

  // Get current reservations for pagination
  const indexOfLastReservation = currentPage * reservationsPerPage;
  const indexOfFirstReservation = indexOfLastReservation - reservationsPerPage;
  const currentReservations = filteredReservations.slice(indexOfFirstReservation, indexOfLastReservation);

  // Change page
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  // Get button style based on filter selection
  const getFilterButtonStyle = (value: string) => {
    return statusFilter === value 
      ? "bg-button text-background" 
      : "bg-background text-primary hover:bg-searchBox";
  };

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

      const body = {
        status: 'CANCELLED'
      };
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_CLIENT_API_URL}/api/reservations/${reservationId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.user?.accessToken}`,
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error('ไม่สามารถยกเลิกการจองได้');
      }

      // Update the local state to reflect the change
      setReservations(prevReservations => 
        prevReservations.map(reservation => 
          reservation.id === reservationId 
            ? { ...reservation, status: 'CANCELLED' } 
            : reservation
        )
      );

      // Also update filtered reservations
      setFilteredReservations(prevReservations => 
        prevReservations.map(reservation => 
          reservation.id === reservationId 
            ? { ...reservation, status: 'CANCELLED' } 
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
      <Loading message='กําลังโหลด...'/>
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
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-mainText mb-4">ประวัติการจอง</h2>
        
        {/* Status Filter Toggle Buttons */}
        <div className="flex flex-wrap gap-2">
          {statusOptions.map(option => (
            <button
              key={option.value}
              onClick={() => setStatusFilter(option.value)}
              className={`px-4 py-2 text-sm border border-searchBox rounded-md transition-colors ${getFilterButtonStyle(option.value)}`}
            >
              {option.label}
              {option.value !== 'all' && (
                <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-gray-200 text-gray-700">
                  {reservations.filter(reservation => reservation.status.toLowerCase() === option.value.toLowerCase()).length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
      
      {filteredReservations.length > 0 ? (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-searchBox">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-secondText tracking-wider">
                    เลขที่การจอง
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-secondText tracking-wider">
                    วันที่จอง
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-secondText tracking-wider">
                    เวลาจอง
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-secondText tracking-wider">
                    วันที่สร้าง
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-secondText tracking-wider">
                    เลขโต๊ะ
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
                {currentReservations.map((reservation) => (
                  <tr key={reservation.id}>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-mainText">
                      {reservation.id}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-primary">
                      {formatAppointmentDate(reservation.appointment_time)}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-primary">
                      {formatAppointmentTime(reservation.appointment_time)}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-primary">
                      {formatTimestamp(reservation.created_at)}
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
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center mt-6">
              <nav className="flex items-center">
                <button
                  onClick={() => paginate(currentPage > 1 ? currentPage - 1 : 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1 rounded-md mr-2 border border-searchBox disabled:opacity-50 disabled:cursor-not-allowed text-primary hover:bg-searchBox"
                >
                  ก่อนหน้า
                </button>
                
                <div className="flex space-x-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => paginate(page)}
                      className={`px-3 py-1 rounded-md border ${
                        currentPage === page
                          ? 'bg-button text-background border-transparent'
                          : 'border-searchBox text-primary hover:bg-searchBox'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
                
                <button
                  onClick={() => paginate(currentPage < totalPages ? currentPage + 1 : totalPages)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 rounded-md ml-2 border border-searchBox disabled:opacity-50 disabled:cursor-not-allowed text-primary hover:bg-searchBox"
                >
                  ถัดไป
                </button>
              </nav>
            </div>
          )}
          
          <div className="mt-4 text-center text-xs text-secondText">
            แสดง {filteredReservations.length > 0 ? indexOfFirstReservation + 1 : 0} - {Math.min(indexOfLastReservation, filteredReservations.length)} จาก {filteredReservations.length} รายการ
            {statusFilter !== 'all' && ` (กรองตามสถานะ: ${statusOptions.find(o => o.value === statusFilter)?.label || statusFilter})`}
          </div>
        </>
      ) : (
        <div className="text-center py-10">
          {statusFilter === 'all' ? (
            <p className="text-secondText">ไม่มีประวัติการจอง</p>
          ) : (
            <p className="text-secondText">
              ไม่พบการจองที่มีสถานะ "{statusOptions.find(o => o.value === statusFilter)?.label}"
              <button 
                onClick={() => setStatusFilter('all')} 
                className="ml-2 text-inputFieldFocus hover:underline"
              >
                ดูทั้งหมด
              </button>
            </p>
          )}
        </div>
      )}
    </div>
  );
}