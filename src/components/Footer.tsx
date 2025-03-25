import Link from "next/link";

export default function footer() {
    return (
        <div className="pt-8">
            <footer className="bg-searchBox/70 py-10">
                <div className="container mx-auto px-6">
                    <div className="flex flex-col md:flex-row justify-between items-center">
                        <div className="mb-6 md:mb-0">
                            <h2 className="text-2xl font-bold text-mainText">OmniDine</h2>
                            <p className="text-secondText">ระบบจัดการร้านอาหารที่ครบวงจร</p>
                        </div>
                        
                        <div className="flex space-x-8">
                            <Link href="/menu" className="text-primary hover:text-inputFieldFocus transition-colors">
                                หน้าหลัก
                            </Link>
                            <Link href="/booking" className="text-primary hover:text-inputFieldFocus transition-colors">
                                จองโต๊ะ
                            </Link>
                        </div>
                    </div>
                    
                    <div className="mt-8 pt-8 border-t border-searchBox text-center">
                        <p className="text-sm text-secondText">
                            © 2025 OmniDine. สงวนลิขสิทธิ์.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    )
}