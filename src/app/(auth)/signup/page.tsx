'use client';

import { useState, ChangeEvent, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

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

  // Password strength state
  const [passwordStrength, setPasswordStrength] = useState<number>(0);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Check password strength when password field changes
    if (name === 'password') {
      checkPasswordStrength(value);
    }
  };

  // Function to check password strength
  const checkPasswordStrength = (password: string) => {
    let strength = 0;
    
    // Length check
    if (password.length >= 8) strength += 1;
    
    // Character variety checks
    if (/[A-Z]/.test(password)) strength += 1; // Has uppercase
    if (/[a-z]/.test(password)) strength += 1; // Has lowercase
    if (/[0-9]/.test(password)) strength += 1; // Has number
    if (/[^A-Za-z0-9]/.test(password)) strength += 1; // Has special char
    
    setPasswordStrength(strength);
  };

  // Get password strength label and color
  const getPasswordStrengthInfo = () => {
    const labels = ['ต่ำมาก', 'ต่ำ', 'ปานกลาง', 'ดี', 'ดีมาก'];
    const colors = ['bg-cancelRed', 'bg-red-500', 'bg-amber-500', 'bg-green-500', 'bg-acceptGreen'];
    
    return {
      label: labels[Math.min(passwordStrength, 4)],
      color: colors[Math.min(passwordStrength, 4)]
    };
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

      // Check if email is in valid format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        setErrorMessage('กรุณากรอกอีเมลให้ถูกต้อง');
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
          role: 'USER',
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'เกิดข้อผิดพลาด');
      }
      
      // Show success message and redirect to login page after successful registration
      setSuccessMessage('สร้างบัญชีสำเร็จ! กำลังนำคุณไปยังหน้าเข้าสู่ระบบ...');
      
      setTimeout(() => {
        router.push('/login');
      }, 2000);
      
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ');
    } finally {
      setIsLoading(false);
    }
  };
  
  const [successMessage, setSuccessMessage] = useState<string>('');

  // Calculate progress percentage
  const progressPercentage = ((currentSection - 1) / 2) * 100;
  
  // Get icon for step (completed, active, or inactive)
  const getStepIcon = (step: number) => {
    if (currentSection > step) {
      // Completed step
      return (
        <div className="w-10 h-10 rounded-full bg-acceptGreen flex items-center justify-center text-background">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      );
    } else if (currentSection === step) {
      // Current step
      return (
        <div className="w-10 h-10 rounded-full bg-inputFieldFocus flex items-center justify-center text-background">
          {step}
        </div>
      );
    } else {
      // Future step
      return (
        <div className="w-10 h-10 rounded-full bg-searchBox flex items-center justify-center text-secondText">
          {step}
        </div>
      );
    }
  };

  // Get step title based on section
  const getSectionInfo = () => {
    switch(currentSection) {
      case 1: 
        return {
          title: 'ข้อมูลเข้าสู่ระบบ',
          description: 'กรอกข้อมูลสำหรับการเข้าสู่ระบบ',
          icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-inputFieldFocus" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
        };
      case 2: 
        return {
          title: 'ข้อมูลส่วนตัว',
          description: 'กรอกข้อมูลส่วนตัวของคุณ',
          icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-inputFieldFocus" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
        };
      case 3: 
        return {
          title: 'ข้อมูลที่อยู่',
          description: 'กรอกที่อยู่สำหรับการจัดส่ง',
          icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-inputFieldFocus" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
        };
      default: 
        return {
          title: '',
          description: '',
          icon: null
        };
    }
  };
  
  const { title, description, icon } = getSectionInfo();

  return (
    <div className="min-h-screen bg-searchBox/40 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-lg">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-mainText">
            สร้างบัญชีผู้ใช้
          </h2>
          <p className="mt-2 text-center text-sm text-secondText">
            สมัครสมาชิกเพื่อใช้งานทุกบริการของเรา
          </p>
        </div>
        
        {/* Progress indicators */}
        <div className="mt-8 mb-4 relative">
          <div className="flex justify-between items-center">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex flex-col items-center">
                {getStepIcon(step)}
                <span className={`mt-2 text-xs ${currentSection === step ? 'font-medium text-mainText' : 'text-secondText'}`}>
                  {step === 1 ? 'ข้อมูลบัญชี' : step === 2 ? 'ข้อมูลส่วนตัว' : 'ที่อยู่'}
                </span>
              </div>
            ))}
            
            {/* Progress line */}
            <div className="absolute top-5 left-0 h-[2px] bg-searchBox w-full -z-10"></div>
            <div 
              className="absolute top-5 left-0 h-[2px] bg-inputFieldFocus -z-10 transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </div>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-lg">
        <div className="bg-background shadow-lg rounded-xl overflow-hidden">
          {/* Form header */}
          <div className="border-b border-searchBox p-6 flex items-center">
            <div className="p-2 bg-inputFieldFocus/10 rounded-full mr-4">
              {icon}
            </div>
            <div>
              <h3 className="text-xl font-bold text-mainText">{title}</h3>
              <p className="text-sm text-secondText">{description}</p>
            </div>
          </div>
          
          {/* Success message */}
          {successMessage && (
            <div className="p-4 bg-acceptGreen/10 border-l-4 border-acceptGreen">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-acceptGreen" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-acceptGreen">{successMessage}</p>
                </div>
              </div>
            </div>
          )}
          
          {/* Error message */}
          {errorMessage && (
            <div className="p-4 bg-cancelRed/10 border-l-4 border-cancelRed">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-cancelRed" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-cancelRed">{errorMessage}</p>
                </div>
              </div>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="p-6">
            <AnimatePresence mode="wait">
              {/* Section 1: Login Information */}
              {currentSection === 1 && (
                <motion.div 
                  key="section1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-5"
                >
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-primary mb-1">
                      อีเมล <span className="text-cancelRed">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-secondText" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        className="appearance-none block w-full pl-10 px-3 py-3 border border-searchBox rounded-lg shadow-sm placeholder-placeholder focus:outline-none focus:ring-2 focus:ring-inputFieldFocus focus:border-inputFieldFocus"
                        placeholder="example@email.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="username" className="block text-sm font-medium text-primary mb-1">
                      ชื่อผู้ใช้ <span className="text-cancelRed">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-secondText" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <input
                        id="username"
                        name="username"
                        type="text"
                        required
                        value={formData.username}
                        onChange={handleChange}
                        className="appearance-none block w-full pl-10 px-3 py-3 border border-searchBox rounded-lg shadow-sm placeholder-placeholder focus:outline-none focus:ring-2 focus:ring-inputFieldFocus focus:border-inputFieldFocus"
                        placeholder="กรอกชื่อผู้ใช้"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-primary mb-1">
                      รหัสผ่าน <span className="text-cancelRed">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-secondText" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      </div>
                      <input
                        id="password"
                        name="password"
                        type="password"
                        autoComplete="new-password"
                        required
                        value={formData.password}
                        onChange={handleChange}
                        className="appearance-none block w-full pl-10 px-3 py-3 border border-searchBox rounded-lg shadow-sm placeholder-placeholder focus:outline-none focus:ring-2 focus:ring-inputFieldFocus focus:border-inputFieldFocus"
                        placeholder="รหัสผ่านอย่างน้อย 8 ตัวอักษร"
                      />
                    </div>
                    
                    {/* Password strength indicator */}
                    {formData.password && (
                      <div className="mt-2">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs text-secondText">ความปลอดภัย: </span>
                          <span className="text-xs font-medium" style={{ color: getPasswordStrengthInfo().color.replace('bg-', 'text-') }}>
                            {getPasswordStrengthInfo().label}
                          </span>
                        </div>
                        <div className="w-full bg-searchBox rounded-full h-1.5 flex">
                          {[...Array(5)].map((_, index) => (
                            <div 
                              key={index}
                              className={`h-1.5 rounded-full ${index < passwordStrength ? getPasswordStrengthInfo().color : 'bg-transparent'}`}
                              style={{ width: '20%', transition: 'background-color 0.3s' }}
                            ></div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-primary mb-1">
                      ยืนยันรหัสผ่าน <span className="text-cancelRed">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-secondText" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                      </div>
                      <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        autoComplete="new-password"
                        required
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className="appearance-none block w-full pl-10 px-3 py-3 border border-searchBox rounded-lg shadow-sm placeholder-placeholder focus:outline-none focus:ring-2 focus:ring-inputFieldFocus focus:border-inputFieldFocus"
                        placeholder="กรอกรหัสผ่านอีกครั้ง"
                      />
                      {formData.password && formData.confirmPassword && (
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                          {formData.password === formData.confirmPassword ? (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-acceptGreen" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-cancelRed" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="pt-4">
                    <button
                      type="button"
                      onClick={nextSection}
                      className="w-full flex items-center justify-center py-3 px-4 rounded-lg shadow-sm text-white bg-button hover:bg-hoverButton focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-inputFieldFocus transition-colors"
                    >
                      <span>ถัดไป</span>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </button>
                  </div>
                  
                  <div className="mt-6 text-center">
                    <p className="text-sm text-secondText">
                      มีบัญชีอยู่แล้ว?{' '}
                      <Link href="/login" className="font-medium text-inputFieldFocus hover:text-inputFieldFocus/80 transition-colors">
                        เข้าสู่ระบบ
                      </Link>
                    </p>
                  </div>
                </motion.div>
              )}

              {/* Section 2: Personal Information */}
              {currentSection === 2 && (
                <motion.div 
                  key="section2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-5"
                >
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-primary mb-1">
                      ชื่อ-นามสกุล <span className="text-cancelRed">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-secondText" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <input
                        id="name"
                        name="name"
                        type="text"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        className="appearance-none block w-full pl-10 px-3 py-3 border border-searchBox rounded-lg shadow-sm placeholder-placeholder focus:outline-none focus:ring-2 focus:ring-inputFieldFocus focus:border-inputFieldFocus"
                        placeholder="กรอกชื่อ-นามสกุล"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="phone_number" className="block text-sm font-medium text-primary mb-1">
                      เบอร์โทรศัพท์ <span className="text-cancelRed">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-secondText" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                      </div>
                      <input
                        id="phone_number"
                        name="phone_number"
                        type="tel"
                        required
                        value={formData.phone_number}
                        onChange={handleChange}
                        className="appearance-none block w-full pl-10 px-3 py-3 border border-searchBox rounded-lg shadow-sm placeholder-placeholder focus:outline-none focus:ring-2 focus:ring-inputFieldFocus focus:border-inputFieldFocus"
                        placeholder="0812345678"
                      />
                    </div>
                    <p className="mt-1 text-xs text-secondText">รูปแบบ: 0812345678</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-4">
                    <button
                      type="button"
                      onClick={prevSection}
                      className="w-full flex items-center justify-center py-3 px-4 border border-searchBox rounded-lg text-primary bg-background hover:bg-searchBox transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                      </svg>
                      <span>ย้อนกลับ</span>
                    </button>
                    <button
                      type="button"
                      onClick={nextSection}
                      className="w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-white bg-button hover:bg-hoverButton focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-inputFieldFocus transition-colors"
                    >
                      <span>ถัดไป</span>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Section 3: Address Information */}
              {currentSection === 3 && (
                <motion.div 
                  key="section3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-5"
                >
                  <div>
                    <label htmlFor="address_line1" className="block text-sm font-medium text-primary mb-1">
                      ที่อยู่บรรทัดที่ 1 <span className="text-cancelRed">*</span>
                    </label>
                    <input
                      id="address_line1"
                      name="address_line1"
                      type="text"
                      required
                      value={formData.address_line1}
                      onChange={handleChange}
                      className="appearance-none block w-full px-3 py-3 border border-searchBox rounded-lg shadow-sm placeholder-placeholder focus:outline-none focus:ring-2 focus:ring-inputFieldFocus focus:border-inputFieldFocus"
                      placeholder="บ้านเลขที่, หมู่บ้าน, ซอย"
                    />
                  </div>

                  <div>
                    <label htmlFor="address_line2" className="block text-sm font-medium text-primary mb-1">
                      ที่อยู่บรรทัดที่ 2 (ถ้ามี)
                    </label>
                    <input
                      id="address_line2"
                      name="address_line2"
                      type="text"
                      value={formData.address_line2}
                      onChange={handleChange}
                      className="appearance-none block w-full px-3 py-3 border border-searchBox rounded-lg shadow-sm placeholder-placeholder focus:outline-none focus:ring-2 focus:ring-inputFieldFocus focus:border-inputFieldFocus"
                      placeholder="ถนน, อาคาร"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="district" className="block text-sm font-medium text-primary mb-1">
                        แขวง/ตำบล
                      </label>
                      <input
                        id="district"
                        name="district"
                        type="text"
                        value={formData.district}
                        onChange={handleChange}
                        className="appearance-none block w-full px-3 py-3 border border-searchBox rounded-lg shadow-sm placeholder-placeholder focus:outline-none focus:ring-2 focus:ring-inputFieldFocus focus:border-inputFieldFocus"
                        placeholder="แขวง/ตำบล"
                      />
                    </div>

                    <div>
                      <label htmlFor="city" className="block text-sm font-medium text-primary mb-1">
                        เขต/อำเภอ <span className="text-cancelRed">*</span>
                      </label>
                      <input
                        id="city"
                        name="city"
                        type="text"
                        required
                        value={formData.city}
                        onChange={handleChange}
                        className="appearance-none block w-full px-3 py-3 border border-searchBox rounded-lg shadow-sm placeholder-placeholder focus:outline-none focus:ring-2 focus:ring-inputFieldFocus focus:border-inputFieldFocus"
                        placeholder="เขต/อำเภอ"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="province" className="block text-sm font-medium text-primary mb-1">
                        จังหวัด <span className="text-cancelRed">*</span>
                      </label>
                      <input
                        id="province"
                        name="province"
                        type="text"
                        required
                        value={formData.province}
                        onChange={handleChange}
                        className="appearance-none block w-full px-3 py-3 border border-searchBox rounded-lg shadow-sm placeholder-placeholder focus:outline-none focus:ring-2 focus:ring-inputFieldFocus focus:border-inputFieldFocus"
                        placeholder="จังหวัด"
                      />
                    </div>

                    <div>
                      <label htmlFor="postal_code" className="block text-sm font-medium text-primary mb-1">
                        รหัสไปรษณีย์ <span className="text-cancelRed">*</span>
                      </label>
                      <input
                        id="postal_code"
                        name="postal_code"
                        type="text"
                        required
                        value={formData.postal_code}
                        onChange={handleChange}
                        className="appearance-none block w-full px-3 py-3 border border-searchBox rounded-lg shadow-sm placeholder-placeholder focus:outline-none focus:ring-2 focus:ring-inputFieldFocus focus:border-inputFieldFocus"
                        placeholder="10xxx"
                      />
                    </div>
                  </div>

                  <div className="pt-4 grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={prevSection}
                      className="w-full flex items-center justify-center py-3 px-4 border border-searchBox rounded-lg text-primary bg-background hover:bg-searchBox transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                      </svg>
                      <span>ย้อนกลับ</span>
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-white bg-button hover:bg-hoverButton focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-inputFieldFocus disabled:opacity-50 transition-colors"
                    >
                      {isLoading ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span>กำลังสร้างบัญชี...</span>
                        </>
                      ) : (
                        <>
                          <span>สมัครสมาชิก</span>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </>
                      )}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </form>
        </div>
        
        {/* Terms and Privacy Notice */}
        <div className="mt-6 text-center">
          <p className="text-xs text-secondText">
            การสมัครสมาชิก คุณได้ยอมรับ <a href="#" className="text-inputFieldFocus">เงื่อนไขการใช้งาน</a> และ <a href="#" className="text-inputFieldFocus">นโยบายความเป็นส่วนตัว</a> ของเรา
          </p>
        </div>
      </div>
    </div>
  );
}