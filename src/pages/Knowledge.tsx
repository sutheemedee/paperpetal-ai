import { useMemo, useState } from 'react';
import { ChevronDown, Plus, Search, Trash2 } from 'lucide-react';
import AppShell from '@/components/AppShell';
import AddSourceDialog from '@/components/knowledge/AddSourceDialog';
import { useKnowledge } from '@/knowledge/store';
import { KnowledgeSource, SOURCE_FOLDERS, SOURCE_TYPE_LABEL } from '@/knowledge/types';

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

  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          checked={source.enabled}
          onChange={e => updateSource(source.id, { enabled: e.target.checked })}
          className="mt-1 h-4 w-4 accent-[hsl(var(--primary))]"
          aria-label="เปิด/ปิดการใช้แหล่งข้อมูลนี้"
        />
        <div className="min-w-0 flex-1">
          <div className="text-[11px] font-ui font-semibold text-muted-foreground">
            {SOURCE_TYPE_LABEL[source.sourceType]} · {CATEGORY_LABEL[source.category]}
          </div>
          <div className="truncate font-heading text-sm font-bold">{source.title}</div>
          <p className="mt-1 line-clamp-2 text-xs font-body text-muted-foreground">{k.quickSummary}</p>
        </div>
        <button onClick={() => removeSource(source.id)} aria-label="ลบแหล่งข้อมูล" className="text-muted-foreground hover:text-destructive">
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <select
          value={source.role}
          onChange={e => updateSource(source.id, { role: e.target.value as any })}
          className="min-h-8 rounded-full border border-border bg-background px-2 text-[11px] font-ui"
        >
          {Object.entries(ROLE_LABEL).map(([v, l]) => (
            <option key={v} value={v}>{l}</option>
          ))}
        </select>
        <select
          value={source.folder}
          onChange={e => updateSource(source.id, { folder: e.target.value })}
          className="min-h-8 rounded-full border border-border bg-background px-2 text-[11px] font-ui"
        >
          {SOURCE_FOLDERS.map(f => (
            <option key={f} value={f}>{f}</option>
          ))}
        </select>
        <button
          onClick={() => setOpen(o => !o)}
          className="ml-auto flex min-h-8 items-center gap-1 rounded-full border border-border bg-background px-3 text-[11px] font-ui font-semibold"
        >
          รายละเอียด
          <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {source.warnings.length > 0 && (
        <p className="mt-2 rounded-xl bg-secondary p-2 text-[11px] font-ui text-muted-foreground">⚠️ {source.warnings[0]}</p>
      )}

      {open && (
        <div className="mt-3 flex flex-col gap-3 border-t border-border pt-3 text-xs font-body">
          {k.detailedSummary && (
            <section>
              <h4 className="mb-1 font-ui text-[11px] font-bold uppercase text-muted-foreground">สรุปละเอียด</h4>
              <p>{k.detailedSummary}</p>
            </section>
          )}
          {!!k.keyPoints?.length && (
            <section>
              <h4 className="mb-1 font-ui text-[11px] font-bold uppercase text-muted-foreground">ประเด็นสำคัญ</h4>
              <ul className="list-disc pl-4">{k.keyPoints.map((p, i) => <li key={i}>{p}</li>)}</ul>
            </section>
          )}
          {!!k.chapters?.length && (
            <section>
              <h4 className="mb-1 font-ui text-[11px] font-bold uppercase text-muted-foreground">โครงตอน / ช่วงเวลา</h4>
              <ul className="flex flex-col gap-1">
                {k.chapters.map((c, i) => (
                  <li key={i}>
                    <span className="font-ui font-semibold text-primary-foreground/80">{c.location || '-'}</span> {c.heading}
                  </li>
                ))}
              </ul>
            </section>
          )}
          {!!k.chunks?.length && (
            <section>
              <h4 className="mb-1 font-ui text-[11px] font-bold uppercase text-muted-foreground">
                ก้อนความรู้ ({k.chunks.length})
              </h4>
              <ul className="flex flex-col gap-1">
                {k.chunks.slice(0, 8).map((c, i) => (
                  <li key={i} className="rounded-lg bg-secondary p-2">
                    <span className="font-ui text-[10px] font-bold">[{c.location || 'n/a'}]</span> {c.summary || c.content}
                  </li>
                ))}
              </ul>
            </section>
          )}
          {k.reliabilityNote && (
            <p className="text-[11px] font-ui text-muted-foreground">ความน่าเชื่อถือ: {k.reliabilityNote}</p>
          )}
        </div>
      )}
    </div>
  );
};

const Knowledge = () => {
  const { sources, activeSources } = useKnowledge();
  const [addOpen, setAddOpen] = useState(false);
  const [q, setQ] = useState('');
  const [folder, setFolder] = useState('all');

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
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 p-4">
        <div>
          <h1 className="font-heading text-xl font-bold">คลังความรู้ของโปรเจกต์</h1>
          <p className="text-xs font-ui text-muted-foreground">
            อัปโหลดครั้งเดียว ใช้ได้ทั้งหนังสือ พรีเซนเทชัน และงานเขียนทุกแบบ · ใช้งาน {activeSources.length}/{sources.length} แหล่ง
          </p>
        </div>

        <button
          onClick={() => setAddOpen(true)}
          className="flex min-h-12 items-center justify-center gap-2 rounded-full bg-primary text-sm font-ui font-bold text-primary-foreground shadow-md"
        >
          <Plus className="h-4 w-4" />
          เพิ่มแหล่งข้อมูล
        </button>

        <div className="flex gap-2">
          <div className="flex flex-1 items-center gap-2 rounded-full border border-border bg-background px-3">
            <Search className="h-3.5 w-3.5 text-muted-foreground" />
            <input
              value={q}
              onChange={e => setQ(e.target.value)}
              placeholder="ค้นหาแหล่งข้อมูล"
              className="min-h-10 w-full bg-transparent text-sm font-ui focus:outline-none"
            />
          </div>
          <select
            value={folder}
            onChange={e => setFolder(e.target.value)}
            className="min-h-10 rounded-full border border-border bg-background px-3 text-xs font-ui"
          >
            <option value="all">ทุกโฟลเดอร์</option>
            {SOURCE_FOLDERS.map(f => (
              <option key={f} value={f}>{f}</option>
            ))}
          </select>
        </div>

        {filtered.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-border p-8 text-center">
            <p className="font-heading text-base font-bold">ยังไม่มีแหล่งข้อมูล</p>
            <p className="mt-1 text-xs font-ui text-muted-foreground">
              เริ่มด้วยการวางลิงก์ YouTube, ลิงก์เว็บไซต์, อัปโหลด PDF/Word หรือวางโน้ตของคุณ
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filtered.map(s => (
              <SourceCard key={s.id} source={s} />
            ))}
          </div>
        )}
      </div>

      <AddSourceDialog open={addOpen} onOpenChange={setAddOpen} />
    </AppShell>
  );
};

export default Knowledge;
