'use client';

import { useState, ChangeEvent, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface FormData {
  // Login Information
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
  
  // Personal Information
  name: string;
  phone_number: string;
  role: string;
  
  // Address Information
  address_line1: string;
  address_line2: string;
  district: string;
  city: string;
  province: string;
  postal_code: string;
}

export default function SignUpPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [currentSection, setCurrentSection] = useState<number>(1);
  
  const [formData, setFormData] = useState<FormData>({
    // Login Information
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    
    // Personal Information
    name: '',
    phone_number: '',
    role: 'user',
    
    // Address Information
    address_line1: '',
    address_line2: '',
    district: '',
    city: '',
    province: '',
    postal_code: '',
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const nextSection = () => {
    // Validate current section before proceeding
    if (currentSection === 1) {
      // Validate login information
      if (!formData.email || !formData.username || !formData.password || !formData.confirmPassword) {
        setErrorMessage('กรุณากรอกข้อมูลให้ครบทุกช่อง');
        return;
      }
      
      if (formData.password !== formData.confirmPassword) {
        setErrorMessage('รหัสผ่านไม่ตรงกัน');
        return;
      }
      
      if (formData.password.length < 8) {
        setErrorMessage('รหัสผ่านต้องมีความยาวอย่างน้อย 8 ตัวอักษร');
        return;
      }
    } else if (currentSection === 2) {
      // Validate personal information
      if (!formData.name || !formData.phone_number) {
        setErrorMessage('กรุณากรอกข้อมูลให้ครบทุกช่อง');
        return;
      }
      
      // Basic phone number validation for Thailand
      const phoneRegex = /^0\d{9}$/;
      if (!phoneRegex.test(formData.phone_number)) {
        setErrorMessage('กรุณากรอกเบอร์โทรศัพท์ให้ถูกต้อง (เช่น 0812345678)');
        return;
      }
    }
    
    // Clear any error messages
    setErrorMessage('');
    // Move to next section
    setCurrentSection(prev => prev + 1);
  };

  const prevSection = () => {
    setErrorMessage('');
    setCurrentSection(prev => prev - 1);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Final validation
    if (!formData.address_line1 || !formData.city || !formData.province || !formData.postal_code) {
      setErrorMessage('กรุณากรอกข้อมูลที่อยู่ให้ครบถ้วน');
      return;
    }
    
    try {
      setIsLoading(true);
      setErrorMessage('');
      
      // Combine address fields into a single string
      const fullAddress = [
        formData.address_line1,
        formData.address_line2,
        formData.district,
        formData.city,
        formData.province,
        formData.postal_code
      ].filter(Boolean).join(', ');
      
      // Adjust the API endpoint to your backend URL
      const response = await fetch(`${process.env.NEXT_PUBLIC_CLIENT_API_URL}/api/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          username: formData.username,
          password: formData.password,
          address: fullAddress,
          phone_number: formData.phone_number,
          role: formData.role,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'เกิดข้อผิดพลาด');
      }
      
      // Redirect to login page after successful registration
      router.push('/login');
      
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ');
    } finally {
      setIsLoading(false);
    }
  };

  // Get current section title
  const getSectionTitle = () => {
    switch(currentSection) {
      case 1: return 'ข้อมูลเข้าสู่ระบบ';
      case 2: return 'ข้อมูลส่วนตัว';
      case 3: return 'ข้อมูลที่อยู่';
      default: return '';
    }
  };

  // Render progress bar
  const renderProgressBar = () => {
    return (
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className={`flex items-center justify-center w-10 h-10 rounded-full ${currentSection >= 1 ? 'bg-button text-background' : 'bg-searchBox text-secondText'}`}>
              1
            </div>
            <div className={`h-1 w-12 ${currentSection >= 2 ? 'bg-button' : 'bg-searchBox'}`}></div>
          </div>
          <div className="flex items-center">
            <div className={`flex items-center justify-center w-10 h-10 rounded-full ${currentSection >= 2 ? 'bg-button text-background' : 'bg-searchBox text-secondText'}`}>
              2
            </div>
            <div className={`h-1 w-12 ${currentSection >= 3 ? 'bg-button' : 'bg-searchBox'}`}></div>
          </div>
          <div className="flex items-center justify-center w-10 h-10 rounded-full ${currentSection >= 3 ? 'bg-button text-background' : 'bg-searchBox text-secondText'}">
            3
          </div>
        </div>
        <div className="flex justify-between mt-2">
          <span className="text-xs text-secondText">ข้อมูลเข้าสู่ระบบ</span>
          <span className="text-xs text-secondText">ข้อมูลส่วนตัว</span>
          <span className="text-xs text-secondText">ข้อมูลที่อยู่</span>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="text-center text-3xl font-bold text-mainText mb-1">
          สร้างบัญชีผู้ใช้
        </h2>
        <p className="mt-2 text-center text-sm text-secondText">
          หรือ{' '}
          <Link href="/login" className="font-medium text-inputFieldFocus hover:text-primary">
            เข้าสู่ระบบด้วยบัญชีที่มีอยู่แล้ว
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-background py-8 px-4 shadow-sm border border-searchBox rounded-lg sm:px-10">
          {renderProgressBar()}
          
          <h3 className="text-xl font-medium text-mainText mb-6">{getSectionTitle()}</h3>
          
          {errorMessage && (
            <div className="mb-6 bg-cancelRed/10 border-l-4 border-cancelRed p-4 rounded">
              <p className="text-cancelRed">{errorMessage}</p>
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            {/* Section 1: Login Information */}
            {currentSection === 1 && (
              <div className="space-y-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-primary">
                    อีเมล
                  </label>
                  <div className="mt-1">
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="appearance-none block w-full px-3 py-2 border border-searchBox rounded-md shadow-sm placeholder-placeholder focus:outline-none focus:ring-2 focus:ring-inputFieldFocus focus:border-inputFieldFocus sm:text-sm"
                      placeholder="example@email.com"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-primary">
                    ชื่อผู้ใช้
                  </label>
                  <div className="mt-1">
                    <input
                      id="username"
                      name="username"
                      type="text"
                      required
                      value={formData.username}
                      onChange={handleChange}
                      className="appearance-none block w-full px-3 py-2 border border-searchBox rounded-md shadow-sm placeholder-placeholder focus:outline-none focus:ring-2 focus:ring-inputFieldFocus focus:border-inputFieldFocus sm:text-sm"
                      placeholder="กรอกชื่อผู้ใช้"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-primary">
                    รหัสผ่าน
                  </label>
                  <div className="mt-1">
                    <input
                      id="password"
                      name="password"
                      type="password"
                      autoComplete="new-password"
                      required
                      value={formData.password}
                      onChange={handleChange}
                      className="appearance-none block w-full px-3 py-2 border border-searchBox rounded-md shadow-sm placeholder-placeholder focus:outline-none focus:ring-2 focus:ring-inputFieldFocus focus:border-inputFieldFocus sm:text-sm"
                      placeholder="รหัสผ่านอย่างน้อย 8 ตัวอักษร"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-primary">
                    ยืนยันรหัสผ่าน
                  </label>
                  <div className="mt-1">
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      autoComplete="new-password"
                      required
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="appearance-none block w-full px-3 py-2 border border-searchBox rounded-md shadow-sm placeholder-placeholder focus:outline-none focus:ring-2 focus:ring-inputFieldFocus focus:border-inputFieldFocus sm:text-sm"
                      placeholder="กรอกรหัสผ่านอีกครั้ง"
                    />
                  </div>
                </div>

                <div>
                  <button
                    type="button"
                    onClick={nextSection}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-background bg-button hover:bg-hoverButton focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-inputFieldFocus transition-colors"
                  >
                    ถัดไป
                  </button>
                </div>
              </div>
            )}

            {/* Section 2: Personal Information */}
            {currentSection === 2 && (
              <div className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-primary">
                    ชื่อ-นามสกุล
                  </label>
                  <div className="mt-1">
                    <input
                      id="name"
                      name="name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      className="appearance-none block w-full px-3 py-2 border border-searchBox rounded-md shadow-sm placeholder-placeholder focus:outline-none focus:ring-2 focus:ring-inputFieldFocus focus:border-inputFieldFocus sm:text-sm"
                      placeholder="กรอกชื่อเต็ม"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="phone_number" className="block text-sm font-medium text-primary">
                    เบอร์โทรศัพท์
                  </label>
                  <div className="mt-1">
                    <input
                      id="phone_number"
                      name="phone_number"
                      type="tel"
                      required
                      value={formData.phone_number}
                      onChange={handleChange}
                      className="appearance-none block w-full px-3 py-2 border border-searchBox rounded-md shadow-sm placeholder-placeholder focus:outline-none focus:ring-2 focus:ring-inputFieldFocus focus:border-inputFieldFocus sm:text-sm"
                      placeholder="0812345678"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="role" className="block text-sm font-medium text-primary">
                    ประเภทผู้ใช้งาน
                  </label>
                  <div className="mt-1">
                    <select
                      id="role"
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                      className="appearance-none block w-full px-3 py-2 border border-searchBox rounded-md shadow-sm placeholder-placeholder focus:outline-none focus:ring-2 focus:ring-inputFieldFocus focus:border-inputFieldFocus bg-background sm:text-sm"
                    >
                      <option value="user">ลูกค้า</option>
                      <option value="admin">ผู้ดูแลระบบ</option>
                      <option value="editor">ผู้แก้ไข</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={prevSection}
                    className="w-full flex justify-center py-2 px-4 border border-searchBox rounded-md shadow-sm text-sm font-medium text-primary bg-background hover:bg-searchBox focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-inputFieldFocus transition-colors"
                  >
                    ย้อนกลับ
                  </button>
                  <button
                    type="button"
                    onClick={nextSection}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-background bg-button hover:bg-hoverButton focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-inputFieldFocus transition-colors"
                  >
                    ถัดไป
                  </button>
                </div>
              </div>
            )}

            {/* Section 3: Address Information */}
            {currentSection === 3 && (
              <div className="space-y-6">
                <div>
                  <label htmlFor="address_line1" className="block text-sm font-medium text-primary">
                    ที่อยู่บรรทัดที่ 1
                  </label>
                  <div className="mt-1">
                    <input
                      id="address_line1"
                      name="address_line1"
                      type="text"
                      required
                      value={formData.address_line1}
                      onChange={handleChange}
                      className="appearance-none block w-full px-3 py-2 border border-searchBox rounded-md shadow-sm placeholder-placeholder focus:outline-none focus:ring-2 focus:ring-inputFieldFocus focus:border-inputFieldFocus sm:text-sm"
                      placeholder="บ้านเลขที่, หมู่บ้าน, ซอย"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="address_line2" className="block text-sm font-medium text-primary">
                    ที่อยู่บรรทัดที่ 2 (ถ้ามี)
                  </label>
                  <div className="mt-1">
                    <input
                      id="address_line2"
                      name="address_line2"
                      type="text"
                      value={formData.address_line2}
                      onChange={handleChange}
                      className="appearance-none block w-full px-3 py-2 border border-searchBox rounded-md shadow-sm placeholder-placeholder focus:outline-none focus:ring-2 focus:ring-inputFieldFocus focus:border-inputFieldFocus sm:text-sm"
                      placeholder="ถนน, อาคาร"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="district" className="block text-sm font-medium text-primary">
                      แขวง/ตำบล
                    </label>
                    <div className="mt-1">
                      <input
                        id="district"
                        name="district"
                        type="text"
                        value={formData.district}
                        onChange={handleChange}
                        className="appearance-none block w-full px-3 py-2 border border-searchBox rounded-md shadow-sm placeholder-placeholder focus:outline-none focus:ring-2 focus:ring-inputFieldFocus focus:border-inputFieldFocus sm:text-sm"
                        placeholder="แขวง/ตำบล"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="city" className="block text-sm font-medium text-primary">
                      เขต/อำเภอ
                    </label>
                    <div className="mt-1">
                      <input
                        id="city"
                        name="city"
                        type="text"
                        required
                        value={formData.city}
                        onChange={handleChange}
                        className="appearance-none block w-full px-3 py-2 border border-searchBox rounded-md shadow-sm placeholder-placeholder focus:outline-none focus:ring-2 focus:ring-inputFieldFocus focus:border-inputFieldFocus sm:text-sm"
                        placeholder="เขต/อำเภอ"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="province" className="block text-sm font-medium text-primary">
                      จังหวัด
                    </label>
                    <div className="mt-1">
                      <input
                        id="province"
                        name="province"
                        type="text"
                        required
                        value={formData.province}
                        onChange={handleChange}
                        className="appearance-none block w-full px-3 py-2 border border-searchBox rounded-md shadow-sm placeholder-placeholder focus:outline-none focus:ring-2 focus:ring-inputFieldFocus focus:border-inputFieldFocus sm:text-sm"
                        placeholder="จังหวัด"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="postal_code" className="block text-sm font-medium text-primary">
                      รหัสไปรษณีย์
                    </label>
                    <div className="mt-1">
                      <input
                        id="postal_code"
                        name="postal_code"
                        type="text"
                        required
                        value={formData.postal_code}
                        onChange={handleChange}
                        className="appearance-none block w-full px-3 py-2 border border-searchBox rounded-md shadow-sm placeholder-placeholder focus:outline-none focus:ring-2 focus:ring-inputFieldFocus focus:border-inputFieldFocus sm:text-sm"
                        placeholder="10xxx"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={prevSection}
                    className="w-full flex justify-center py-2 px-4 border border-searchBox rounded-md shadow-sm text-sm font-medium text-primary bg-background hover:bg-searchBox focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-inputFieldFocus transition-colors"
                  >
                    ย้อนกลับ
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-background bg-button hover:bg-hoverButton focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-inputFieldFocus disabled:opacity-50 transition-colors"
                  >
                    {isLoading ? 'กำลังสร้างบัญชี...' : 'สมัครสมาชิก'}
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}