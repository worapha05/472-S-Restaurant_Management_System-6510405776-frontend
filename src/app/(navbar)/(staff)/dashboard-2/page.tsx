'use client';

import React, { useEffect, useState } from 'react';
import AutoDismissAlert from '@/components/Notification/Notification';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Order } from '@/interfaces/Order';

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

interface Transaction {
    id: number;
    date: string;
    type: 'INCOME' | 'EXPENSE';
    amount: number;
    description: string;
}

const Dashboard = () => {
    const router = useRouter();
    const { data: session, status } = useSession();

    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [inventoryLogs, setInventoryLogs] = useState<InventoryLog[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);
    const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
    const [filterType, setFilterType] = useState<'ALL' | 'INCOME' | 'EXPENSE'>('ALL');
    const [filterDate, setFilterDate] = useState<string>('');
    const [isOpenNotification, setIsOpenNotification] = useState<boolean>(false);
    const [messageNotification, setMessageNotification] = useState<string>('');
    const [typeNotification, setTypeNotification] = useState<string>('');
    const [currentPage, setCurrentPage] = useState<number>(1);
    const itemsPerPage = 10;
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const fetchInventoryLogs = async () => {
        try {
            setIsLoading(true);
            const response = await fetch(`${process.env.NEXT_PUBLIC_CLIENT_API_URL}/api/inventoryLogs`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${session.user.accessToken}`
                }
            });
            if (!response.ok) throw new Error('เกิดข้อผิดพลาดในการโหลดข้อมูล');
            const data = await response.json();

            if (data.data || data) {
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

    const fetchOrders = async () => {
        try {
            setIsLoading(true);
            const response = await fetch(`${process.env.NEXT_PUBLIC_CLIENT_API_URL}/api/orders`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${session.user.accessToken}`
                }
            });
            if (!response.ok) throw new Error('เกิดข้อผิดพลาดในการโหลดข้อมูล');
            const data = await response.json();

            if (data.data || data) {
                setOrders(data.data);
            } else {
                setOrders([]);
                throw new Error('ข้อมูลที่ได้รับไม่อยู่ในรูปแบบที่ถูกต้อง');
            }
        } catch (err) {
            console.error('เกิดข้อผิดพลาด:', err);
            setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาด');
            setOrders([]);
        } finally {
            setIsLoading(false);
        }
    };

    const generateTransactions = () => {
        let id = 0;
        const newIncomeTransactions = orders
            .filter((order: Order) => order.status === 'COMPLETED')
            .map((order: Order) => ({
                id: id++,
                date: new Date(order.created_at).toLocaleDateString('th-TH', { year: 'numeric', month: '2-digit', day: '2-digit' }),
                amount: order.sum_price,
                type: 'INCOME',
                description: `ขายอาหารออเดอร์ที่ ${order.id}`
            }));

        const newExpenseTransactions = inventoryLogs
            .filter((inventoryLog: InventoryLog) => inventoryLog.type === 'IMPORT')
            .map((inventoryLog: InventoryLog) => ({
                id: id++,
                date: new Date(inventoryLog.created_at).toLocaleDateString('th-TH', { year: 'numeric', month: '2-digit', day: '2-digit' }),
                amount: inventoryLog.total_cost,
                type: 'EXPENSE',
                description: `ซื้อวัตถุดิบรายการที่ ${inventoryLog.id}`
            }));

        const allTransactions = [...newIncomeTransactions, ...newExpenseTransactions];

        const sortedTransactions = allTransactions.slice().sort((a, b) => {
            return (a.date).localeCompare(b.date);
        });

        setTransactions(sortedTransactions);
        setFilteredTransactions(sortedTransactions);
    };


    useEffect(() => {
        if (status === 'unauthenticated') {
            window.location.href = '/login';
            return;
        }
        if (status === 'authenticated' && session?.user?.role !== 'ADMIN') {
            router.push('/');
        }
    }, [session, status]);

    useEffect(() => {
        if (session && session.user && session.user.accessToken) {
            fetchOrders();
            fetchInventoryLogs();
        }
    }, [session, status]);

    useEffect(() => {
        generateTransactions();
        setTypeNotification('success');
        setMessageNotification('ข้อมูลถูกดึงขึ้นมาเรียบร้อย สามารถดูข้อมูลการเงินได้เลย');
        setIsOpenNotification(true);
    }, [orders, inventoryLogs]);

    useEffect(() => {
        if (isOpenNotification) {
            const timer = setTimeout(() => {
                setIsOpenNotification(false);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [isOpenNotification]);

    useEffect(() => {
        filterTransactions();
    }, [filterType, filterDate]);

    const filterTransactions = () => {
        let filtered = transactions;

        if (filterType !== 'ALL') {
            filtered = filtered.filter(transaction => transaction.type === filterType);
        }

        if (filterDate) {
            filtered = filtered.filter(transaction => {
                const newFilterDate = new Date(filterDate).toLocaleDateString('th-TH', { year: 'numeric', month: '2-digit', day: '2-digit' });
                return transaction.date === newFilterDate;
            });
        }

        setFilteredTransactions(filtered);
    };

    const calculateTotals = (transactions: Transaction[]) => {
        const income = transactions
            .filter(transaction => transaction.type === 'INCOME')
            .reduce((total, transaction) => total + transaction.amount, 0);
        const expense = transactions
            .filter(transaction => transaction.type === 'EXPENSE')
            .reduce((total, transaction) => total + transaction.amount, 0);
        const profit = income - expense;
        return { income, expense, profit };
    };

    const { income, expense, profit } = calculateTotals(filteredTransactions);

    const handleClearFilters = () => {
        setFilterType('ALL');
        setFilterDate('');
    };

    const paginate = (pageNumber: number) => {
        setCurrentPage(pageNumber);
    };

    const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentItems = filteredTransactions.slice(startIndex, endIndex);

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
        <div className="bg-white shadow-lg rounded-lg p-6 mt-4 max-w-4xl mx-auto">
            {isOpenNotification && (
                <AutoDismissAlert
                    message={messageNotification}
                    type={typeNotification}
                    duration={3000}
                />
            )}
            <h2 className="text-2xl font-semibold mb-6 text-gray-800">Dashboard การเงิน</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="p-4 border border-gray-300 rounded-lg bg-gray-50">
                    <h3 className="text-xl font-bold">รายรับรวม</h3>
                    <p className="text-lg font-semibold text-green-600">{income.toLocaleString()} บาท</p>
                </div>
                <div className="p-4 border border-gray-300 rounded-lg bg-gray-50">
                    <h3 className="text-xl font-bold">รายจ่ายรวม</h3>
                    <p className="text-lg font-semibold text-red-600">{expense.toLocaleString()} บาท</p>
                </div>
                <div className="p-4 border border-gray-300 rounded-lg bg-gray-50">
                    <h3 className="text-xl font-bold">กำไร</h3>
                    <p className={`text-lg font-semibold ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {profit.toLocaleString()} บาท
                    </p>
                </div>
            </div>

            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">กรองตามประเภท</label>
                <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value as 'ALL' | 'INCOME' | 'EXPENSE')}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                    <option value="ALL">ทั้งหมด</option>
                    <option value="INCOME">รายรับ</option>
                    <option value="EXPENSE">รายจ่าย</option>
                </select>
            </div>

            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">กรองตามวันที่</label>
                <input
                    type="date"
                    value={filterDate}
                    onChange={(e) => setFilterDate(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
            </div>

            <button
                onClick={handleClearFilters}
                className="mb-4 p-2 bg-blue-500 text-white rounded-md"
            >
                ล้างตัวกรอง
            </button>

            <div className="overflow-x-auto">
                <table className="min-w-full border border-gray-300">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="p-4 border-b text-left">วันที่</th>
                            <th className="p-4 border-b text-left">ประเภท</th>
                            <th className="p-4 border-b text-left">จำนวนเงิน</th>
                            <th className="p-4 border-b text-left">รายละเอียด</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentItems.length > 0 ? (
                            currentItems.map(transaction => (
                                <tr key={transaction.id} className={`hover:bg-gray-50 ${transaction.type === 'INCOME' ? 'bg-green-50' : 'bg-red-50'}`}>
                                    <td className="p-4 border-b">{transaction.date}</td>
                                    <td className="p-4 border-b">{transaction.type === 'INCOME' ? 'รายรับ' : 'รายจ่าย'}</td>
                                    <td className="p-4 border-b">{transaction.amount.toLocaleString()} บาท</td>
                                    <td className="p-4 border-b">{transaction.description}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={4} className="p-4 text-center text-gray-600">ไม่มีรายการที่ตรงตามเงื่อนไข</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <div className="flex justify-between items-center mt-4">
                <div className="text-sm text-gray-700">
                    แสดง {startIndex + 1} ถึง {Math.min(endIndex, filteredTransactions.length)} จาก {filteredTransactions.length} รายการ
                </div>
                <div className="flex">
                    {paginationButtons()}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
