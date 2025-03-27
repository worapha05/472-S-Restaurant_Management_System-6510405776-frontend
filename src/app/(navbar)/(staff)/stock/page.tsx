'use client';

import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import AutoDismissAlert from '@/components/Notification/Notification';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

interface StockItem {
  id: number;
  name: string;
  category: string;
  current_stock: number;
  unit: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  isEditing?: boolean;
}

interface NewStockItem {
  name: string;
  current_stock: number | string;
  unit: string;
  category: string;
}

type ErrorResponse = {
  message: string;
  errors: {
    [key: string]: string[];
  };
};

const categoryMapping: { [key: string]: string } = {
  'MEAT': 'เนื้อสัตว์',
  'VEGETABLES': 'ผัก',
  'FRUITS': 'ผลไม้',
  'EGGS DAIRY': 'ไข่ & นม',
  'GRAINS STARCHES': 'ธัญพืช & แป้ง',
  'SEASONINGS': 'เครื่องปรุง',
  'OILS FATS': 'น้ำมัน & ไขมัน',
  'OTHERS': 'อื่น ๆ'
};

const translateCategory = (category: string): string => {
  return categoryMapping[category] || 'นอกเหนือจากข้อมูลที่มี';
};

const reverseTranslateCategory = (thaiCategory: string): string => {
  const entry = Object.entries(categoryMapping).find(([_, value]) => value === thaiCategory);
  return entry ? entry[0] : 'OTHERS';
};

const categories: string[] = ['เนื้อสัตว์', 'ผัก', 'ผลไม้', 'ไข่ & นม', 'ธัญพืช & แป้ง', 'เครื่องปรุง', 'น้ำมัน & ไขมัน', 'อื่น ๆ'];

export default function Inventory() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const [StockItems, setStockItems] = useState<StockItem[]>([]);
  const [newStockItem, setNewStockItem] = useState<NewStockItem>({
    name: '',
    current_stock: 0,
    unit: '',
    category: ''
  });
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortField, setSortField] = useState<keyof StockItem>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [filterCategory, setFilterCategory] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);
  const [typeNotification, setTypeNotification] = useState<string>('');
  const [messageNotification, setMessageNotification] = useState<string>('');
  const [isOpenNotification, setIsOpenNotification] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [formErrors, setFormErrors] = useState<any>({});

  useEffect(() => {
    // Check if user is authenticated
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }
    if (status === 'authenticated' && session?.user?.role !== 'ADMIN') {
      router.push('/');
    }
  }, [session, status, router]);

  useEffect(() => {
    if (isOpenNotification) {
      const timer = setTimeout(() => {
        setIsOpenNotification(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isOpenNotification]);

  const fetchStockItems = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_CLIENT_API_URL}/api/stockItems`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${session.user.accessToken}`
        }
      });
      if (!response.ok) throw new Error('เกิดข้อผิดพลาดในการโหลดข้อมูล');
      const data = await response.json();

      if (data.data) {
        setStockItems(data.data);
      } else {
        setStockItems([]);
        throw new Error('ข้อมูลที่ได้รับไม่อยู่ในรูปแบบที่ถูกต้อง');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาด');
      setStockItems([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (session && session.user && session.user.accessToken) {
      fetchStockItems();
      setTypeNotification('success');
      setMessageNotification('ดึงข้อมูลวัตถุดิบสำเร็จแล้ว');
      setIsOpenNotification(true);
    }
  }, [session, status]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewStockItem({
      ...newStockItem,
      [name]: name === 'current_stock'
        ? (parseFloat(value) || 0)
        : value
    });
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: undefined
      });
    }
  };

  const resetFilters = () => {
    setSearchTerm('');
    setFilterCategory('');
    setSortField('name');
    setSortDirection('asc');
    setCurrentPage(1);
  };

  const addStockItem = async (e: FormEvent) => {
    e.preventDefault();

    try {
      setIsLoading(true);
      setFormErrors({});
      const response = await fetch(`${process.env.NEXT_PUBLIC_CLIENT_API_URL}/api/stockItems`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${session.user.accessToken}`
        },
        body: JSON.stringify(newStockItem),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorData = data as ErrorResponse;
        setFormErrors(errorData.errors);
      } else {
        setTypeNotification('success');
        setMessageNotification('เพิ่มวัตถุดิบใหม่สำเร็จ');
        setIsOpenNotification(true);
      }

      await fetchStockItems();
      setNewStockItem({ name: '', current_stock: 0, unit: '', category: '' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาด');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleEditMode = (id: number) => {
    setStockItems(
      StockItems.map(item =>
        item.id === id
          ? { ...item, isEditing: !item.isEditing }
          : item
      )
    );
  };

  const updateStockItem = async (id: number, field: keyof StockItem, value: string) => {
    if (field === 'name' && !value.trim()) return;
    if (field === 'unit' && !value.trim()) return;

    setStockItems(
      StockItems.map(item =>
        item.id === id
          ? { ...item, [field]: value }
          : item
      )
    );
  };

  const saveEdit = async (id: number) => {
    try {
      setIsLoading(true);
      const updatedData = StockItems.find(item => item.id === id);
      if (!updatedData) return;

      const response = await fetch(`${process.env.NEXT_PUBLIC_CLIENT_API_URL}/api/stockItems/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${session.user.accessToken}`
        },
        body: JSON.stringify(updatedData),
      });

      const data = await response.json();

      if (!response.ok) {
        setTypeNotification('error');
        const errorMessages = Object.entries(data.errors)
          .flatMap(([key, messages]) => messages)
          .join(", ");
        setMessageNotification(`แก้ไขวัตถุดิบไม่สำเร็จ: ${errorMessages}`);
        setIsOpenNotification(true);
        return;
      }

      setTypeNotification('success');
      setMessageNotification('แก้ไขวัตถุดิบสำเร็จ');
      setIsOpenNotification(true);

      setStockItems(
        StockItems.map(item =>
          item.id === id
            ? { ...item, isEditing: false, updated_at: new Date().toISOString() }
            : item
        )
      );

      await fetchStockItems();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาด');
      setTypeNotification('error');
      setMessageNotification('เกิดข้อผิดพลาดในการแก้ไขวัตถุดิบ');
      setIsOpenNotification(true);
    } finally {
      setIsLoading(false);
    }
  };

  const cancelEdit = async (id: number) => {
    try {
      setStockItems(
        StockItems.map(item =>
          item.id === id
            ? { ...item, isEditing: false }
            : item
        )
      );
      await fetchStockItems();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาด');
      setTypeNotification('error');
      setMessageNotification('เกิดข้อผิดพลาดในการยกเลิกการแก้ไข');
      setIsOpenNotification(true);
    }
  };

  const handleSort = (field: keyof StockItem) => {
    const newDirection = sortField === field && sortDirection === 'asc' ? 'desc' : 'asc';
    setSortField(field);
    setSortDirection(newDirection);
  };

  const handleItemsPerPageChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setItemsPerPage(parseInt(e.target.value));
    setCurrentPage(1);
  };

  const filteredStockItems = Array.isArray(StockItems) ? StockItems
    .filter(item => {
      const nameMatch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
      const categoryMatch = filterCategory === '' ||
        item.category.replace('&amp;', '&') === filterCategory.replace('&amp;', '&');
      return nameMatch && categoryMatch;
    })
    .sort((a, b) => {
      let comparison = 0;

      if (sortField === 'name') {
        comparison = a.name.localeCompare(b.name, 'th');
      } else if (sortField === 'updated_at') {
        comparison = new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime();
      } else if (sortField === 'category') {
        comparison = a.category.localeCompare(b.category, 'th');
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    }) : [];

  const totalPages = Math.ceil(filteredStockItems.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredStockItems.slice(indexOfFirstItem, indexOfLastItem);

  const paginationButtons = () => {
    const buttons = [];
    const maxButtons = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxButtons / 2));
    let endPage = Math.min(totalPages, startPage + maxButtons - 1);

    if (endPage - startPage + 1 < maxButtons) {
      startPage = Math.max(1, endPage - maxButtons + 1);
    }

    buttons.push(
      <button
        key="prev"
        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
        disabled={currentPage === 1}
        className={`px-3 py-1 rounded-md mx-1 ${currentPage === 1
          ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
          : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
          }`}
      >
        &laquo;
      </button>
    );

    if (startPage > 1) {
      buttons.push(
        <button
          key={1}
          onClick={() => setCurrentPage(1)}
          className="px-3 py-1 rounded-md mx-1 bg-gray-200 hover:bg-gray-300 text-gray-700"
        >
          1
        </button>
      );

      if (startPage > 2) {
        buttons.push(
          <span key="ellipsis1" className="px-3 py-1">
            ...
          </span>
        );
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <button
          key={i}
          onClick={() => setCurrentPage(i)}
          className={`px-3 py-1 rounded-md mx-1 ${currentPage === i
            ? 'bg-blue-500 text-white'
            : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
            }`}
        >
          {i}
        </button>
      );
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        buttons.push(
          <span key="ellipsis2" className="px-3 py-1">
            ...
          </span>
        );
      }

      buttons.push(
        <button
          key={totalPages}
          onClick={() => setCurrentPage(totalPages)}
          className="px-3 py-1 rounded-md mx-1 bg-gray-200 hover:bg-gray-300 text-gray-700"
        >
          {totalPages}
        </button>
      );
    }

    buttons.push(
      <button
        key="next"
        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
        disabled={currentPage === totalPages || totalPages === 0}
        className={`px-3 py-1 rounded-md mx-1 ${currentPage === totalPages || totalPages === 0
          ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
          : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
          }`}
      >
        &raquo;
      </button>
    );

    return buttons;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {isOpenNotification && (
        <AutoDismissAlert
          message={messageNotification}
          type={typeNotification}
          duration={3000}
        />
      )}

      {isLoading && (
        <div className="flex justify-center items-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold mb-8">ระบบจัดการวัตถุดิบ</h1>

        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-xl font-semibold mb-4">เพิ่มวัตถุดิบใหม่</h2>
          <form onSubmit={addStockItem} className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อวัตถุดิบ</label>
              <input
                type="text"
                name="name"
                value={newStockItem.name}
                onChange={handleInputChange}
                className={`w-full p-2 border ${formErrors?.name ? 'border-red-500' : 'border-gray-300'} rounded-md`}
                placeholder="ชื่อวัตถุดิบ"
              />
              {formErrors?.name && (
                <p className="mt-1 text-sm text-red-500">{formErrors?.name[0]}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">หน่วย</label>
              <input
                type="text"
                name="unit"
                value={newStockItem.unit}
                onChange={handleInputChange}
                className={`w-full p-2 border ${formErrors?.unit ? 'border-red-500' : 'border-gray-300'} rounded-md`}
                placeholder="กิโลกรัม, กรัม, ลิตร, ฯลฯ"
              />
              {formErrors?.unit && (
                <p className="mt-1 text-sm text-red-500">{formErrors?.unit[0]}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">หมวดหมู่</label>
              <select
                name="category"
                value={newStockItem.category}
                onChange={handleInputChange}
                className={`w-full p-2 border ${formErrors?.category ? 'border-red-500' : 'border-gray-300'} rounded-md`}
              >
                <option value="">เลือกหมวดหมู่</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
              {formErrors?.category && (
                <p className="mt-1 text-sm text-red-500">{formErrors?.category[0]}</p>
              )}
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md transition duration-200"
              >
                เพิ่มวัตถุดิบ
              </button>
            </div>
          </form>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ค้นหา</label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="ค้นหาจากชื่อ"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">กรองตามหมวดหมู่</label>
              <select
                value={translateCategory(filterCategory)}
                onChange={(e: ChangeEvent<HTMLSelectElement>) => setFilterCategory(reverseTranslateCategory(e.target.value))}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="">ทั้งหมด</option>
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={resetFilters}
                className="w-full bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-md transition duration-200"
              >
                รีเซ็ตตัวกรอง
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th
                    className="px-4 py-3 text-left cursor-pointer hover:bg-gray-200"
                    onClick={() => handleSort('name')}
                  >
                    ชื่อวัตถุดิบ
                    {sortField === 'name' && (
                      <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </th>
                  <th className="px-4 py-3 text-left">จำนวนคงเหลือ</th>
                  <th className="px-4 py-3 text-left">หน่วย</th>
                  <th
                    className="px-4 py-3 text-left cursor-pointer hover:bg-gray-200"
                    onClick={() => handleSort('category')}
                  >
                    หมวดหมู่
                    {sortField === 'category' && (
                      <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </th>
                  <th
                    className="px-4 py-3 text-left cursor-pointer hover:bg-gray-200"
                    onClick={() => handleSort('updated_at')}
                  >
                    อัปเดตล่าสุด
                    {sortField === 'updated_at' && (
                      <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </th>
                  <th className="px-4 py-3 text-left">การกระทำ</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.length > 0 ? (
                  currentItems.map(StockItem => (
                    <tr key={StockItem.id} className="border-t border-gray-200 hover:bg-gray-50">
                      <td className="px-4 py-3">
                        {StockItem.isEditing ? (
                          <input
                            type="text"
                            value={StockItem.name}
                            onChange={(e) => updateStockItem(StockItem.id, 'name', e.target.value)}
                            className={`w-full p-1 border  'border-gray-300'} rounded-md`}
                          />
                        ) : (
                          <span>{StockItem.name}</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span>{StockItem.current_stock}</span>
                      </td>
                      <td className="px-4 py-3">
                        {StockItem.isEditing ? (
                          <input
                            type="text"
                            value={StockItem.unit}
                            onChange={(e) => updateStockItem(StockItem.id, 'unit', e.target.value)}
                            className={`w-full p-1 border  'border-gray-300'} rounded-md`}
                          />
                        ) : (
                          <span>{StockItem.unit}</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {StockItem.isEditing ? (
                          <select
                            value={translateCategory(StockItem.category)}
                            onChange={(e) => {
                              updateStockItem(StockItem.id, 'category', reverseTranslateCategory(e.target.value));
                            }}
                            className={`w-full p-1 border 'border-gray-300'} rounded-md`}
                          >
                            {categories.map(category => (
                              <option key={category} value={category}>{category}</option>
                            ))}
                          </select>
                        ) : (
                          <span>{translateCategory(StockItem.category)}</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {new Date(StockItem.updated_at).toLocaleString('th-TH')}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex space-x-2">
                          {StockItem.isEditing ? (
                            <>
                              <button
                                onClick={() => saveEdit(StockItem.id)}
                                className="bg-green-500 hover:bg-green-600 text-white py-1 px-3 rounded-md transition duration-200"
                              >
                                บันทึก
                              </button>
                              <button
                                onClick={() => cancelEdit(StockItem.id)}
                                className="bg-gray-500 hover:bg-gray-600 text-white py-1 px-3 rounded-md transition duration-200"
                              >
                                ยกเลิก
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => toggleEditMode(StockItem.id)}
                                className="bg-yellow-500 hover:bg-yellow-600 text-white py-1 px-3 rounded-md transition duration-200"
                              >
                                แก้ไข
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                      ไม่พบวัตถุดิบที่ตรงกับการค้นหา
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="p-4 bg-gray-50 border-t border-gray-200">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="mb-4 md:mb-0">
                <p className="text-gray-600">
                  จำนวนวัตถุดิบทั้งหมด: {StockItems.length} รายการ (แสดง {filteredStockItems.length} รายการ)
                </p>
                <p className="text-gray-600 mt-1">
                  กำลังแสดงรายการที่ {indexOfFirstItem + 1} - {Math.min(indexOfLastItem, filteredStockItems.length)} จากทั้งหมด {filteredStockItems.length} รายการ
                </p>
              </div>

              <div className="flex items-center">
                <div className="mr-4">
                  <select
                    value={itemsPerPage}
                    onChange={handleItemsPerPageChange}
                    className="p-2 border border-gray-300 rounded-md"
                  >
                    <option value={5}>5 รายการ</option>
                    <option value={10}>10 รายการ</option>
                    <option value={25}>25 รายการ</option>
                    <option value={50}>50 รายการ</option>
                    <option value={100}>100 รายการ</option>
                  </select>
                </div>

                <div className="flex flex-wrap justify-center">
                  {paginationButtons()}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}