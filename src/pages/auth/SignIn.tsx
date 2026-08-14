import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import AuthLayout from './AuthLayout';
import GoogleButton from './GoogleButton';

const SignIn = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const next = params.get('next') || '/dashboard';

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setBusy(false);
    if (error) {
      toast.error(error.message === 'Invalid login credentials' ? 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' : error.message);
      return;
    }
    navigate(next, { replace: true });
  };

  return (
    <AuthLayout headline="CREATE FROM KNOWLEDGE." sub="เปลี่ยนแหล่งข้อมูล ไอเดีย และงานวิจัยของคุณให้เป็นหนังสือ พรีเซนเทชัน และเรื่องเล่าภาพด้วย AI">
      <h1 className="font-display text-xl font-bold">เข้าสู่ระบบ</h1>
      <p className="mt-1 text-xs font-ui text-muted-foreground">ยินดีต้อนรับกลับสู่ PaperPetal AI</p>

      <div className="mt-4">
        <GoogleButton next={next} />
      </div>

      <div className="my-4 flex items-center gap-3 text-[11px] font-ui uppercase tracking-wide text-muted-foreground">
        <span className="h-px flex-1 bg-border" /> หรือ <span className="h-px flex-1 bg-border" />
      </div>

      <form onSubmit={submit} className="flex flex-col gap-3">
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
          <span className="flex items-center justify-between text-xs font-ui font-semibold text-muted-foreground">
            รหัสผ่าน
            <Link to="/auth/forgot-password" className="text-primary">ลืมรหัสผ่าน?</Link>
          </span>
          <input
            type="password"
            required
            value={password}
            onChange={e => setPassword(e.target.value)}
            autoComplete="current-password"
            className="min-h-12 rounded-xl border border-border bg-elevated px-3 text-sm outline-none focus:border-primary"
          />
        </label>
        <button
          type="submit"
          disabled={busy}
          className="mt-1 flex min-h-12 items-center justify-center gap-2 rounded-full bg-gradient-ai px-4 text-sm font-ui font-bold text-primary-foreground disabled:opacity-60"
        >
          {busy && <Loader2 className="h-4 w-4 animate-spin" />} เข้าสู่ระบบ
        </button>
      </form>

      <p className="mt-4 text-xs font-ui text-muted-foreground">
        ยังไม่มีบัญชี PaperPetal?{' '}
        <Link to="/auth/sign-up" className="font-bold text-primary">เริ่มใช้ฟรี</Link>
      </p>
    </AuthLayout>
  );
};

export default SignIn;
