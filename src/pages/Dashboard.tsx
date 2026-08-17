import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowUpRight,
  BookOpen,
  FileDown,
  FileText,
  GraduationCap,
  Images,
  Layers,
  MessageCircle,
  MoreHorizontal,
  Presentation,
  Sparkles,
  Wand2,
} from 'lucide-react';
import AppShell from '@/components/AppShell';
import UsageBar from '@/components/account/UsageBar';
import { useAuth } from '@/auth/AuthProvider';
import { useEntitlements } from '@/auth/useEntitlements';
import { useKnowledge } from '@/knowledge/store';
import { supabase } from '@/integrations/supabase/client';

const QUICK_CREATE = [
  { label: 'Book', detail: 'หนังสือ / eBook', to: '/create?category=book', icon: BookOpen },
  { label: 'Present', detail: 'สไลด์นำเสนอ', to: '/create?category=presentation', icon: Presentation },
  { label: 'Manual', detail: 'คู่มือ / SOP', to: '/create?category=manual', icon: FileText },
  { label: 'Research', detail: 'รายงาน / วิจัย', to: '/create?category=report', icon: Wand2 },
  { label: 'Manga', detail: 'คอมิก / ภาพเล่าเรื่อง', to: '/create?category=manga', icon: Sparkles },
  { label: 'Sources', detail: 'เพิ่มความรู้', to: '/knowledge', icon: Layers },
];

const PROJECT_GRADIENTS = [
  'from-[#1E3A8A] via-[#4C1D95] to-[#0E7490]',
  'from-[#4C1D95] via-[#7C3AED] to-[#DB2777]',
  'from-[#0F172A] via-[#1D4ED8] to-[#06B6D4]',
  'from-[#111827] via-[#312E81] to-[#7C2D12]',
];

interface ProjectRow {
  id: string;
  name: string;
  kind: string;
  cover_url?: string | null;
  updated_at: string;
}

const Dashboard = () => {
  const { profile, account, isAdmin } = useAuth();
  const { usage, unrestricted } = useEntitlements();
  const { sources } = useKnowledge();
  const [projects, setProjects] = useState<ProjectRow[]>([]);
  const [activity, setActivity] = useState<{ id: string; operation: string; quantity: number; created_at: string }[]>([]);

  useEffect(() => {
    supabase
      .from('projects')
      .select('id, name, kind, cover_url, updated_at')
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
  const images = usage('aiImages');
  const slides = usage('slides');
  const exports = usage('exports');
  const projectLimit = unrestricted || isAdmin || account?.planCode === 'unlimited' ? null : (account?.entitlements?.projects ?? null);

  const stats = [
    { label: 'Projects', value: account?.projectCount ?? projects.length, helper: projectLimit === null ? 'ไม่จำกัด' : `จาก ${projectLimit}`, icon: Images },
    { label: 'AI Pages', value: pages.used, helper: pages.unlimited ? 'ไม่จำกัด' : pages.limit === null ? 'พร้อมใช้' : `จาก ${pages.limit}`, icon: FileText },
    { label: 'Sources', value: sources.length, helper: 'คลังความรู้', icon: Layers },
    { label: 'Exports', value: account?.exportsToday ?? 0, helper: exports.unlimited ? 'ไม่จำกัด' : 'วันนี้', icon: FileDown },
  ];

  return (
    <AppShell>
      <div className="mx-auto grid w-full max-w-7xl gap-4 p-4 md:p-6 xl:grid-cols-[1fr_340px]">
        <div className="flex min-w-0 flex-col gap-4">
          <section className="flex flex-col justify-between gap-4 rounded-2xl border border-border bg-card p-5 md:flex-row md:items-end">
            <div>
              <p className="text-[11px] font-ui font-bold uppercase tracking-[0.16em] text-muted-foreground">Dashboard</p>
              <h1 className="mt-1 font-display text-2xl font-extrabold md:text-3xl">
                Welcome back, {profile?.display_name || 'Creator'}
              </h1>
              <p className="mt-1 text-sm font-ui text-muted-foreground">
                {account?.planName ?? 'Free Trial'} · KIVORA workspace สำหรับเปลี่ยนความรู้เป็นผลงาน
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link to="/create" className="press flex min-h-10 items-center gap-2 rounded-xl bg-gradient-ai px-4 text-xs font-ui font-bold text-primary-foreground">
                <Sparkles className="h-4 w-4" /> New Project
              </Link>
              <Link to="/knowledge" className="press flex min-h-10 items-center rounded-xl border border-border px-4 text-xs font-ui font-bold">
                Add Source
              </Link>
            </div>
          </section>

          <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map(stat => (
              <Link key={stat.label} to={stat.label === 'Sources' ? '/knowledge' : stat.label === 'Exports' ? '/billing' : '/projects'} className="rounded-2xl border border-border bg-card p-4 hover:border-primary/45">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs font-ui font-bold text-muted-foreground">{stat.label}</span>
                  <stat.icon className="h-4 w-4 text-primary" />
                </div>
                <div className="mt-3 font-display text-2xl font-extrabold tabular-nums">{Number(stat.value).toLocaleString()}</div>
                <div className="mt-1 text-[11px] font-ui text-success">+ พร้อมสร้างต่อ · {stat.helper}</div>
              </Link>
            ))}
          </section>

          <section className="grid gap-4 lg:grid-cols-[1.35fr_0.9fr]">
            <div className="rounded-2xl border border-border bg-card p-4">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="font-display text-sm font-bold">Recent Projects</h2>
                <Link to="/projects" className="text-[11px] font-ui font-bold text-primary">View all</Link>
              </div>

              {projects.length === 0 ? (
                <div className="rounded-xl border border-border bg-surface p-5 text-sm font-ui text-muted-foreground">
                  ยังไม่มีโปรเจกต์ที่บันทึกไว้ เริ่มสร้างจาก AI Director แล้วกดบันทึกเป็นโปรเจกต์
                </div>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {projects.map((p, i) => (
                    <Link key={p.id} to={`/projects?open=${p.id}`} className="group overflow-hidden rounded-xl border border-border bg-surface hover:border-primary/50">
                      <div className={`aspect-[16/9] bg-gradient-to-br ${PROJECT_GRADIENTS[i % PROJECT_GRADIENTS.length]}`}>
                        {p.cover_url ? <img src={p.cover_url} alt="" className="h-full w-full object-cover" loading="lazy" /> : null}
                      </div>
                      <div className="p-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <h3 className="truncate font-display text-sm font-bold">{p.name}</h3>
                            <p className="mt-0.5 text-[11px] font-ui text-muted-foreground">
                              {p.kind} · {new Date(p.updated_at).toLocaleDateString('th-TH')}
                            </p>
                          </div>
                          <MoreHorizontal className="h-4 w-4 shrink-0 text-muted-foreground" />
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-2xl border border-border bg-card p-4">
              <h2 className="font-display text-sm font-bold">Usage</h2>
              <div className="mt-3 flex flex-col gap-3">
                <UsageBar metric="aiPages" compact />
                <UsageBar metric="aiImages" compact />
                <UsageBar metric="slides" compact />
                <UsageBar metric="exports" compact />
              </div>
              {pages.ratio >= 0.75 && pages.limit !== null && (
                <Link to="/pricing" className="mt-3 block rounded-xl border border-highlight/40 bg-highlight/10 p-2.5 text-[11px] font-ui text-highlight">
                  ใช้ AI Pages ไปแล้ว {Math.round(pages.ratio * 100)}% · อัปเกรดเพื่อโควตาเพิ่ม
                </Link>
              )}
            </div>
          </section>

          <section>
            <h2 className="mb-2 font-display text-sm font-bold text-muted-foreground">Quick Create</h2>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
              {QUICK_CREATE.map(q => (
                <Link key={q.label} to={q.to} className="rounded-2xl border border-border bg-card p-3 hover:border-primary/50">
                  <q.icon className="h-5 w-5 text-primary" />
                  <div className="mt-2 text-xs font-ui font-bold">{q.label}</div>
                  <div className="mt-0.5 text-[11px] font-ui text-muted-foreground">{q.detail}</div>
                </Link>
              ))}
            </div>
          </section>
        </div>

        <aside className="flex flex-col gap-4">
          <section className="rounded-2xl border border-border bg-card p-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-sm font-bold">AI Director</h2>
              <MessageCircle className="h-4 w-4 text-primary" />
            </div>
            <p className="mt-3 text-xs font-ui text-muted-foreground">วันนี้อยากให้ KIVORA ช่วยสร้างอะไร?</p>
            <Link to="/create" className="mt-3 block rounded-xl border border-border bg-surface px-3 py-3 text-xs font-ui text-muted-foreground hover:border-primary/50">
              Ask anything...
            </Link>
            <div className="mt-3 grid gap-2">
              <Link to="/create?category=book" className="rounded-xl border border-border px-3 py-2 text-[11px] font-ui font-bold hover:bg-surface">Write a book about...</Link>
              <Link to="/create?category=presentation" className="rounded-xl border border-border px-3 py-2 text-[11px] font-ui font-bold hover:bg-surface">Create a presentation on...</Link>
              <Link to="/create?category=report" className="rounded-xl border border-border px-3 py-2 text-[11px] font-ui font-bold hover:bg-surface">Summarize this research</Link>
            </div>
            <Link to="/create" className="mt-4 flex min-h-10 items-center justify-center gap-2 rounded-xl bg-gradient-ai text-xs font-ui font-bold text-primary-foreground">
              Apply AI <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </section>

          <section className="rounded-2xl border border-border bg-card p-4">
            <h2 className="font-display text-sm font-bold">AI Activity</h2>
            {activity.length === 0 ? (
              <p className="mt-2 text-xs font-ui text-muted-foreground">ยังไม่มีการใช้ AI ในรอบบิลนี้</p>
            ) : (
              <ul className="mt-3 flex flex-col gap-2">
                {activity.map(a => (
                  <li key={a.id} className="rounded-xl border border-border bg-surface px-3 py-2">
                    <div className="truncate text-xs font-ui font-bold">{a.operation}</div>
                    <div className="mt-0.5 text-[11px] font-ui text-muted-foreground">
                      {a.quantity} · {new Date(a.created_at).toLocaleDateString('th-TH')}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </aside>
      </div>
    </AppShell>
  );
};

export default Dashboard;
