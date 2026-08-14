import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import AuthLayout from './AuthLayout';
import GoogleButton from './GoogleButton';

const SignUp = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const navigate = useNavigate();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    if (password.length < 8) {
      toast.error('รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร');
      return;
    }
    setBusy(true);
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/verify-email`,
        data: { display_name: name.trim() },
      },
    });
    setBusy(false);
    if (error) {
      toast.error(error.message.includes('already registered') ? 'อีเมลนี้มีบัญชีอยู่แล้ว' : error.message);
      return;
    }
    if (data.session) {
      navigate('/onboarding', { replace: true });
      return;
    }
    setSent(true);
  };

  return (
    <AuthLayout headline="START FREE." sub="ทดลองใช้ PaperPetal AI ได้จริงก่อนจ่าย — 3 โปรเจกต์ 30 AI Pages 10 AI Images">
      {sent ? (
        <div className="text-center">
          <h1 className="font-display text-xl font-bold">ตรวจอีเมลของคุณ</h1>
          <p className="mt-2 text-sm font-ui text-muted-foreground">
            เราส่งลิงก์ยืนยันไปที่ <span className="font-bold text-foreground">{email}</span> แล้ว
            กดลิงก์ในอีเมลเพื่อเริ่มใช้งานบัญชีฟรีของคุณ
          </p>
          <Link to="/auth/sign-in" className="mt-5 flex min-h-12 items-center justify-center rounded-full border border-border text-sm font-ui font-bold">
            กลับไปหน้าเข้าสู่ระบบ
          </Link>
        </div>
      ) : (
        <>
          <h1 className="font-display text-xl font-bold">สร้างบัญชีฟรี</h1>
          <p className="mt-1 text-xs font-ui text-muted-foreground">ไม่ต้องใช้บัตรเครดิต</p>

          <div className="mt-4">
            <GoogleButton next="/onboarding" />
          </div>

          <div className="my-4 flex items-center gap-3 text-[11px] font-ui uppercase tracking-wide text-muted-foreground">
            <span className="h-px flex-1 bg-border" /> หรือ <span className="h-px flex-1 bg-border" />
          </div>

          <form onSubmit={submit} className="flex flex-col gap-3">
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-ui font-semibold text-muted-foreground">ชื่อที่ใช้แสดง</span>
              <input
                required
                value={name}
                onChange={e => setName(e.target.value)}
                maxLength={60}
                className="min-h-12 rounded-xl border border-border bg-elevated px-3 text-sm outline-none focus:border-primary"
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-ui font-semibold text-muted-foreground">อีเมล</span>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                autoComplete="email"
                className="min-h-12 rounded-xl border border-border bg-elevated px-3 text-sm outline-none focus:border-primary"
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-ui font-semibold text-muted-foreground">รหัสผ่าน (อย่างน้อย 8 ตัว)</span>
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
              type="submit"
              disabled={busy}
              className="mt-1 flex min-h-12 items-center justify-center gap-2 rounded-full bg-gradient-ai px-4 text-sm font-ui font-bold text-primary-foreground disabled:opacity-60"
            >
              {busy && <Loader2 className="h-4 w-4 animate-spin" />} เริ่มใช้ฟรี
            </button>
          </form>

          <p className="mt-4 text-xs font-ui text-muted-foreground">
            มีบัญชีอยู่แล้ว? <Link to="/auth/sign-in" className="font-bold text-primary">เข้าสู่ระบบ</Link>
          </p>
        </>
      )}
    </AuthLayout>
  );
};

export default SignUp;
