'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

// Types for our data
interface UserData {
  address: string;
  email: string;
  id: string;
  name: string;
  phone_number: string;
  role: string;
  username: string;
}

interface FormData {
  name: string;
  email: string;
  username: string;
  password: string; // Current password for verification
  new_password: string; // New password (optional)
  phone_number: string;
  address: string;
}

export default function EditProfilePage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    username: '',
    password: '', // Current password
    new_password: '', // New password
    phone_number: '',
    address: '',
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    // Check if user is authenticated
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    // Fetch user data
    const fetchUserData = async () => {
      if (status === 'authenticated' && session?.user?.id) {
        try {
          setIsLoading(true);
          const response = await fetch(`${process.env.NEXT_PUBLIC_CLIENT_API_URL}/api/users/${session.user.id}`, {
            headers: {
              'Authorization': `Bearer ${session?.user?.accessToken}`,
            }
          });

          if (!response.ok) {
            throw new Error('Failed to fetch user data');
          }
          
          const data = await response.json();
          const userData = data.data;
          
          // Initialize form with user data
          setFormData({
            name: userData.name || '',
            email: userData.email || '',
            username: userData.username || '',
            password: '', // Current password field starts empty
            new_password: '', // New password field starts empty
            phone_number: userData.phone_number || '',
            address: userData.address || '',
          });
        } catch (err) {
          setError('Failed to load user data. Please try again later.');
          console.error('Error fetching user data:', err);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchUserData();
  }, [session, status, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate current password is entered
    if (!formData.password) {
      setError('กรุณากรอกรหัสผ่านปัจจุบันเพื่อยืนยันการเปลี่ยนแปลง');
      return;
    }
    
    setIsSaving(true);
    setError('');
    setSuccessMessage('');

    try {
      if (!session?.user?.id || !session?.user?.accessToken) {
        throw new Error('Authentication required');
      }

      // Create payload according to the backend expectations
      const payload = {
        name: formData.name,
        username: formData.username,
        email: formData.email, // Include email even though it shouldn't change
        address: formData.address,
        phone_number: formData.phone_number,
        password: formData.password, // Current password for verification
        role: session.user.role,
        // Only include new_password if it's not empty
        ...(formData.new_password !== '' && { new_password: formData.new_password }),
      };

      const response = await fetch(`${process.env.NEXT_PUBLIC_CLIENT_API_URL}/api/users/${session.user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${session.user.accessToken}`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to update profile');
      }

      setSuccessMessage('ข้อมูลของคุณถูกบันทึกเรียบร้อยแล้ว');
      window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll to top smoothly
      
      // Wait for 2 seconds to show success message before navigating
      setTimeout(() => {
        router.push('/profile');
      }, 2000);
      
    } catch (err: any) {
      setError(err.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล กรุณาลองใหม่อีกครั้ง');
      console.error('Error updating profile:', err);
    } finally {
      setIsSaving(false);
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-inputFieldFocus mx-auto"></div>
          <p className="mt-4 text-primary">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 sm:px-0">
          <h1 className="text-3xl font-bold text-mainText">แก้ไขข้อมูลส่วนตัว</h1>
          <p className="mt-2 text-secondText">
            ปรับปรุงข้อมูลส่วนตัวของคุณให้เป็นปัจจุบัน
          </p>
        </div>
        
        <div className="mt-8">
          <div className="bg-background shadow-sm rounded-lg p-6 border border-searchBox">
            {error && (
              <div className="mb-6 p-4 bg-red-50 text-cancelRed rounded-md">
                {error}
              </div>
            )}
            
            {successMessage && (
              <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-md">
                {successMessage}
              </div>
            )}
            
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 gap-6 mb-6">
                <div>
                  <label htmlFor="name" className="block text-secondText mb-1">
                    ชื่อ-นามสกุล
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full p-2 border border-searchBox rounded-md focus:outline-none focus:ring-2 focus:ring-inputFieldFocus focus:border-transparent"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-secondText mb-1">
                    อีเมล
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    readOnly
                    className="w-full p-2 border border-searchBox rounded-md bg-gray-100 cursor-not-allowed"
                  />
                  <p className="text-xs text-secondText mt-1">อีเมลไม่สามารถเปลี่ยนแปลงได้</p>
                </div>
                
                <div>
                  <label htmlFor="username" className="block text-secondText mb-1">
                    ชื่อผู้ใช้
                  </label>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    className="w-full p-2 border border-searchBox rounded-md focus:outline-none focus:ring-2 focus:ring-inputFieldFocus focus:border-transparent"
                    required
                  />
                </div>
                
                
                <div>
                  <label htmlFor="phone_number" className="block text-secondText mb-1">
                    เบอร์โทรศัพท์
                  </label>
                  <input
                    type="tel"
                    id="phone_number"
                    name="phone_number"
                    value={formData.phone_number}
                    onChange={handleChange}
                    className="w-full p-2 border border-searchBox rounded-md focus:outline-none focus:ring-2 focus:ring-inputFieldFocus focus:border-transparent"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="address" className="block text-secondText mb-1">
                    ที่อยู่
                  </label>
                  <textarea
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    rows={4}
                    className="w-full p-2 border border-searchBox rounded-md focus:outline-none focus:ring-2 focus:ring-inputFieldFocus focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div>
                  <label htmlFor="password" className="block text-secondText mb-1">
                    รหัสผ่านปัจจุบัน <span className="text-cancelRed">*</span>
                  </label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full p-2 border border-searchBox rounded-md focus:outline-none focus:ring-2 focus:ring-inputFieldFocus focus:border-transparent"
                    required
                  />
                  <p className="text-xs text-secondText mt-1">จำเป็นต้องยืนยันรหัสผ่านปัจจุบันเพื่อบันทึกการเปลี่ยนแปลง</p>
                </div>
                
                <div>
                  <label htmlFor="new_password" className="block text-secondText mb-1">
                    รหัสผ่านใหม่ (เว้นว่างไว้ถ้าไม่ต้องการเปลี่ยน)
                  </label>
                  <input
                    type="password"
                    id="new_password"
                    name="new_password"
                    value={formData.new_password}
                    onChange={handleChange}
                    className="w-full p-2 border border-searchBox rounded-md focus:outline-none focus:ring-2 focus:ring-inputFieldFocus focus:border-transparent"
                  />
                </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="py-2 px-4 bg-button hover:bg-hoverButton text-background rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving ? 'กำลังบันทึก...' : 'บันทึก'}
                </button>
                <Link
                  href="/dashboard"
                  className="py-2 px-4 border border-searchBox text-primary hover:bg-searchBox rounded-md transition-colors text-center"
                >
                  ยกเลิก
                </Link>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}