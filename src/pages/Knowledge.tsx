import { useMemo, useState } from 'react';
import {
  ChevronDown,
  ClipboardType,
  FileUp,
  Globe,
  LucideIcon,
  Plus,
  Search,
  Trash2,
  Youtube,
} from 'lucide-react';
import AppShell from '@/components/AppShell';
import AddSourceDialog from '@/components/knowledge/AddSourceDialog';
import { useKnowledge } from '@/knowledge/store';
import { KnowledgeSource, SOURCE_FOLDERS, SOURCE_TYPE_LABEL, SourceType } from '@/knowledge/types';

const ROLE_LABEL: Record<string, string> = {
  primary: 'แหล่งหลัก',
  supporting: 'แหล่งสนับสนุน',
  creative: 'อ้างอิงเชิงสร้างสรรค์',
};

const CATEGORY_LABEL: Record<string, string> = {
  official: 'ทางการ',
  academic: 'วิชาการ',
  professional: 'มืออาชีพ',
  news: 'ข่าว',
  community: 'ชุมชน',
  personal: 'โน้ตส่วนตัว',
  unknown: 'ไม่ทราบ',
};

const SourceCard = ({ source }: { source: KnowledgeSource }) => {
  const { updateSource, removeSource } = useKnowledge();
  const [open, setOpen] = useState(false);
  const k = source.knowledge;
  const ready = !!k?.quickSummary;

  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          checked={source.enabled}
          onChange={e => updateSource(source.id, { enabled: e.target.checked })}
          className="mt-1 h-5 w-5 shrink-0 accent-[hsl(var(--primary))]"
          aria-label="เปิด/ปิดการใช้แหล่งข้อมูลนี้"
        />
        <div className="min-w-0 flex-1">
          <div className="text-xs font-ui font-semibold text-muted-foreground">
            {SOURCE_TYPE_LABEL[source.sourceType]} · {CATEGORY_LABEL[source.category]} ·{' '}
            <span className={ready ? 'text-foreground' : ''}>{ready ? 'พร้อมใช้ ✓' : 'กำลังประมวลผล...'}</span>
          </div>
          <div className="break-words font-heading text-base font-bold">{source.title}</div>
          <p className="mt-1 line-clamp-3 text-sm font-body text-muted-foreground">{k.quickSummary}</p>
        </div>
        <button
          onClick={() => removeSource(source.id)}
          aria-label="ลบแหล่งข้อมูล"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:text-destructive"
        >
          <Trash2 className="h-5 w-5" />
        </button>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <select
          value={source.role}
          onChange={e => updateSource(source.id, { role: e.target.value as any })}
          aria-label="บทบาทแหล่งข้อมูล"
          className="min-h-11 rounded-full border border-border bg-background px-3 text-sm font-ui"
        >
          {Object.entries(ROLE_LABEL).map(([v, l]) => (
            <option key={v} value={v}>{l}</option>
          ))}
        </select>
        <select
          value={source.folder}
          onChange={e => updateSource(source.id, { folder: e.target.value })}
          aria-label="โฟลเดอร์"
          className="min-h-11 rounded-full border border-border bg-background px-3 text-sm font-ui"
        >
          {SOURCE_FOLDERS.map(f => (
            <option key={f} value={f}>{f}</option>
          ))}
        </select>
        <button
          onClick={() => setOpen(o => !o)}
          className="ml-auto flex min-h-11 items-center gap-1 rounded-full border border-border bg-background px-4 text-sm font-ui font-semibold"
        >
          รายละเอียด
          <ChevronDown className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {source.warnings.length > 0 && (
        <p className="mt-2 rounded-xl bg-secondary p-2 text-sm font-ui text-muted-foreground">⚠️ {source.warnings[0]}</p>
      )}

      {open && (
        <div className="mt-3 flex flex-col gap-3 border-t border-border pt-3 text-sm font-body">
          {k.detailedSummary && (
            <section>
              <h4 className="mb-1 font-ui text-xs font-bold uppercase text-muted-foreground">สรุปละเอียด</h4>
              <p>{k.detailedSummary}</p>
            </section>
          )}
          {!!k.keyPoints?.length && (
            <section>
              <h4 className="mb-1 font-ui text-xs font-bold uppercase text-muted-foreground">ประเด็นสำคัญ</h4>
              <ul className="list-disc pl-4">{k.keyPoints.map((p, i) => <li key={i}>{p}</li>)}</ul>
            </section>
          )}
          {!!k.chapters?.length && (
            <section>
              <h4 className="mb-1 font-ui text-xs font-bold uppercase text-muted-foreground">โครงตอน / ช่วงเวลา</h4>
              <ul className="flex flex-col gap-1">
                {k.chapters.map((c, i) => (
                  <li key={i}>
                    <span className="font-ui font-semibold">{c.location || '-'}</span> {c.heading}
                  </li>
                ))}
              </ul>
            </section>
          )}
          {!!k.chunks?.length && (
            <section>
              <h4 className="mb-1 font-ui text-xs font-bold uppercase text-muted-foreground">
                ก้อนความรู้ ({k.chunks.length})
              </h4>
              <ul className="flex flex-col gap-1">
                {k.chunks.slice(0, 8).map((c, i) => (
                  <li key={i} className="rounded-lg bg-secondary p-2">
                    <span className="font-ui text-xs font-bold">[{c.location || 'n/a'}]</span> {c.summary || c.content}
                  </li>
                ))}
              </ul>
            </section>
          )}
          {k.reliabilityNote && (
            <p className="text-sm font-ui text-muted-foreground">ความน่าเชื่อถือ: {k.reliabilityNote}</p>
          )}
        </div>
      )}
    </div>
  );
};

const SOURCE_TILES: { type: SourceType; label: string; hint: string; icon: LucideIcon }[] = [
  { type: 'youtube', label: 'YouTube', hint: 'ลิงก์วิดีโอ + ทรานสคริปต์', icon: Youtube },
  { type: 'website', label: 'เว็บไซต์', hint: 'บทความ / บล็อก / ข่าว', icon: Globe },
  { type: 'txt', label: 'อัปโหลดไฟล์', hint: 'PDF · DOCX · TXT', icon: FileUp },
  { type: 'text', label: 'วางข้อความ', hint: 'โน้ต / งานวิจัยของคุณ', icon: ClipboardType },
];

const Knowledge = () => {
  const { sources, activeSources } = useKnowledge();
  const [addOpen, setAddOpen] = useState(false);
  const [addType, setAddType] = useState<SourceType>('youtube');
  const [q, setQ] = useState('');
  const [folder, setFolder] = useState('all');

  const openAdd = (type: SourceType) => {
    setAddType(type);
    setAddOpen(true);
  };

  const filtered = useMemo(
    () =>
      sources.filter(
        s =>
          (folder === 'all' || s.folder === folder) &&
          (!q || s.title.toLowerCase().includes(q.toLowerCase())),
      ),
    [sources, q, folder],
  );

  return (
    <AppShell title="Source Studio">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-5 px-4 py-4 md:px-6 md:py-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-[11px] font-ui font-bold uppercase tracking-[0.14em] text-muted-foreground">
              Knowledge Workspace
            </p>
            <h1 className="mt-1 font-display text-2xl font-extrabold leading-tight md:text-3xl">คลังความรู้ของโปรเจกต์</h1>
            <p className="mt-1 text-sm font-ui text-muted-foreground">
              อัปโหลดครั้งเดียว ใช้ได้ทั้งหนังสือ พรีเซนเทชัน และงานเขียนทุกแบบ
            </p>
          </div>
          <span className="rounded-full border border-border bg-elevated px-3 py-1.5 text-[11px] font-ui font-bold text-muted-foreground">
            ใช้งาน {activeSources.length} / {sources.length} แหล่ง
          </span>
        </div>

        {/* Source type tiles */}
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {SOURCE_TILES.map(t => (
            <button
              key={t.type}
              onClick={() => openAdd(t.type)}
              className="press group flex min-h-[92px] flex-col justify-center gap-1.5 rounded-2xl border border-border bg-card p-3 text-left transition-colors hover:border-primary/60 hover:bg-surface-hover"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-paperpetal text-primary-foreground">
                <t.icon className="h-4 w-4" />
              </span>
              <span className="font-ui text-sm font-bold">{t.label}</span>
              <span className="text-[11px] font-ui text-muted-foreground">{t.hint}</span>
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="flex flex-1 items-center gap-2 rounded-xl border border-border bg-elevated px-3">
            <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
            <input
              value={q}
              onChange={e => setQ(e.target.value)}
              placeholder="ค้นหาแหล่งข้อมูล"
              className="min-h-11 w-full bg-transparent text-base font-ui focus:outline-none md:text-sm"
            />
          </div>
          <select
            value={folder}
            onChange={e => setFolder(e.target.value)}
            aria-label="โฟลเดอร์"
            className="min-h-11 rounded-xl border border-border bg-elevated px-3 text-sm font-ui"
          >
            <option value="all">ทุกโฟลเดอร์</option>
            {SOURCE_FOLDERS.map(f => (
              <option key={f} value={f}>{f}</option>
            ))}
          </select>
          <button
            onClick={() => openAdd('youtube')}
            className="press flex min-h-11 items-center justify-center gap-2 rounded-xl bg-gradient-paperpetal px-4 text-sm font-ui font-bold text-primary-foreground shadow-[var(--shadow-glow)]"
          >
            <Plus className="h-4 w-4" /> เพิ่มแหล่งข้อมูล
          </button>
        </div>

        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-strong bg-card/60 p-8 text-center">
            <p className="font-display text-base font-bold">ยังไม่มีแหล่งข้อมูล</p>
            <p className="mt-1 text-sm font-ui text-muted-foreground">
              เริ่มด้วยการวางลิงก์ YouTube, ลิงก์เว็บไซต์, อัปโหลด PDF/Word หรือวางโน้ตของคุณ
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
            {filtered.map(s => (
              <SourceCard key={s.id} source={s} />
            ))}
          </div>
        )}
      </div>

      <AddSourceDialog open={addOpen} onOpenChange={setAddOpen} initialType={addType} />
    </AppShell>
  );
};

export default Knowledge;
