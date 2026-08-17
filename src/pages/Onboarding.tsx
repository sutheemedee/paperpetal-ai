import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, FileText, GraduationCap, Layers, Newspaper, Presentation, Sparkles, Wand2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/auth/AuthProvider';
import { PetalMark } from '@/components/brand/Logo';

const GOALS = [
  { id: 'book', label: 'หนังสือ / eBook', icon: BookOpen },
  { id: 'manual', label: 'คู่มือ / Manual', icon: FileText },
  { id: 'presentation', label: 'พรีเซนเทชัน', icon: Presentation },
  { id: 'course', label: 'คอร์ส / Workbook', icon: GraduationCap },
  { id: 'manga', label: 'มังงะ / คอมิก', icon: Sparkles },
  { id: 'novel', label: 'นิยาย', icon: Wand2 },
  { id: 'research', label: 'งานวิจัย / รายงาน', icon: Newspaper },
  { id: 'other', label: 'อื่น ๆ', icon: Layers },
];

const Onboarding = () => {
  const { user, refresh } = useAuth();
  const [goal, setGoal] = useState('');
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  const finish = async (destination: string) => {
    if (!user || busy) return;
    setBusy(true);
    await supabase.from('profiles').update({ onboarded: true, onboarding_goal: goal || 'other' }).eq('id', user.id);
    await refresh();
    navigate(destination, { replace: true });
  };

  return (
    <div className="min-h-[100dvh] bg-background px-4 py-8">
      <div className="mx-auto w-full max-w-xl">
        <div className="flex items-center gap-2">
          <PetalMark className="h-9 w-9" />
          <span className="font-display text-base font-bold">KIVORA</span>
        </div>
        <h1 className="mt-6 font-display text-2xl font-extrabold">คุณอยากสร้างอะไร?</h1>
        <p className="mt-1 text-sm font-ui text-muted-foreground">เลือก 1 ข้อ เพื่อให้เราจัดหน้าเวิร์กสเปซให้เหมาะกับคุณ</p>

        <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {GOALS.map(g => (
            <button
              key={g.id}
              onClick={() => setGoal(g.id)}
              className={`flex min-h-[84px] flex-col items-start justify-center gap-1.5 rounded-2xl border p-3 text-left transition-colors ${
                goal === g.id ? 'border-primary bg-primary/15' : 'border-border bg-card hover:bg-accent'
              }`}
            >
              <g.icon className={`h-5 w-5 ${goal === g.id ? 'text-primary' : 'text-muted-foreground'}`} />
              <span className="text-xs font-ui font-semibold">{g.label}</span>
            </button>
          ))}
        </div>

        <div className="mt-6 flex flex-col gap-2">
          <button
            disabled={!goal || busy}
            onClick={() => finish('/knowledge')}
            className="flex min-h-12 items-center justify-center rounded-full bg-gradient-ai text-sm font-ui font-bold text-primary-foreground disabled:opacity-50"
          >
            เพิ่มแหล่งข้อมูล
          </button>
          <button
            disabled={!goal || busy}
            onClick={() => finish('/book')}
            className="flex min-h-12 items-center justify-center rounded-full border border-border text-sm font-ui font-bold disabled:opacity-50"
          >
            เริ่มจากไอเดีย
          </button>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
