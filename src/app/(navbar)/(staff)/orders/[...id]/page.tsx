// app/orders/[id]/page.tsx
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';

// Type definitions
interface OrderItem {
  id: number;
  name: string;
  quantity: number;
  price: number;
  options?: string[];
  notes?: string;
}

interface Order {
  id: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  type: string;
  table_id: number | null;
  status: string;
  payment_method: string;
  sum_price: number;
  address: string | null;
  accept: string | null;
  user_id: number;
  items?: OrderItem[]; // Order items if available in your API
  customer?: {
    name: string;
    phone: string;
  };
}

// Loading component
function OrderDetailLoading() {
  return (
    <div className="w-full max-w-5xl animate-pulse">
      <div className="bg-white rounded-xl p-6 mb-4">
        <div className="h-8 bg-neutral-100 rounded w-1/3 mb-4"></div>
        <div className="h-4 bg-neutral-100 rounded w-1/2 mb-2"></div>
        <div className="h-4 bg-neutral-100 rounded w-1/4"></div>
      </div>
      <div className="bg-white rounded-xl p-6 mb-4">
        <div className="h-6 bg-neutral-100 rounded w-1/4 mb-4"></div>
        <div className="grid grid-cols-12 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="col-span-12">
              <div className="h-16 bg-neutral-100 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Function to get a single order by ID
async function getOrderById(id: string) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_SERVER_API_URL}/api/orders/${id}`);
    
    if (!res.ok) {
      if (res.status === 404) {
        return null;
      }
      throw new Error('Failed to fetch order data');
    }
    
    const resJson = await res.json();
    return resJson.data || null;
  } catch (error) {
    console.error("Error fetching order details:", error);
    return null;
  }
}

// Sample order items (replace with actual API data if available)
const sampleItems: OrderItem[] = [
  { id: 1, name: 'ข้าวผัดกระเพรา', quantity: 2, price: 120, options: ['ไข่ดาว', 'พิเศษ'], notes: 'เผ็ดน้อย' },
  { id: 2, name: 'ส้มตำไทย', quantity: 1, price: 80, options: ['ไม่ใส่ปลาร้า'] },
  { id: 3, name: 'น้ำเปล่า', quantity: 3, price: 45 }
];

// Format date for display
function formatDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleString('th-TH', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// Format payment method for display
function formatPaymentMethod(method: string) {
  switch (method) {
    case 'CREDIT_CARD': return 'บัตรเครดิต';
    case 'CASH': return 'เงินสด';
    case 'BANK_TRANSFER': return 'โอนเงิน';
    case 'QR_CODE': return 'QR Code';
    default: return method;
  }
}

// Get status color class
function getStatusColor(status: string): string {
  switch (status.toUpperCase()) {
    case 'PENDING': return 'bg-orange-100 text-orange-700';
    case 'IN_PROGRESS': return 'bg-primary-100 text-primary-700';
    case 'COMPLETED': return 'bg-green-100 text-green-700';
    case 'CANCELLED': return 'bg-red-100 text-red-700';
    default: return 'bg-gray-100 text-gray-700';
  }
}

// Order status history component (placeholder)
function OrderStatusHistory() {
  const statuses = [
    { status: 'PENDING', date: '2025-03-02T16:45:30Z', note: 'รับออเดอร์' },
    { status: 'IN_PROGRESS', date: '2025-03-02T16:50:45Z', note: 'กำลังจัดเตรียมอาหาร' },
    { status: 'CANCELLED', date: '2025-03-02T17:10:20Z', note: 'ลูกค้ายกเลิก: สั่งอาหารผิด' }
  ];

  return (
    <div className="space-y-4">
      {statuses.map((statusItem, index) => (
        <div key={index} className="flex items-start">
          <div className="mr-4 relative">
            <div className={`w-4 h-4 rounded-full mt-1 ${getStatusColor(statusItem.status).split(' ')[0].replace('bg-', 'bg-')}`}></div>
            {index < statuses.length - 1 && (
              <div className="absolute top-5 bottom-0 left-2 w-0.5 -ml-px h-full bg-neutral-200"></div>
            )}
          </div>
          <div className="flex-1">
            <div className="flex justify-between">
              <span className={`px-2 py-0.5 rounded-full text-xs ${getStatusColor(statusItem.status)}`}>
                {statusItem.status}
              </span>
              <time className="text-sm text-neutral-500">
                {formatDate(statusItem.date)}
              </time>
            </div>
            <p className="mt-1 text-sm">{statusItem.note}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

// Order detail content component
function OrderDetail({ order }: { order: Order }) {
  // Use sample items if no items in order data
  const orderItems = order.items || sampleItems;
  
  // Calculate subtotal and tax (assuming 7% VAT)
  const subtotal = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = subtotal * 0.07;
  
  return (
    <div className="w-full max-w-5xl">
      {/* Header with back button and actions */}
      <div className="flex justify-between items-center mb-6">
        <Link href="/orders" className="flex items-center text-primary-600 hover:text-primary-700">
          <span className="material-symbols-outlined mr-1">arrow_back</span>
          กลับไปยังรายการคำสั่งซื้อ
        </Link>
        
        <div className="flex gap-2">
          <button className="bg-white hover:bg-neutral-100 px-4 py-2 rounded-lg border border-neutral-200 flex items-center">
            <span className="material-symbols-outlined mr-2">print</span>
            พิมพ์
          </button>
          {order.status !== 'COMPLETED' && order.status !== 'CANCELLED' && (
            <button className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg flex items-center">
              <span className="material-symbols-outlined mr-2">edit</span>
              แก้ไข
            </button>
          )}
        </div>
      </div>
      
      {/* Order Status Card */}
      <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden mb-6">
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-2xl font-bold mb-2">ออเดอร์ #{order.id}</h1>
              <p className="text-neutral-500">
                <time dateTime={order.created_at}>{formatDate(order.created_at)}</time>
              </p>
            </div>
            <div className={`px-4 py-1.5 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
              {order.status}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 border-t border-neutral-200 pt-6">
            <div>
              <h3 className="text-sm font-medium text-neutral-500 mb-1">ประเภท</h3>
              <p className="font-medium">{order.type}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-neutral-500 mb-1">โต๊ะ</h3>
              <p className="font-medium">{order.table_id ? `โต๊ะที่ ${order.table_id}` : 'ไม่มีโต๊ะ'}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-neutral-500 mb-1">วิธีการชำระเงิน</h3>
              <p className="font-medium">{formatPaymentMethod(order.payment_method)}</p>
            </div>
            
            {order.type === 'DELIVERY' && order.address && (
              <div className="col-span-1 md:col-span-3">
                <h3 className="text-sm font-medium text-neutral-500 mb-1">ที่อยู่จัดส่ง</h3>
                <p className="whitespace-pre-line">{order.address}</p>
              </div>
            )}
            
            {order.customer && (
              <div className="col-span-1 md:col-span-3">
                <h3 className="text-sm font-medium text-neutral-500 mb-1">ข้อมูลลูกค้า</h3>
                <p>{order.customer.name}</p>
                <p>{order.customer.phone}</p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Order Items */}
      <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden mb-6">
        <div className="p-6">
          <h2 className="text-xl font-bold mb-4">รายการอาหาร</h2>
          
          <div className="border-b border-neutral-200 pb-4 mb-4">
            {orderItems.map((item, index) => (
              <div key={index} className="flex justify-between py-3 border-b border-neutral-100 last:border-0">
                <div>
                  <div className="flex items-start">
                    <span className="font-medium text-lg">{item.quantity} x</span>
                    <div className="ml-2">
                      <h4 className="font-medium">{item.name}</h4>
                      {item.options && item.options.length > 0 && (
                        <p className="text-sm text-neutral-500">{item.options.join(', ')}</p>
                      )}
                      {item.notes && (
                        <p className="text-sm text-neutral-500 italic">หมายเหตุ: {item.notes}</p>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">
                    {new Intl.NumberFormat('th-TH', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    }).format(item.price * item.quantity)} ฿
                  </p>
                  <p className="text-sm text-neutral-500">
                    {item.quantity > 1 ? `${item.price} ฿/ชิ้น` : ''}
                  </p>
                </div>
              </div>
            ))}
          </div>
          
          {/* Order Summary */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-neutral-500">รวม</span>
              <span>
                {new Intl.NumberFormat('th-TH', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                }).format(subtotal)} ฿
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500">ภาษีมูลค่าเพิ่ม (7%)</span>
              <span>
                {new Intl.NumberFormat('th-TH', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                }).format(tax)} ฿
              </span>
            </div>
            <div className="flex justify-between pt-2 border-t border-neutral-200">
              <span className="font-bold">รวมทั้งสิ้น</span>
              <span className="font-bold text-xl text-primary-600">
                {new Intl.NumberFormat('th-TH', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                }).format(order.sum_price)} ฿
              </span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Order History */}
      <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden mb-6">
        <div className="p-6">
          <h2 className="text-xl font-bold mb-4">ประวัติสถานะ</h2>
          <OrderStatusHistory />
        </div>
      </div>
      
      {/* Action Buttons for Order Management */}
      {order.status !== 'COMPLETED' && order.status !== 'CANCELLED' && (
        <div className="flex justify-end gap-3 my-6">
          <button className="bg-white hover:bg-neutral-100 px-6 py-2 rounded-lg border border-red-500 text-red-500 hover:text-red-600 flex items-center">
            <span className="material-symbols-outlined mr-2">cancel</span>
            ยกเลิกออเดอร์
          </button>
          <button className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-lg flex items-center">
            <span className="material-symbols-outlined mr-2">check_circle</span>
            {order.status === 'PENDING' ? 'รับออเดอร์' : 'เสร็จสิ้นออเดอร์'}
          </button>
        </div>
      )}
    </div>
  );
}

// Main order detail page component
export default async function OrderDetailPage({ params }: { params: { id: string } }) {
  const order = await getOrderById(params.id);

  console.log('Fetched order:', order);
  
  
  if (!order) {
    notFound();
  }
  
  return (
    <div className="flex flex-col items-center justify-center w-full px-4 py-6 bg-neutral-50 min-h-screen">
      <Suspense fallback={<OrderDetailLoading />}>
        <OrderDetail order={order} />
      </Suspense>
    </div>
  );
}