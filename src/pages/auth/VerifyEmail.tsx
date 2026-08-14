import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MailCheck } from 'lucide-react';
import { useAuth } from '@/auth/AuthProvider';
import AuthLayout from './AuthLayout';

const VerifyEmail = () => {
  const { session } = useAuth();
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    if (!session) return;
    const t = setInterval(() => setCountdown(c => c - 1), 1000);
    return () => clearInterval(t);
  }, [session]);

  useEffect(() => {
    if (session && countdown <= 0) navigate('/onboarding', { replace: true });
  }, [session, countdown, navigate]);

  return (
    <AuthLayout headline="EMAIL VERIFIED." sub="บัญชีของคุณพร้อมใช้งาน PaperPetal AI แล้ว" seo={{ title: "ยืนยันอีเมล | PaperPetal AI", description: "ยืนยันอีเมลเพื่อเริ่มใช้งาน PaperPetal AI", path: "/auth/verify-email", noindex: true }}>
      <div className="text-center">
        <MailCheck className="mx-auto h-10 w-10 text-success" />
        <h1 className="mt-3 font-display text-xl font-bold">
          {session ? 'ยืนยันอีเมลเรียบร้อย' : 'ยืนยันอีเมลของคุณ'}
        </h1>
        <p className="mt-2 text-sm font-ui text-muted-foreground">
          {session ? `กำลังเข้าสู่การตั้งค่าเริ่มต้นใน ${Math.max(countdown, 0)} วินาที` : 'กดลิงก์ยืนยันในอีเมลที่เราส่งให้ แล้วกลับมาที่หน้านี้'}
        </p>
        <Link
          to={session ? '/onboarding' : '/auth/sign-in'}
          className="mt-5 flex min-h-12 items-center justify-center rounded-full bg-gradient-ai text-sm font-ui font-bold text-primary-foreground"
        >
          {session ? 'ไปต่อ' : 'ไปหน้าเข้าสู่ระบบ'}
        </Link>
      </div>
    </AuthLayout>
  );
};

export default VerifyEmail;
