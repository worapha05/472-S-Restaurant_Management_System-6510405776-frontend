'use client';

import React, { useState, useEffect } from 'react';
import AutoDismissAlert from '@/components/Notification/Notification';

interface StockItem {
  id: number;
  name: string;
  category: string;
  current_stock: number;
  unit: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

interface InventoryLog {
  id: number;
  user_id: number;
  username: string;
  note: string;
  total_cost: number;
  source: string;
  type: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

interface StockEntry {
  id: number,
  stock_item_id: number,
  stock_item_name: string,
  inventory_log_id: number,
  username: string,
  cost: number,
  cost_per_unit: number,
  quantity: number,
  type: string,
  source: string | null,
  note: string | null,
  created_at: string,
  updated_at: string,
  deleted_at: string | null
}

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

const categories: string[] = ['เนื้อสัตว์', 'ผัก', 'ผลไม้', 'ไข่ & นม', 'ธัญพืช & แป้ง', 'เครื่องปรุง', 'น้ำมัน & ไขมัน', 'อื่น ๆ'];

const translateCategory = (category: string): string => {
  return categoryMapping[category] || 'นอกเหนือจากข้อมูลที่มี';
};

const reverseTranslateCategory = (thaiCategory: string): string => {
  const entry = Object.entries(categoryMapping).find(([_, value]) => value === thaiCategory);
  return entry ? entry[0] : 'OTHERS';
};

const InventoryOverview: React.FC = (): JSX.Element => {
  const [stockItems, setStockItems] = useState<StockItem[]>([]);
  const [stockEntrys, setStockEntrys] = useState<StockEntry[]>([]);
  const [inventoryLogs, setInventoryLogs] = useState<InventoryLog[]>([]);
  const [filteredStockItems, setFilteredStockItems] = useState<StockItem[]>([]);
  const [filteredInventoryLogs, setFilteredInventoryLogs] = useState<InventoryLog[]>([]);
  const [sortField, setSortField] = useState<keyof StockItem>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentStockPage, setCurrentStockPage] = useState(1);
  const [currentMovementPage, setCurrentMovementPage] = useState(1);
  const [stockItemsPerPage] = useState(5);
  const [movementItemsPerPage, setMovementItemsPerPage] = useState(10);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [formErrors, setFormErrors] = useState<any>({});
  const [typeNotification, setTypeNotification] = useState<string>('');
  const [messageNotification, setMessageNotification] = useState<string>('');
  const [isOpenNotification, setIsOpenNotification] = useState<boolean>(false);
  const [stockFilter, setStockFilter] = useState({
    searchTerm: '',
    category: 'all',
  });
  const [movementFilter, setMovementFilter] = useState({
    ingredientId: '',
    type: 'all',
    startDate: '',
    endDate: '',
    ingredientSearch: '',
    inventoryLogId: '',
  });
  const [isIngredientDropdownOpen, setIsIngredientDropdownOpen] = useState(false);
  const [ingredientOptions, setIngredientOptions] = useState<{ value: string; label: string }[]>([]);
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);

  const fetchStockItems = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_CLIENT_API_URL}/api/stockItems`);
      if (!response.ok) throw new Error('เกิดข้อผิดพลาดในการโหลดข้อมูล');
      const data = await response.json();
      setStockItems(Array.isArray(data) ? data : data.data || []);
    } catch (err) {
      console.error('Error:', err);
      setStockItems([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStockEntries = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_CLIENT_API_URL}/api/stockEntries`);
      if (!response.ok) throw new Error('เกิดข้อผิดพลาดในการโหลดข้อมูล');
      const data = await response.json();
      if (data.data) {
        setStockEntrys(data.data);
      } else {
        setStockEntrys([]);
        throw new Error('ข้อมูลที่ได้รับไม่อยู่ในรูปแบบที่ถูกต้อง');
      }
    } catch (err) {
      console.error('เกิดข้อผิดพลาด:', err);
      setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาด');
      setStockEntrys([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchInventoryLogs = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_CLIENT_API_URL}/api/inventoryLogs`);
      if (!response.ok) throw new Error('เกิดข้อผิดพลาดในการโหลดข้อมูล');
      const data = await response.json();
      if (data.data) {
        setInventoryLogs(data.data);
      } else {
        setInventoryLogs([]);
        throw new Error('ข้อมูลที่ได้รับไม่อยู่ในรูปแบบที่ถูกต้อง');
      }
    } catch (err) {
      console.error('เกิดข้อผิดพลาด:', err);
      setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาด');
      setInventoryLogs([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (Array.isArray(stockItems)) {
      const options = stockItems.map(item => ({
        value: item.id.toString(),
        label: item.name
      }));
      setIngredientOptions(options);
    }
  }, [stockItems]);

  useEffect(() => {
    fetchStockItems();
    fetchStockEntries();
    fetchInventoryLogs();
    setTypeNotification('success');
    setMessageNotification('ข้อมูลถูกดึงขึ้นมาเรียบร้อย สามารถดำเนินการขั้นตอนต่อไปได้');
    setIsOpenNotification(true);
  }, []);

  useEffect(() => {
    let result = Array.isArray(stockItems) ? [...stockItems] : [];
    if (stockFilter.searchTerm) {
      const searchTermLower = stockFilter.searchTerm.toLowerCase();
      result = result.filter(item => item.name.toLowerCase().includes(searchTermLower));
    }
    if (stockFilter.category !== 'all') {
      const selectedCategory = reverseTranslateCategory(stockFilter.category);
      result = result.filter(item => item.category === selectedCategory);
    }
    result = [...result].sort((a, b) => {
      if (sortField === 'currentStock') {
        return sortDirection === 'asc'
          ? a[sortField] - b[sortField]
          : b[sortField] - a[sortField];
      } else {
        const aValue = String(a[sortField]).toLowerCase();
        const bValue = String(b[sortField]).toLowerCase();
        return sortDirection === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
    });
    setFilteredStockItems(result);
    setCurrentStockPage(1);
  }, [stockFilter, stockItems, sortField, sortDirection]);

  useEffect(() => {
    let result = [...stockEntrys];
    if (movementFilter.ingredientId) {
      const selectedItem = stockItems.find(item => item.id === Number(movementFilter.ingredientId));
      if (selectedItem) {
        result = result.filter(item => 
          item.stock_item_name === selectedItem.name
        );
      }
    }
    if (movementFilter.type !== 'all') {
      result = result.filter(item => item.type === movementFilter.type.toUpperCase());
    }
    if (movementFilter.startDate) {
      result = result.filter(item => {
        const itemDate = new Date(item.created_at);
        const startDate = new Date(movementFilter.startDate);
        return itemDate >= startDate;
      });
    }
    if (movementFilter.endDate) {
      result = result.filter(item => {
        const itemDate = new Date(item.created_at);
        const endDate = new Date(movementFilter.endDate);
        endDate.setHours(23, 59, 59, 999);
        return itemDate <= endDate;
      });
    }
    if (movementFilter.inventoryLogId) {
      result = result.filter(item => 
        item.inventory_log_id.toString().includes(movementFilter.inventoryLogId)
      );
    }
    setFilteredInventoryLogs(result);
    setCurrentMovementPage(1);
  }, [movementFilter, stockEntrys, stockItems]);

  const indexOfLastStockItem = currentStockPage * stockItemsPerPage;
  const indexOfFirstStockItem = indexOfLastStockItem - stockItemsPerPage;
  const currentStockItems = filteredStockItems.slice(indexOfFirstStockItem, indexOfLastStockItem);
  const totalStockPages = Math.ceil(filteredStockItems.length / stockItemsPerPage);

  const indexOfLastMovementItem = currentMovementPage * movementItemsPerPage;
  const indexOfFirstMovementItem = indexOfLastMovementItem - movementItemsPerPage;
  const currentMovementItems = filteredInventoryLogs.slice(indexOfFirstMovementItem, indexOfLastMovementItem);
  const totalMovementPages = Math.ceil(filteredInventoryLogs.length / movementItemsPerPage);

  const handleSort = (field: keyof StockItem | keyof StockEntry) => {
    const newDirection = sortField === field && sortDirection === 'asc' ? 'desc' : 'asc';
    setSortField(field);
    setSortDirection(newDirection);
  };

  const paginateStock = (pageNumber: number) => setCurrentStockPage(pageNumber);
  const paginateMovements = (pageNumber: number) => setCurrentMovementPage(pageNumber);

  const handleStockFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setStockFilter({
      ...stockFilter,
      [name]: value,
    });
  };

  const handleMovementFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setMovementFilter(prev => ({
      ...prev,
      [name]: value
    }));
    if (name !== 'ingredientSearch') {
      setIsIngredientDropdownOpen(false);
    }
  };

  const handleIngredientSelect = (item: StockItem) => {
    setMovementFilter(prev => ({
      ...prev,
      ingredientId: item.id.toString()
    }));
    setIsIngredientDropdownOpen(false);
  };

  const resetStockFilters = () => {
    setStockFilter({
      searchTerm: '',
      category: 'all',
    });
  };

  const resetMovementFilters = () => {
    setMovementFilter({
      ingredientId: '',
      type: 'all',
      startDate: '',
      endDate: '',
      ingredientSearch: '',
      inventoryLogId: '',
    });
    setCurrentMovementPage(1);
  };

  const handleMovementItemsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setMovementItemsPerPage(Number(e.target.value));
    setCurrentMovementPage(1);
  };

  const handleIngredientSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    setMovementFilter(prev => ({
      ...prev,
      ingredientSearch: value,
      ingredientId: value ? prev.ingredientId : ''
    }));
    const timeout = setTimeout(() => {
      if (!value.trim()) {
        setIsIngredientDropdownOpen(false);
      }
    }, 100);
    setSearchTimeout(timeout);
    setIsIngredientDropdownOpen(true);
  };

  useEffect(() => {
    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [searchTimeout]);

  return (
    <div className="min-h-screen bg-gray-50">
      {isOpenNotification && (
        <AutoDismissAlert
          message={messageNotification}
          type={typeNotification}
          duration={3000}
        />
      )}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">ระบบจัดการวัตถุดิบ</h1>

        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">วัตถุดิบคงคลัง</h2>

          <div className="mb-6 p-4 bg-gray-50 rounded-md">
            <h3 className="text-lg font-medium mb-3">ค้นหาวัตถุดิบ</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="searchTerm" className="block text-sm font-medium text-gray-700 mb-1">ชื่อวัตถุดิบ</label>
                <input
                  type="text"
                  id="searchTerm"
                  name="searchTerm"
                  value={stockFilter.searchTerm}
                  onChange={handleStockFilterChange}
                  placeholder="ค้นหาชื่อวัตถุดิบ"
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">หมวดหมู่วัตถุดิบ</label>
                <select
                  id="category"
                  name="category"
                  value={stockFilter.category}
                  onChange={handleStockFilterChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">ทั้งหมด</option>
                  {categories.map(category => (
                    <option
                      key={category}
                      value={category}
                    >
                      {category}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-4 flex justify-end">
              <button
                onClick={resetStockFilters}
                className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                รีเซ็ตตัวกรอง
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('name')}
                  >
                    ชื่อวัตถุดิบ
                    {sortField === 'name' && (
                      <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    คงเหลือ
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    หน่วย
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('category')}
                  >
                    หมวดหมู่
                    {sortField === 'category' && (
                      <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentStockItems.length > 0 ? (
                  currentStockItems.map((StockItem) => (
                    <tr key={StockItem.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{StockItem.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{StockItem.current_stock}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{StockItem.unit}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{translateCategory(StockItem.category)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">{isLoading ? 'กำลังโหลดข้อมูล...' : 'ไม่พบข้อมูล'}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {totalStockPages > 1 && (
            <div className="mt-4 flex justify-between items-center">
              <div className="text-sm text-gray-700">
                แสดง <span className="font-medium">{indexOfFirstStockItem + 1}</span> ถึง <span className="font-medium">
                  {Math.min(indexOfLastStockItem, filteredStockItems.length)}
                </span> จาก <span className="font-medium">{filteredStockItems.length}</span> รายการ
              </div>
              <nav className="inline-flex rounded-md shadow-sm">
                <button
                  onClick={() => paginateStock(Math.max(1, currentStockPage - 1))}
                  disabled={currentStockPage === 1}
                  className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-l-md ${currentStockPage === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                >
                  ก่อนหน้า
                </button>
                {Array.from({ length: totalStockPages }, (_, i) => i + 1).map((number) => (
                  <button
                    key={number}
                    onClick={() => paginateStock(number)}
                    className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium ${currentStockPage === number
                      ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                      }`}
                  >
                    {number}
                  </button>
                ))}
                <button
                  onClick={() => paginateStock(Math.min(totalStockPages, currentStockPage + 1))}
                  disabled={currentStockPage === totalStockPages}
                  className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-r-md ${currentStockPage === totalStockPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                >
                  ถัดไป
                </button>
              </nav>
            </div>
          )}
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">ประวัติการนำเข้า/ออก</h2>

          <div className="mb-6 p-4 bg-gray-50 rounded-md">
            <h3 className="text-lg font-medium mb-3">ตัวกรอง</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <div>
                <label htmlFor="filterInventoryLogId" className="block text-sm font-medium text-gray-700 mb-1">รหัสรายการ</label>
                <input
                  type="text"
                  id="filterInventoryLogId"
                  name="inventoryLogId"
                  value={movementFilter.inventoryLogId}
                  onChange={handleMovementFilterChange}
                  placeholder={`ค้นหารายการที่ 1 - ${inventoryLogs.length}`}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label htmlFor="filterIngredientId" className="block text-sm font-medium text-gray-700 mb-1">วัตถุดิบ</label>
                <div className="relative">
                  <input
                    type="text"
                    id="ingredientSearch"
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="ค้นหาวัตถุดิบ"
                    value={movementFilter.ingredientSearch || ''}
                    onChange={handleIngredientSearch}
                    onFocus={() => setIsIngredientDropdownOpen(true)}
                    onBlur={() => {
                      setTimeout(() => {
                        setIsIngredientDropdownOpen(false);
                      }, 200);
                    }}
                  />
                  {isIngredientDropdownOpen && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                      {stockItems
                        .filter(item => 
                          item.name.toLowerCase().includes((movementFilter.ingredientSearch || '').toLowerCase())
                        )
                        .sort((a, b) => a.name.localeCompare(b.name, 'th'))
                        .map(item => (
                          <div
                            key={item.id}
                            className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                            onClick={() => {
                              setMovementFilter(prev => ({
                                ...prev,
                                ingredientId: item.id.toString(),
                                ingredientSearch: item.name
                              }));
                              setIsIngredientDropdownOpen(false);
                            }}
                          >
                            {item.name}
                          </div>
                        ))}
                      {stockItems.filter(item => 
                        item.name.toLowerCase().includes((movementFilter.ingredientSearch || '').toLowerCase())
                      ).length === 0 && (
                        <div className="px-4 py-2 text-gray-500">
                          ไม่พบข้อมูล
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="filterType" className="block text-sm font-medium text-gray-700 mb-1">ประเภท</label>
                <select
                  id="filterType"
                  name="type"
                  value={movementFilter.type}
                  onChange={handleMovementFilterChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="all">ทั้งหมด</option>
                  <option value="import">นำเข้า</option>
                  <option value="export">นำออก</option>
                </select>
              </div>

              <div>
                <label htmlFor="filterStartDate" className="block text-sm font-medium text-gray-700 mb-1">วันที่เริ่มต้น</label>
                <input
                  type="date"
                  id="filterStartDate"
                  name="startDate"
                  value={movementFilter.startDate}
                  onChange={handleMovementFilterChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label htmlFor="filterEndDate" className="block text-sm font-medium text-gray-700 mb-1">วันที่สิ้นสุด</label>
                <input
                  type="date"
                  id="filterEndDate"
                  name="endDate"
                  value={movementFilter.endDate}
                  onChange={handleMovementFilterChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>

            <div className="mt-4 flex justify-end">
              <button
                onClick={resetMovementFilters}
                className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                รีเซ็ตตัวกรอง
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    รายการที่
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    วัตถุดิบ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ประเภท
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    จำนวน
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ราคาต่อหน่วย<span className="text-red-500"> / </span>ราคาที่ซื้อ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    หมายเหตุ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ผู้ทำรายการ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    อัพเดตล่าสุด
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    การจัดการ
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentMovementItems.length > 0 ? (
                  currentMovementItems.map((movement) => (
                    <tr key={movement.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {movement.inventory_log_id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {movement.stock_item_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            movement.type === 'IMPORT'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {movement.type === 'IMPORT' ? 'นำเข้า' : 'นำออก'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {movement.quantity}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {movement.cost_per_unit}<span className="text-red-500"> / </span>{movement.cost}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {movement.note || '-'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {movement.username}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(movement.updated_at).toLocaleString('th-TH')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <button
                          onClick={() => {
                            alert(`นำไปแก้ไขรายการ ${movement.id}`);
                          }}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          แก้ไข
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="px-6 py-4 text-center text-sm text-gray-500">
                      ไม่พบข้อมูล
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {filteredInventoryLogs.length > 0 && (
            <div className="mt-4 flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-700">แสดง</span>
                <select
                  value={movementItemsPerPage}
                  onChange={handleMovementItemsPerPageChange}
                  className="border border-gray-300 rounded-md text-sm p-1"
                >
                  <option value="5">5</option>
                  <option value="10">10</option>
                  <option value="25">25</option>
                  <option value="50">50</option>
                  <option value="100">100</option>
                </select>
                <span className="text-sm text-gray-700">รายการ</span>
              </div>

              <div className="text-sm text-gray-700">
                แสดง <span className="font-medium">{indexOfFirstMovementItem + 1}</span> ถึง{" "}
                <span className="font-medium">
                  {Math.min(indexOfLastMovementItem, filteredInventoryLogs.length)}
                </span>{" "}
                จาก <span className="font-medium">{filteredInventoryLogs.length}</span> รายการ
              </div>

              <nav className="inline-flex rounded-md shadow-sm">
                <button
                  onClick={() => paginateMovements(Math.max(1, currentMovementPage - 1))}
                  disabled={currentMovementPage === 1}
                  className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-l-md ${currentMovementPage === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                >
                  ก่อนหน้า
                </button>
                
                {currentMovementPage > 3 && (
                  <>
                    <button
                      onClick={() => paginateMovements(1)}
                      className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium bg-white text-gray-700 hover:bg-gray-50"
                    >
                      1
                    </button>
                    {currentMovementPage > 4 && (
                      <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium bg-white text-gray-700">
                        ...
                      </span>
                    )}
                  </>
                )}

                {Array.from({ length: totalMovementPages }, (_, i) => i + 1)
                  .filter(page => {
                    if (page === 1 || page === totalMovementPages) return true;
                    if (page >= currentMovementPage - 1 && page <= currentMovementPage + 1) return true;
                    return false;
                  })
                  .map((number, index, array) => (
                    <React.Fragment key={number}>
                      {index > 0 && array[index - 1] !== number - 1 && (
                        <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium bg-white text-gray-700">
                          ...
                        </span>
                      )}
                      <button
                        onClick={() => paginateMovements(number)}
                        className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium ${
                          currentMovementPage === number
                            ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                            : 'bg-white text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {number}
                      </button>
                    </React.Fragment>
                  ))}

                {currentMovementPage < totalMovementPages - 2 && (
                  <>
                    {currentMovementPage < totalMovementPages - 3 && (
                      <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium bg-white text-gray-700">
                        ...
                      </span>
                    )}
                    <button
                      onClick={() => paginateMovements(totalMovementPages)}
                      className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium bg-white text-gray-700 hover:bg-gray-50"
                    >
                      {totalMovementPages}
                    </button>
                  </>
                )}

                <button
                  onClick={() => paginateMovements(Math.min(totalMovementPages, currentMovementPage + 1))}
                  disabled={currentMovementPage === totalMovementPages}
                  className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-r-md ${currentMovementPage === totalMovementPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                >
                  ถัดไป
                </button>
              </nav>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InventoryOverview;
