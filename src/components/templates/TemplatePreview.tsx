import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CATEGORY_LABEL, CONTENT_TYPE_LABEL, EXPORT_LABEL, SOURCE_LOCK_LABEL, TemplateDefinition, planRank } from '@/templates/types';
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
    <span className="text-xs font-ui">{value}</span>
  </div>
);

const TemplatePreview = ({ template: t, planCode, unrestricted, onClose, onUse }: Props) => {
  if (!t) return null;
  const locked = !unrestricted && planRank(planCode) < planRank(t.minimumPlan);
  const unit = t.contentType === 'presentation' ? 'สไลด์' : 'หน้า';

  return (
    <Dialog open onOpenChange={open => !open && onClose()}>
      <DialogContent className="max-h-[92vh] w-[96vw] max-w-2xl overflow-y-auto p-0">
        <div className={`h-28 w-full bg-gradient-to-br ${t.thumbnail}`} />
        <div className="flex flex-col gap-3 p-4 pb-6">
          <DialogHeader className="space-y-1 text-left">
            <TemplateBadges t={t} />
            <DialogTitle className="font-display text-lg font-extrabold">{t.name}</DialogTitle>
            <p className="text-xs font-ui text-muted-foreground">{t.description}</p>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-2">
            <Row label="ประเภทผลงาน" value={CONTENT_TYPE_LABEL[t.contentType]} />
            <Row label="หมวด" value={CATEGORY_LABEL[t.category]} />
            <Row label="กลุ่มผู้อ่าน" value={t.targetAudience} />
            <Row label="ขนาดเริ่มต้น" value={`≈ ${t.defaultPageCount} ${unit} · ${t.defaultChapterCount} บท`} />
            <Row label="แหล่งข้อมูล" value={`${SOURCE_LOCK_LABEL[t.sourceStrategy.lock]} · แนะนำ ${t.sourceStrategy.recommendedSources} แหล่ง`} />
            <Row label="ส่งออก" value={t.exportPreset.map(f => EXPORT_LABEL[f]).join(' · ')} />
            <Row label="โทนการเขียน" value={`${t.writingDNA.tone} · ระดับ ${t.writingDNA.technicalLevel}`} />
            <Row label="สไตล์ภาพ" value={`${t.visualDNA.imageStyle} · ความหนาแน่น ${t.visualDNA.imageDensity}`} />
          </div>

          <section>
            <h3 className="mb-1 text-[11px] font-ui font-bold uppercase tracking-wide text-muted-foreground">โครงสร้าง</h3>
            <ol className="flex flex-col gap-1">
              {t.structureDNA.sections.map(s => (
                <li key={s.label} className="flex items-center justify-between rounded-xl border border-border px-3 py-2 text-xs font-ui">
                  <span>{s.label}</span>
                  <span className="text-muted-foreground">{s.share}%</span>
                </li>
              ))}
            </ol>
            {t.structureDNA.engines && (
              <p className="mt-2 text-[11px] font-ui text-muted-foreground">
                เปิดใช้อัตโนมัติ: {t.structureDNA.engines.join(' · ')}
              </p>
            )}
          </section>

          <section className="rounded-xl border border-border bg-surface p-3 text-[11px] font-ui text-muted-foreground">
            <p><strong className="text-foreground">ตัวอย่างผลลัพธ์:</strong> {t.coverPreview.join(' → ')}</p>
            <p className="mt-1"><strong className="text-foreground">ภาพประกอบ:</strong> {t.imageStrategy}</p>
            <p className="mt-1"><strong className="text-foreground">การอ้างอิง:</strong> {t.citationStrategy}</p>
            <p className="mt-1"><strong className="text-foreground">ประมาณการใช้งาน AI:</strong> ≈ {t.defaultPageCount} AI Pages · ≈ {Math.max(2, Math.round(t.defaultPageCount * 0.25))} ภาพ</p>
          </section>

          <button
            type="button"
            onClick={() => onUse(t)}
            className={`press min-h-12 w-full rounded-xl text-sm font-ui font-bold ${
              locked ? 'border border-primary/60 text-primary' : 'bg-gradient-ai text-primary-foreground'
            }`}
          >
            {locked ? `ใช้ได้กับแผน ${t.minimumPlan.toUpperCase()} — อัปเกรด` : 'USE THIS TEMPLATE'}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TemplatePreview;
