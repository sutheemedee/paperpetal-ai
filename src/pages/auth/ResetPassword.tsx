import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import AuthLayout from './AuthLayout';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [ready, setReady] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const hash = window.location.hash;
    if (hash.includes('type=recovery')) setReady(true);
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true);
    });
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      toast.error('รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร');
      return;
    }
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success('ตั้งรหัสผ่านใหม่สำเร็จ');
    navigate('/dashboard', { replace: true });
  };

  return (
    <AuthLayout headline="NEW PASSWORD." sub="ตั้งรหัสผ่านใหม่เพื่อกลับเข้าใช้งานบัญชีของคุณ" seo={{ title: "ตั้งรหัสผ่านใหม่ | PaperPetal AI", description: "ตั้งรหัสผ่านใหม่สำหรับบัญชี PaperPetal AI", path: "/auth/reset-password", noindex: true }}>
      <h1 className="font-display text-xl font-bold">ตั้งรหัสผ่านใหม่</h1>
      {!ready && <p className="mt-2 text-xs font-ui text-muted-foreground">เปิดหน้านี้จากลิงก์ในอีเมลเพื่อตั้งรหัสผ่านใหม่</p>}
      <form onSubmit={submit} className="mt-4 flex flex-col gap-3">
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-ui font-semibold text-muted-foreground">รหัสผ่านใหม่</span>
          <input
            type="password"
            required
            value={password}
            onChange={e => setPassword(e.target.value)}
            autoComplete="new-password"
            className="min-h-12 rounded-xl border border-border bg-elevated px-3 text-sm outline-none focus:border-primary"
          />
        </label>
        <button
          disabled={busy}
          className="flex min-h-12 items-center justify-center gap-2 rounded-full bg-gradient-ai text-sm font-ui font-bold text-primary-foreground disabled:opacity-60"
        >
          {busy && <Loader2 className="h-4 w-4 animate-spin" />} บันทึกรหัสผ่านใหม่
        </button>
      </form>
    </AuthLayout>
  );
};

export default ResetPassword;
