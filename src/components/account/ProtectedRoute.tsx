import { Navigate, useLocation } from 'react-router-dom';
import Seo from '@/components/Seo';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/auth/AuthProvider';

/** ชื่อหน้าใช้งานภายในแอป (ไม่ให้ index เพราะต้องล็อกอิน) */
const APP_TITLES: Record<string, string> = {
  '/dashboard': 'หน้าหลัก',
  '/projects': 'โปรเจกต์ของฉัน',
  '/knowledge': 'แหล่งข้อมูล',
  '/chat': 'Ask PaperPetal',
  '/book': 'Book Studio',
  '/present': 'Presentation Studio',
  '/billing': 'บัญชีและการชำระเงิน',
  '/admin': 'Admin Console',
  '/onboarding': 'เริ่มต้นใช้งาน',
};


const Splash = () => (
  <div className="flex min-h-[100dvh] items-center justify-center bg-background">
    <Loader2 className="h-6 w-6 animate-spin text-primary" />
  </div>
);

export const ProtectedRoute = ({ children, adminOnly }: { children: React.ReactNode; adminOnly?: boolean }) => {
  const { session, loading, isAdmin, profile } = useAuth();
  const location = useLocation();

  if (loading && !session) return <Splash />;
  if (!session) return <Navigate to={`/auth/sign-in?next=${encodeURIComponent(location.pathname)}`} replace />;
  if (loading) return <Splash />;
  if (adminOnly && !isAdmin) return <Navigate to="/dashboard" replace />;
  if (profile && !profile.onboarded && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />;
  }
  return (
    <>
      <Seo
        path={location.pathname}
        title={`${APP_TITLES[location.pathname] || 'Studio'} | PaperPetal AI`}
        description="พื้นที่ทำงานส่วนตัวของ PaperPetal AI"
        noindex
      />
      {children}
    </>
  );
};

export default ProtectedRoute;
