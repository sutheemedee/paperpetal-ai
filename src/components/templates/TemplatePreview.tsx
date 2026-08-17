import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Lock, Sparkles } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CATEGORY_LABEL, CONTENT_TYPE_LABEL, EXPORT_LABEL, SOURCE_LOCK_LABEL, TemplateDefinition, planRank } from '@/templates/types';
import { designDefaultsFor, previewPagesFor, themeById } from '@/templates/visualPreview';
import { TemplateBadges } from './TemplateCard';

interface Props {
  template: TemplateDefinition | null;
  planCode?: string;
  unrestricted?: boolean;
  onClose: () => void;
  onUse: (t: TemplateDefinition) => void;
}

const Row = ({ label, value }: { label: string; value: string }) => (
  <div className="flex flex-col gap-0.5 rounded-xl border border-border bg-surface p-2.5">
    <span className="text-[10px] font-ui font-bold uppercase tracking-wide text-muted-foreground">{label}</span>
    <span className="text-xs font-ui leading-relaxed">{value}</span>
  </div>
);

const PageMock = ({ template, pageIndex }: { template: TemplateDefinition; pageIndex: number }) => {
  const defaults = designDefaultsFor(template);
  const theme = themeById(defaults.themeId);
  const pages = previewPagesFor(template);
  const page = pages[pageIndex] ?? pages[0];
  const isDeck = template.contentType === 'presentation';

  return (
    <div className="flex min-h-[360px] items-center justify-center rounded-2xl border border-border bg-surface p-4">
      <div className={`${isDeck ? 'aspect-video w-full max-w-xl' : 'aspect-[3/4] w-full max-w-[260px]'} overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br ${theme.bg} p-5 shadow-2xl`}>
        <div className="flex h-full flex-col text-white">
          <span className="text-[10px] font-ui font-bold uppercase tracking-[0.18em] text-white/60">{page.eyebrow}</span>
          <h3 className={`${isDeck ? 'mt-8 text-3xl' : 'mt-10 text-2xl'} font-heading font-extrabold leading-tight`}>{page.title}</h3>
          <p className="mt-3 max-w-sm text-xs font-body leading-relaxed text-white/76">{page.body}</p>
          <div className={`mt-5 grid ${isDeck ? 'grid-cols-2' : 'grid-cols-1'} gap-2`}>
            {page.bullets.slice(0, isDeck ? 4 : 5).map(item => (
              <div key={item} className="rounded-lg border border-white/12 bg-black/20 px-3 py-2 text-[10px] font-ui leading-relaxed text-white/80">
                {item}
              </div>
            ))}
          </div>
          <div className="mt-auto flex items-end justify-between">
            <span className="h-1.5 w-16 rounded-full" style={{ backgroundColor: theme.accent }} />
            <span className="text-[10px] font-ui text-white/50">{pageIndex + 1}/{pages.length}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const TemplatePreview = ({ template: t, planCode, unrestricted, onClose, onUse }: Props) => {
  const [pageIndex, setPageIndex] = useState(0);
  const pages = useMemo(() => (t ? previewPagesFor(t) : []), [t]);
  if (!t) return null;

  const locked = !unrestricted && planRank(planCode) < planRank(t.minimumPlan);
  const unit = t.contentType === 'presentation' ? 'สไลด์' : 'หน้า';

  return (
    <Dialog open onOpenChange={open => !open && onClose()}>
      <DialogContent className="max-h-[92vh] w-[96vw] max-w-5xl overflow-y-auto p-0">
        <div className="grid gap-0 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="border-b border-border p-4 lg:border-b-0 lg:border-r">
            <PageMock template={t} pageIndex={pageIndex} />
            <div className="mt-3 flex items-center justify-between gap-2">
              <button type="button" onClick={() => setPageIndex(i => Math.max(0, i - 1))} disabled={pageIndex === 0} className="flex min-h-10 items-center gap-2 rounded-xl border border-border px-3 text-xs font-ui font-bold disabled:opacity-40">
                <ChevronLeft className="h-4 w-4" /> ก่อนหน้า
              </button>
              <div className="flex gap-1">
                {pages.map((p, i) => (
                  <button key={p.title} aria-label={`preview page ${i + 1}`} onClick={() => setPageIndex(i)} className={`h-2.5 w-2.5 rounded-full ${i === pageIndex ? 'bg-primary' : 'bg-border'}`} />
                ))}
              </div>
              <button type="button" onClick={() => setPageIndex(i => Math.min(pages.length - 1, i + 1))} disabled={pageIndex === pages.length - 1} className="flex min-h-10 items-center gap-2 rounded-xl border border-border px-3 text-xs font-ui font-bold disabled:opacity-40">
                ถัดไป <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-3 p-4 pb-6">
            <DialogHeader className="space-y-1 text-left">
              <TemplateBadges t={t} />
              <DialogTitle className="font-heading text-xl font-extrabold leading-snug">{t.name}</DialogTitle>
              <p className="text-xs font-ui leading-relaxed text-muted-foreground">{t.description}</p>
            </DialogHeader>

            <div className="grid grid-cols-2 gap-2">
              <Row label="ประเภท" value={CONTENT_TYPE_LABEL[t.contentType]} />
              <Row label="หมวด" value={CATEGORY_LABEL[t.category]} />
              <Row label="ผู้อ่าน" value={t.targetAudience} />
              <Row label="ขนาด" value={`≈ ${t.defaultPageCount} ${unit} · ${t.defaultChapterCount} บท`} />
              <Row label="แหล่งข้อมูล" value={`${SOURCE_LOCK_LABEL[t.sourceStrategy.lock]} · แนะนำ ${t.sourceStrategy.recommendedSources} แหล่ง`} />
              <Row label="ส่งออก" value={t.exportPreset.map(f => EXPORT_LABEL[f]).join(' · ')} />
            </div>

            <section className="rounded-xl border border-border bg-surface p-3">
              <h3 className="text-[11px] font-ui font-bold uppercase tracking-wide text-muted-foreground">โครงสร้างงาน</h3>
              <ol className="mt-2 flex flex-col gap-1">
                {t.structureDNA.sections.map(s => (
                  <li key={s.label} className="flex items-center justify-between rounded-lg bg-card px-3 py-2 text-xs font-ui">
                    <span>{s.label}</span>
                    <span className="text-muted-foreground">{s.share}%</span>
                  </li>
                ))}
              </ol>
            </section>

            <section className="rounded-xl border border-border bg-surface p-3 text-[11px] font-ui leading-relaxed text-muted-foreground">
              <p><strong className="text-foreground">ภาพประกอบ:</strong> {t.imageStrategy}</p>
              <p className="mt-1"><strong className="text-foreground">การอ้างอิง:</strong> {t.citationStrategy}</p>
              <p className="mt-1"><strong className="text-foreground">ใช้ AI โดยประมาณ:</strong> ≈ {t.defaultPageCount} AI Pages · ≈ {Math.max(2, Math.round(t.defaultPageCount * 0.25))} ภาพ</p>
            </section>

            <button
              type="button"
              onClick={() => onUse(t)}
              className={`press mt-auto flex min-h-12 w-full items-center justify-center gap-2 rounded-xl text-sm font-ui font-bold ${locked ? 'border border-primary/60 text-primary' : 'bg-gradient-ai text-primary-foreground'}`}
            >
              {locked ? <><Lock className="h-4 w-4" /> ใช้ได้กับแผน {t.minimumPlan.toUpperCase()} ขึ้นไป</> : <><Sparkles className="h-4 w-4" /> ใช้เทมเพลตนี้</>}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TemplatePreview;
