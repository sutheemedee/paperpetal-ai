import { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import AuthLayout from './AuthLayout';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setSent(true);
  };

  return (
    <AuthLayout headline="RESET YOUR ACCESS." sub="เราจะส่งลิงก์ตั้งรหัสผ่านใหม่ไปที่อีเมลของคุณ" seo={{ title: "ลืมรหัสผ่าน | KIVORA", description: "ขอลิงก์ตั้งรหัสผ่านใหม่สำหรับบัญชี KIVORA", path: "/auth/forgot-password", noindex: true }}>
      <h1 className="font-display text-xl font-bold">ลืมรหัสผ่าน</h1>
      {sent ? (
        <p className="mt-3 text-sm font-ui text-muted-foreground">
          ส่งลิงก์ตั้งรหัสผ่านใหม่ไปที่ <span className="font-bold text-foreground">{email}</span> แล้ว
        </p>
      ) : (
        <form onSubmit={submit} className="mt-4 flex flex-col gap-3">
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-ui font-semibold text-muted-foreground">อีเมลบัญชีของคุณ</span>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="min-h-12 rounded-xl border border-border bg-elevated px-3 text-sm outline-none focus:border-primary"
            />
          </label>
          <button
            disabled={busy}
            className="flex min-h-12 items-center justify-center gap-2 rounded-full bg-gradient-ai text-sm font-ui font-bold text-primary-foreground disabled:opacity-60"
          >
            {busy && <Loader2 className="h-4 w-4 animate-spin" />} ส่งลิงก์ตั้งรหัสผ่านใหม่
          </button>
        </form>
      )}
      <Link to="/auth/sign-in" className="mt-4 block text-xs font-ui font-bold text-primary">กลับไปเข้าสู่ระบบ</Link>
    </AuthLayout>
  );
};

export default ForgotPassword;
