import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { Archive, BookOpen, Loader2, Presentation, Trash2 } from 'lucide-react';
import AppShell from '@/components/AppShell';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/auth/AuthProvider';

interface ProjectRow {
  id: string;
  name: string;
  kind: string;
  archived: boolean;
  updated_at: string;
}

const Projects = () => {
  const { account, refresh, isAdmin } = useAuth();
  const [rows, setRows] = useState<ProjectRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showArchived, setShowArchived] = useState(false);

  const load = async () => {
    const { data } = await supabase
      .from('projects')
      .select('id, name, kind, archived, updated_at')
      .order('updated_at', { ascending: false });
    setRows((data as ProjectRow[]) ?? []);
    setLoading(false);
  };
  useEffect(() => {
    load();
  }, []);

  const toggleArchive = async (row: ProjectRow) => {
    await supabase.from('projects').update({ archived: !row.archived }).eq('id', row.id);
    await load();
    await refresh();
  };

  const remove = async (row: ProjectRow) => {
    if (!window.confirm(`ลบโปรเจกต์ "${row.name}" ถาวร?`)) return;
    await supabase.from('projects').delete().eq('id', row.id);
    toast.success('ลบโปรเจกต์แล้ว');
    await load();
    await refresh();
  };

  const visible = rows.filter(r => r.archived === showArchived);
  const unrestricted = isAdmin || account?.planCode === 'unlimited';
  const limit = unrestricted ? null : (account?.entitlements?.projects ?? null);

  return (
    <AppShell title="โปรเจกต์ของฉัน">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-4 p-4 md:p-6">
        <section className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-xl font-extrabold md:text-2xl">โปรเจกต์ของฉัน</h1>
            <p className="text-xs font-ui text-muted-foreground">
              ใช้ไป {rows.filter(r => !r.archived).length}
              {limit === null ? ' โปรเจกต์ / ∞ (ไม่จำกัด)' : ` / ${limit} โปรเจกต์`}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowArchived(v => !v)}
              className="flex min-h-11 items-center rounded-full border border-border px-4 text-xs font-ui font-bold"
            >
              {showArchived ? 'ดูโปรเจกต์ที่ใช้งาน' : 'ดูที่เก็บถาวร'}
            </button>
            <Link to="/book" className="flex min-h-11 items-center rounded-full bg-gradient-ai px-4 text-xs font-ui font-bold text-primary-foreground">
              สร้างใหม่
            </Link>
          </div>
        </section>

        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
          </div>
        ) : visible.length === 0 ? (
          <p className="rounded-2xl border border-border bg-card p-5 text-sm font-ui text-muted-foreground">
            {showArchived ? 'ไม่มีโปรเจกต์ในที่เก็บถาวร' : 'ยังไม่มีโปรเจกต์ — เริ่มสร้างหนังสือหรือพรีเซนเทชันแล้วกดบันทึกโปรเจกต์'}
          </p>
        ) : (
          <ul className="grid gap-2 sm:grid-cols-2">
            {visible.map(r => (
              <li key={r.id} className="flex flex-col gap-2 rounded-2xl border border-border bg-card p-4">
                <div className="flex items-start gap-2">
                  {r.kind === 'presentation' ? (
                    <Presentation className="h-5 w-5 shrink-0 text-magenta" />
                  ) : (
                    <BookOpen className="h-5 w-5 shrink-0 text-primary" />
                  )}
                  <div className="min-w-0">
                    <div className="truncate font-display text-sm font-bold">{r.name}</div>
                    <div className="text-[11px] font-ui text-muted-foreground">
                      {r.kind} · แก้ไข {new Date(r.updated_at).toLocaleDateString('th-TH')}
                    </div>
                  </div>
                </div>
                <div className="mt-auto flex gap-2">
                  <Link
                    to={`${r.kind === 'presentation' ? '/present' : '/book'}?project=${encodeURIComponent(r.id)}`}
                    className="flex min-h-11 flex-1 items-center justify-center rounded-full border border-border text-xs font-ui font-bold"
                  >
                    เปิด
                  </Link>
                  <button onClick={() => toggleArchive(r)} aria-label="เก็บถาวร" className="flex h-11 w-11 items-center justify-center rounded-full border border-border">
                    <Archive className="h-4 w-4" />
                  </button>
                  <button onClick={() => remove(r)} aria-label="ลบ" className="flex h-11 w-11 items-center justify-center rounded-full border border-destructive/40 text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </AppShell>
  );
};

export default Projects;
