'use client';

import React, { useState, useEffect } from 'react';
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
}

const debounce = (func: Function, wait: number) => {
  let timeout: NodeJS.Timeout;
  return (...args: any[]) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

const InventoryMovementForm = () => {
  const router = useRouter();
  const { data: session, status } = useSession();

  const [stockItems, setStockItems] = useState<StockItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formType, setFormType] = useState<'IMPORT' | 'EXPORT'>('IMPORT');
  const [note, setNote] = useState<string | null>(null);
  const [source, setSource] = useState('');
  const [formItems, setFormItems] = useState([{
    id: Date.now(),
    quantity: 0,
    cost: 0,
    cost_per_unit: 0,
    total_cost: 0,
  }]);
  const [searchTerms, setSearchTerms] = useState<{ [key: string]: string }>({});
  const [showDropdown, setShowDropdown] = useState<{ [key: string]: boolean }>({});
  const [filteredOptions, setFilteredOptions] = useState<{ [key: string]: StockItem[] }>({});
  const [typeNotification, setTypeNotification] = useState<string>('');
  const [messageNotification, setMessageNotification] = useState<string>('');
  const [isOpenNotification, setIsOpenNotification] = useState<boolean>(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }
    if (status === 'authenticated' && session?.user?.role !== 'ADMIN') {
      router.push('/');
    }
  }, [session, status, router]);

  useEffect(() => {
    const loadStockItems = async () => {
      setError(null);
      setIsLoading(true);
      try {
        if (session && session.user && session.user.accessToken) {
          const response = await fetch(`${process.env.NEXT_PUBLIC_CLIENT_API_URL}/api/stockItems`, {
            method: 'GET',
            headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${session.user.accessToken}`
          }
        });
        if (!response.ok) throw new Error('เกิดข้อผิดพลาดในการโหลดข้อมูล');
        const data = await response.json();
        if (Array.isArray(data)) {
          setStockItems(data);
        } else if (data.data && Array.isArray(data.data)) {
          setStockItems(data.data);
        } else {
          throw new Error('ข้อมูลที่ได้รับไม่อยู่ในรูปแบบที่ถูกต้อง');
          }
        }
      } catch (err) {
        console.error('Error:', err);
        setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาด');
        setStockItems([]);
      } finally {
        setIsLoading(false);
        setTypeNotification('success');
        setMessageNotification('ดำเนินการโหลดข้อมูลสำเร็จ พร้อมสำหรับบันทึกการนำเข้า/ออก');
        setIsOpenNotification(true);
      }
    };
    loadStockItems();
  }, [session, status]);

  useEffect(() => {
    if (isOpenNotification) {
      const timer = setTimeout(() => {
        setIsOpenNotification(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isOpenNotification]);

  const debouncedSearch = React.useCallback(
    debounce((id: number, searchTerm: string) => {
      if (!Array.isArray(stockItems)) return;
      const filtered = stockItems.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredOptions(prev => ({ ...prev, [id]: filtered }));
    }, 300),
    [stockItems]
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!(event.target as HTMLElement).closest('.relative')) {
        setShowDropdown({});
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleFormItemChange = (id: number, field: string, value: string | number) => {
    const updatedItems = formItems.map(item => {
      if (item.id === id) {
        let newValue = field === 'quantity' || field === 'cost'
          ? (typeof value === 'string' ? Math.max(0, parseFloat(value) || 0) : value)
          : value;

        if (field === 'quantity' || field === 'cost') {
          const newQuantity = field === 'quantity' ? newValue : item.quantity;
          const newPurchasePrice = field === 'cost' ? newValue : item.cost;
          const calculatedUnitPrice = newQuantity > 0
            ? Math.round((newPurchasePrice / newQuantity) * 100) / 100
            : 0;
          const calculatedTotalPrice = Math.round(newPurchasePrice * 100) / 100;
          return {
            ...item,
            [field]: newValue,
            cost_per_unit: calculatedUnitPrice,
            total_cost: calculatedTotalPrice
          };
        }

        if (field === 'id') {
          const selectedStockItem = stockItems.find(stock => stock.id === value);
          if (selectedStockItem) {
            setSearchTerms(prev => ({
              ...prev,
              [id]: selectedStockItem.name
            }));
          }
        }

        return { ...item, [field]: newValue };
      }
      return item;
    });
    setFormItems(updatedItems);
  };

  const addFormItem = () => {
    setFormItems([...formItems, {
      id: Date.now(),
      quantity: 0,
      cost: 0,
      cost_per_unit: 0,
      total_cost: 0,
    }]);
  };

  const removeFormItem = (id: number) => {
    if (formItems.length > 1) {
      setFormItems(formItems.filter(item => item.id !== id));
    }
  };

  const calculateOverallTotalPrice = () => {
    return formItems.reduce((total, item) => total + item.cost, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    for (const item of formItems) {
      const stockItem = stockItems.find(stock => stock.id === Number(item.id));
      if (!stockItem) {
        setTypeNotification('error');
        setMessageNotification('กรุณาเลือกวัตถุดิบให้ครบทุกรายการ');
        setIsOpenNotification(true);
        return;
      }

      if (!item.quantity || item.quantity <= 0) {
        setTypeNotification('error');
        setMessageNotification(`กรุณาระบุจำนวนของ ${stockItem.name} ให้มากกว่า 0`);
        setIsOpenNotification(true);
        return;
      }

      if (formType === 'EXPORT' && item.quantity > stockItem.current_stock) {
        setTypeNotification('error');
        setMessageNotification(
          `ปริมาณ${stockItem.name}ในคลังไม่เพียงพอ (ต้องการ: ${item.quantity} ${stockItem.unit}, คงเหลือ: ${stockItem.current_stock} ${stockItem.unit})`
        );
        setIsOpenNotification(true);
        return;
      }
    }

    if (formType === 'IMPORT') {
      if (!source.trim()) {
        setTypeNotification('error');
        setMessageNotification('กรุณาระบุแหล่งที่มาของวัตถุดิบ');
        setIsOpenNotification(true);
        return;
      }

      const invalidPrice = formItems.find(item => !item.cost || item.cost <= 0);
      if (invalidPrice) {
        const stockItem = stockItems.find(stock => stock.id === Number(invalidPrice.id));
        setTypeNotification('error');
        setMessageNotification(`กรุณาระบุราคาของ ${stockItem?.name || 'วัตถุดิบ'} ให้มากกว่า 0`);
        setIsOpenNotification(true);
        return;
      }
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_CLIENT_API_URL}/api/inventoryLogs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${session.user.accessToken}`
        },
        body: JSON.stringify({
          user_id: session.user.id,
          type: formType,
          note: note ? note : null,
          source: source ? source : null,
          total_cost: calculateOverallTotalPrice(),
        })
      });

      const data = await response.json();
      const inventory_log_id = data.data.id;

      if (!response.ok) {
        setTypeNotification('error');
        setMessageNotification('เกิดข้อผิดพลาดในการบันทึกประวัติการนำเข้า/ออก');
        setIsOpenNotification(true);
      }

      for (const item of formItems) {
        const itemResponse = await fetch(`${process.env.NEXT_PUBLIC_CLIENT_API_URL}/api/stockEntries`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${session.user.accessToken}`
          },
          body: JSON.stringify({
            inventory_log_id: inventory_log_id,
            stock_item_id: Number(item.id),
            quantity: item.quantity,
            cost: item.cost,
            cost_per_unit: item.cost_per_unit,
          })
        });

        if (!itemResponse.ok) {
          setTypeNotification('error');
          setMessageNotification('เกิดข้อผิดพลาดในการบันทึกรายการย่อย');
          setIsOpenNotification(true);
        }
      }

      setTypeNotification('success');
      setMessageNotification(`บันทึกการ${formType === 'IMPORT' ? 'นำเข้า' : 'นำออก'} ${formItems.length} รายการเรียบร้อยแล้ว`);
      setIsOpenNotification(true);

      setFormItems([{
        id: Date.now(),
        quantity: 0,
        cost: 0,
        cost_per_unit: 0,
        total_cost: 0,
      }]);
      setNote('');
      setSource('');
      setSearchTerms({});

    } catch (error) {
      console.error('Error:', error);
      setTypeNotification('error');
      setMessageNotification(error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการบันทึกข้อมูล');
      setIsOpenNotification(true);
    }
  };

  const handleGoBack = () => {
    router.push('/inventory-logs');
  };


  return (
    <div className="bg-white shadow-lg rounded-lg p-6 mt-4 max-w-4xl mx-auto">
      {isOpenNotification && (
        <AutoDismissAlert
          message={messageNotification}
          type={typeNotification}
          duration={3000}
        />
      )}
      <div className="flex justify-between items-center mb-6">
        <button
          type="button"
          onClick={handleGoBack}
          className="flex items-center text-gray-600 hover:text-gray-800 transition-colors duration-200"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 mr-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          กลับ
        </button>
        <h2 className="text-2xl font-semibold text-gray-800">บันทึกการนำเข้า/ออกของวัตถุดิบ</h2>
        <div className="w-6"></div>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="mb-4">
          <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
            ประเภท
          </label>
          <select
            id="type"
            value={formType}
            onChange={(e) => setFormType(e.target.value as 'IMPORT' | 'EXPORT')}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white shadow-sm"
          >
            <option value="IMPORT">นำเข้า</option>
            <option value="EXPORT">นำออก</option>
          </select>
        </div>

        {formType === 'IMPORT' && (
          <div className="mb-4">
            <label htmlFor="source" className="block text-sm font-medium text-gray-700 mb-1">
              แหล่งที่มา
            </label>
            <input
              type="text"
              id="source"
              value={source}
              onChange={(e) => setSource(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="ระบุแหล่งที่มาของวัตถุดิบ"
            />
          </div>
        )}

        <div className="flex justify-between items-center mb-4">
          <label className="text-lg font-medium text-gray-800">
            รายการวัตถุดิบ
          </label>
          <button
            type="button"
            onClick={addFormItem}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200 flex items-center gap-2"
          >
            <span>+</span> เพิ่มรายการ
          </button>
        </div>

        <div className="mb-4">
          {formItems.map((item, index) => (
            <div
              key={item.id}
              className="p-4 mb-3 border border-gray-200 rounded-lg bg-white shadow-sm"
            >
              <div className="flex justify-between items-center mb-3">
                <div className="text-sm font-medium text-gray-700">
                  รายการที่ {index + 1}
                </div>
                {formItems.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeFormItem(item.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                )}
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      วัตถุดิบ
                    </label>
                    <div className="relative">
                      <div className="flex items-center">
                        <select
                          value={item.id || ''}
                          onChange={(e) => handleFormItemChange(item.id, 'id', e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        >
                          <option value="">เลือกวัตถุดิบ</option>
                          {stockItems
                            .sort((a, b) => a.name.localeCompare(b.name, 'th'))
                            .map((stockItem) => (
                              <option key={stockItem.id} value={stockItem.id}>
                                {stockItem.name} (คงเหลือ: {stockItem.current_stock.toLocaleString()} {stockItem.unit})
                              </option>
                            ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      จำนวน
                    </label>
                    <input
                      type="number"
                      value={item.quantity || ''}
                      onChange={(e) => handleFormItemChange(
                        item.id,
                        'quantity',
                        e.target.value
                      )}
                      min="0.01"
                      step="0.01"
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                </div>
                {formType === 'IMPORT' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        ราคาที่ซื้อ
                      </label>
                      <input
                        type="number"
                        value={item.cost || ''}
                        onChange={(e) => handleFormItemChange(item.id, 'cost', e.target.value)}
                        min="0"
                        step="0.01"
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        ราคาต่อหน่วย
                      </label>
                      <input
                        type="number"
                        readOnly
                        value={item.cost_per_unit || ''}
                        className="w-full p-2 border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {formType === 'IMPORT' && (
          <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold text-gray-800">ราคารวมทั้งหมด</span>
              <span className="text-2xl font-bold text-indigo-600">
                {calculateOverallTotalPrice().toLocaleString()} บาท
              </span>
            </div>
          </div>
        )}

        <div className="mb-4">
          <label htmlFor="note" className="block text-sm font-medium text-gray-700 mb-1">
            หมายเหตุ
          </label>
          <textarea
            id="note"
            value={note || ''}
            onChange={(e) => setNote(e.target.value)}
            placeholder="กรอกเฉพาะถ้าต้องการบันทึกหมายเหตุ"
            rows={3}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <button
          type="submit"
          className="w-full py-3 px-6 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
        >
          บันทึก {formItems.length} รายการ
        </button>
      </form>
    </div>
  );
};

export default InventoryMovementForm;