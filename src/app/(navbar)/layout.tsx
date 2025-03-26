import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar/Navbar";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
    return (
      <div className="auth-layout">
        <Navbar />
            {children}
        <Footer />
      </div>
    );
  }