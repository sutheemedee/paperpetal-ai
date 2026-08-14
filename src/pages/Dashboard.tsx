import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowUpRight, BookOpen, FileDown, FileText, GraduationCap, Layers,
  MessageCircle, Presentation, Sparkles, Wand2,
} from 'lucide-react';
import AppShell from '@/components/AppShell';
import UsageBar from '@/components/account/UsageBar';
import { useAuth } from '@/auth/AuthProvider';
import { useEntitlements } from '@/auth/useEntitlements';
import { useKnowledge } from '@/knowledge/store';
import { supabase } from '@/integrations/supabase/client';

const QUICK_CREATE = [
  { label: 'หนังสือ / eBook', to: '/book', icon: BookOpen },
  { label: 'พรีเซนเทชัน', to: '/present', icon: Presentation },
  { label: 'คู่มือ / Manual', to: '/book', icon: FileText },
  { label: 'มังงะ / คอมิก', to: '/book', icon: Sparkles },
  { label: 'รายงาน / บทความ', to: '/book', icon: Wand2 },
  { label: 'คลังความรู้', to: '/knowledge', icon: Layers },
];

interface ProjectRow { id: string; name: string; kind: string; updated_at: string }

const Dashboard = () => {
  const { profile, account } = useAuth();
  const { usage } = useEntitlements();
  const { sources } = useKnowledge();
  const [projects, setProjects] = useState<ProjectRow[]>([]);
  const [activity, setActivity] = useState<{ id: string; operation: string; quantity: number; created_at: string }[]>([]);

  useEffect(() => {
    supabase
      .from('projects')
      .select('id, name, kind, updated_at')
      .eq('archived', false)
      .order('updated_at', { ascending: false })
      .limit(6)
      .then(({ data }) => setProjects(data ?? []));
    supabase
      .from('usage_ledger')
      .select('id, operation, quantity, created_at')
      .order('created_at', { ascending: false })
      .limit(6)
      .then(({ data }) => setActivity(data ?? []));
  }, []);

  const pages = usage('aiPages');
  const nextReset = account ? new Date(account.periodEnd).toLocaleDateString('th-TH', { day: 'numeric', month: 'long' }) : '—';
  const projectLimit = account?.entitlements?.projects ?? null;

  return (
    <AppShell>
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 p-4 md:gap-5 md:p-6">
        {/* Welcome + plan */}
        <section className="grid gap-3 lg:grid-cols-[1.4fr_1fr]">
          <div className="rounded-3xl border border-border bg-card p-5">
            <p className="text-[11px] font-ui font-bold uppercase tracking-[0.14em] text-muted-foreground">Welcome back</p>
            <h1 className="mt-1 font-display text-2xl font-extrabold leading-tight md:text-3xl">
              สวัสดี {profile?.display_name || 'ครีเอเตอร์'} 👋
            </h1>
            <p className="mt-1 text-sm font-ui text-muted-foreground">
              แผน {account?.planName ?? 'Free Trial'} · โปรเจกต์ {account?.projectCount ?? 0}
              {projectLimit === null ? ' (ไม่จำกัด)' : ` / ${projectLimit}`} · รีเซ็ตสิทธิ์ {nextReset}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link to="/book" className="flex min-h-11 items-center rounded-full bg-gradient-ai px-4 text-xs font-ui font-bold text-primary-foreground">
                สร้างงานใหม่
              </Link>
              <Link to="/knowledge" className="flex min-h-11 items-center rounded-full border border-border px-4 text-xs font-ui font-bold">
                เพิ่มแหล่งข้อมูล
              </Link>
              <Link to="/pricing" className="flex min-h-11 items-center gap-1 rounded-full border border-primary/50 px-4 text-xs font-ui font-bold text-primary">
                อัปเกรดแผน <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>

          <div className="rounded-3xl border border-border bg-card p-5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-ui font-bold uppercase tracking-[0.14em] text-muted-foreground">Usage this month</span>
              <Link to="/billing" className="text-[11px] font-ui font-bold text-primary">ดูบิล</Link>
            </div>
            <div className="mt-3 flex flex-col gap-3">
              <UsageBar metric="aiPages" compact />
              <UsageBar metric="aiImages" compact />
              <UsageBar metric="slides" compact />
              <UsageBar metric="exports" compact />
            </div>
            {pages.ratio >= 0.75 && pages.limit !== null && (
              <Link to="/pricing" className="mt-3 block rounded-xl border border-highlight/40 bg-highlight/10 p-2.5 text-[11px] font-ui text-highlight">
                คุณใช้ไปแล้ว {pages.used} จาก {pages.limit} AI Pages — อัปเกรดเพื่อสิทธิ์เพิ่ม
              </Link>
            )}
          </div>
        </section>

        {/* Quick create */}
        <section>
          <h2 className="mb-2 font-display text-sm font-bold uppercase tracking-wide text-muted-foreground">Quick Create</h2>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
            {QUICK_CREATE.map(q => (
              <Link
                key={q.label}
                to={q.to}
                className="flex min-h-[84px] flex-col justify-center gap-1.5 rounded-2xl border border-border bg-card p-3 transition-colors hover:border-primary/60 hover:bg-accent"
              >
                <q.icon className="h-5 w-5 text-primary" />
                <span className="text-xs font-ui font-semibold leading-tight">{q.label}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* Projects + activity */}
        <section className="grid gap-3 lg:grid-cols-[1.4fr_1fr]">
          <div className="rounded-3xl border border-border bg-card p-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-sm font-bold uppercase tracking-wide text-muted-foreground">Recent Projects</h2>
              <Link to="/projects" className="text-[11px] font-ui font-bold text-primary">ทั้งหมด</Link>
            </div>
            {projects.length === 0 ? (
              <p className="mt-3 text-xs font-ui text-muted-foreground">
                ยังไม่มีโปรเจกต์ที่บันทึกไว้ — สร้างงานใหม่แล้วกดบันทึกใน Write Studio
              </p>
            ) : (
              <ul className="mt-3 flex flex-col gap-2">
                {projects.map(p => (
                  <li key={p.id}>
                    <Link to={`/projects?open=${p.id}`} className="flex min-h-12 items-center justify-between gap-2 rounded-xl border border-border bg-elevated px-3">
                      <span className="min-w-0">
                        <span className="block truncate text-xs font-ui font-bold">{p.name}</span>
                        <span className="text-[11px] font-ui text-muted-foreground">{p.kind}</span>
                      </span>
                      <span className="shrink-0 text-[11px] font-ui text-muted-foreground">
                        {new Date(p.updated_at).toLocaleDateString('th-TH')}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="flex flex-col gap-3">
            <div className="rounded-3xl border border-border bg-card p-4">
              <h2 className="font-display text-sm font-bold uppercase tracking-wide text-muted-foreground">AI Activity</h2>
              {activity.length === 0 ? (
                <p className="mt-2 text-xs font-ui text-muted-foreground">ยังไม่มีการใช้ AI ในรอบบิลนี้</p>
              ) : (
                <ul className="mt-2 flex flex-col gap-1.5">
                  {activity.map(a => (
                    <li key={a.id} className="flex items-center justify-between text-[11px] font-ui">
                      <span className="truncate">{a.operation}</span>
                      <span className="shrink-0 text-muted-foreground">
                        {a.quantity} · {new Date(a.created_at).toLocaleDateString('th-TH')}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Link to="/knowledge" className="rounded-2xl border border-border bg-card p-3">
                <Layers className="h-5 w-5 text-info" />
                <div className="mt-1.5 font-display text-lg font-bold">{sources.length}</div>
                <div className="text-[11px] font-ui text-muted-foreground">แหล่งข้อมูล</div>
              </Link>
              <Link to="/chat" className="rounded-2xl border border-border bg-card p-3">
                <MessageCircle className="h-5 w-5 text-magenta" />
                <div className="mt-1.5 font-display text-lg font-bold">AI Chat</div>
                <div className="text-[11px] font-ui text-muted-foreground">ถามจากแหล่งข้อมูล</div>
              </Link>
              <Link to="/billing" className="rounded-2xl border border-border bg-card p-3">
                <FileDown className="h-5 w-5 text-highlight" />
                <div className="mt-1.5 font-display text-lg font-bold">{account?.exportsToday ?? 0}</div>
                <div className="text-[11px] font-ui text-muted-foreground">ดาวน์โหลดวันนี้</div>
              </Link>
              <Link to="/pricing" className="rounded-2xl border border-border bg-card p-3">
                <GraduationCap className="h-5 w-5 text-success" />
                <div className="mt-1.5 font-display text-lg font-bold">{account?.planName ?? 'Free'}</div>
                <div className="text-[11px] font-ui text-muted-foreground">แผนปัจจุบัน</div>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </AppShell>
  );
};

export default Dashboard;
