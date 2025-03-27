'use client';

export default function AboutUsPage() {
  return (
    <div className="min-h-screen w-full bg-background">
      {/* Hero Section */}
      <div className="relative py-20 bg-gradient-to-br from-inputFieldFocus/10 via-background to-acceptGreen/10">
        <div className="container mx-auto px-6 z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-mainText mb-6">เกี่ยวกับ OmniDine</h1>
            <div className="h-1 w-24 bg-gradient-to-r from-inputFieldFocus to-acceptGreen rounded-full mx-auto mb-8"></div>
            <p className="text-xl text-primary leading-relaxed">
              แพลตฟอร์มบริหารจัดการร้านอาหารที่ครบวงจร ช่วยให้ธุรกิจร้านอาหารของคุณดำเนินงานได้อย่างมีประสิทธิภาพสูงสุด
            </p>
          </div>
        </div>
        
        {/* Decorative Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute w-64 h-64 bg-inputFieldFocus rounded-full opacity-5 blur-3xl -top-10 -left-20"></div>
          <div className="absolute w-64 h-64 bg-acceptGreen rounded-full opacity-5 blur-3xl top-40 right-10"></div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="py-16">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            {/* About OmniDine */}
            <div className="mb-16">
              <h2 className="text-3xl font-bold text-mainText mb-6">เราคือใคร</h2>
              <div className="prose text-primary max-w-none">
                <p className="text-lg mb-4">
                  OmniDine คือแพลตฟอร์มบริหารจัดการร้านอาหารที่ออกแบบมาเพื่อยกระดับการดำเนินงานของร้านอาหารทุกขนาด ตั้งแต่ร้านอาหารขนาดเล็กไปจนถึงร้านอาหารเชนขนาดใหญ่
                </p>
                <p className="text-lg mb-4">
                  เราพัฒนาแพลตฟอร์มที่ใช้งานง่าย ครอบคลุม และมีประสิทธิภาพ โดยมุ่งเน้นการเพิ่มประสิทธิภาพการทำงานของพนักงาน การวิเคราะห์ข้อมูลเชิงลึกสำหรับเจ้าของร้าน และมอบประสบการณ์ที่ยอดเยี่ยมให้กับลูกค้า
                </p>
                <p className="text-lg">
                  ด้วยระบบที่ครบวงจรของเรา คุณสามารถบริหารจัดการทุกด้านของธุรกิจร้านอาหาร ตั้งแต่การรับออเดอร์ การจัดการสต็อกวัตถุดิบ การวิเคราะห์ยอดขาย ไปจนถึงการสร้างความสัมพันธ์กับลูกค้าผ่านระบบสมาชิก
                </p>
              </div>
            </div>
            
            {/* Our Platform */}
            <div className="mb-16">
              <h2 className="text-3xl font-bold text-mainText mb-6">แพลตฟอร์มของเรา</h2>
              <div className="bg-searchBox/30 rounded-2xl p-8">
                <p className="text-lg text-primary mb-8">
                  OmniDine ออกแบบมาเพื่อตอบโจทย์ความต้องการของทุกคนในร้านอาหาร ด้วยระบบที่แบ่งเป็น 3 ส่วนหลัก:
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {/* Owner Section */}
                  <div className="bg-background rounded-xl overflow-hidden shadow-sm">
                    <div className="h-3 bg-inputFieldFocus"></div>
                    <div className="p-6">
                      <div className="w-16 h-16 bg-inputFieldFocus/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-inputFieldFocus" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <h3 className="text-xl font-bold text-mainText text-center mb-4">เจ้าของร้าน</h3>
                      <ul className="space-y-3">
                        <li className="flex items-start">
                          <svg className="w-5 h-5 text-acceptGreen mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span className="text-primary">ดูรายงานยอดขายและกำไร</span>
                        </li>
                        <li className="flex items-start">
                          <svg className="w-5 h-5 text-acceptGreen mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span className="text-primary">บริหารสต็อกสินค้าและวัตถุดิบ</span>
                        </li>
                        <li className="flex items-start">
                          <svg className="w-5 h-5 text-acceptGreen mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span className="text-primary">วิเคราะห์ข้อมูลเชิงลึกและแนวโน้ม</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                  
                  {/* Staff Section */}
                  <div className="bg-background rounded-xl overflow-hidden shadow-sm">
                    <div className="h-3 bg-acceptGreen"></div>
                    <div className="p-6">
                      <div className="w-16 h-16 bg-acceptGreen/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-acceptGreen" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      </div>
                      <h3 className="text-xl font-bold text-mainText text-center mb-4">พนักงาน</h3>
                      <ul className="space-y-3">
                        <li className="flex items-start">
                          <svg className="w-5 h-5 text-acceptGreen mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span className="text-primary">สร้างและจัดการออเดอร์ได้อย่างรวดเร็ว</span>
                        </li>
                        <li className="flex items-start">
                          <svg className="w-5 h-5 text-acceptGreen mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span className="text-primary">รับออเดอร์จากการสั่งออนไลน์</span>
                        </li>
                        <li className="flex items-start">
                          <svg className="w-5 h-5 text-acceptGreen mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span className="text-primary">อัพเดตสถานะรายการอาหาร</span>
                        </li>
                        <li className="flex items-start">
                          <svg className="w-5 h-5 text-acceptGreen mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span className="text-primary">ติดตามการจองโต๊ะและจัดการที่นั่ง</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                  
                  {/* Customer Section */}
                  <div className="bg-background rounded-xl overflow-hidden shadow-sm">
                    <div className="h-3 bg-button"></div>
                    <div className="p-6">
                      <div className="w-16 h-16 bg-button/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-button" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      </div>
                      <h3 className="text-xl font-bold text-mainText text-center mb-4">ลูกค้า</h3>
                      <ul className="space-y-3">
                        <li className="flex items-start">
                          <svg className="w-5 h-5 text-acceptGreen mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span className="text-primary">สั่งอาหารออนไลน์ทั้งแบบจัดส่งและรับที่ร้าน</span>
                        </li>
                        <li className="flex items-start">
                          <svg className="w-5 h-5 text-acceptGreen mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span className="text-primary">จองโต๊ะล่วงหน้าออนไลน์</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Our Mission */}
            <div className="mb-16">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div>
                  <h2 className="text-3xl font-bold text-mainText mb-6">พันธกิจของเรา</h2>
                  <div className="prose text-primary max-w-none">
                    <p className="text-lg mb-4">
                      พันธกิจของ OmniDine คือการปฏิวัติวงการร้านอาหารด้วยเทคโนโลยีที่ทันสมัย ช่วยให้ร้านอาหารทุกขนาดสามารถแข่งขันได้ในยุคดิจิทัล
                    </p>
                    <p className="text-lg">
                      เราเชื่อว่าการบริหารจัดการร้านอาหารที่มีประสิทธิภาพไม่ควรซับซ้อนหรือมีค่าใช้จ่ายสูง เราจึงมุ่งมั่นพัฒนาแพลตฟอร์มที่ใช้งานง่าย มีประสิทธิภาพ และราคาเข้าถึงได้ เพื่อช่วยให้ธุรกิจร้านอาหารเติบโตอย่างยั่งยืน
                    </p>
                  </div>
                  
                  <div className="mt-8">
                    <h3 className="text-xl font-bold text-mainText mb-4">ค่านิยมหลัก</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-start">
                        <div className="w-10 h-10 bg-inputFieldFocus/10 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                          <svg className="w-5 h-5 text-inputFieldFocus" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                        </div>
                        <div>
                          <p className="font-medium text-mainText">นวัตกรรม</p>
                          <p className="text-sm text-secondText">พัฒนาอย่างต่อเนื่อง</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <div className="w-10 h-10 bg-inputFieldFocus/10 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                          <svg className="w-5 h-5 text-inputFieldFocus" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                        </div>
                        <div>
                          <p className="font-medium text-mainText">ลูกค้าเป็นหลัก</p>
                          <p className="text-sm text-secondText">ใส่ใจทุกความต้องการ</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <div className="w-10 h-10 bg-inputFieldFocus/10 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                          <svg className="w-5 h-5 text-inputFieldFocus" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                          </svg>
                        </div>
                        <div>
                          <p className="font-medium text-mainText">ความน่าเชื่อถือ</p>
                          <p className="text-sm text-secondText">มั่นใจได้ทุกการทำงาน</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <div className="w-10 h-10 bg-inputFieldFocus/10 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                          <svg className="w-5 h-5 text-inputFieldFocus" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                          </svg>
                        </div>
                        <div>
                          <p className="font-medium text-mainText">เรียบง่าย</p>
                          <p className="text-sm text-secondText">ใช้งานง่าย ไม่ซับซ้อน</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-inputFieldFocus/70 to-acceptGreen/70 rounded-2xl p-8 text-background flex flex-col justify-center">
                  <h3 className="text-2xl font-bold mb-6">ทำไมต้อง OmniDine?</h3>
                  <ul className="space-y-4">
                    <li className="flex items-start">
                      <svg className="w-6 h-6 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div>
                        <p className="font-medium">ครบวงจรในแพลตฟอร์มเดียว</p>
                        <p className="text-sm text-background/90">รองรับทุกขั้นตอนการทำงานในร้านอาหาร</p>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <svg className="w-6 h-6 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div>
                        <p className="font-medium">ใช้งานง่าย ไม่ซับซ้อน</p>
                        <p className="text-sm text-background/90">ออกแบบมาเพื่อความสะดวกของทุกคน</p>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <svg className="w-6 h-6 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div>
                        <p className="font-medium">แสดงผลข้อมูลเชิงลึกและการวิเคราะห์</p>
                        <p className="text-sm text-background/90">ช่วยให้ธุรกิจตัดสินใจได้อย่างชาญฉลาด</p>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <svg className="w-6 h-6 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div>
                        <p className="font-medium">รองรับการเติบโต</p>
                        <p className="text-sm text-background/90">เหมาะกับร้านอาหารทุกขนาด พร้อมเติบโตไปกับธุรกิจของคุณ</p>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}