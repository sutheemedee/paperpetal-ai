import { Heart, Layers, Lock, Sparkles } from 'lucide-react';
import { CATEGORY_LABEL, EXPORT_LABEL, SOURCE_LOCK_LABEL, TemplateDefinition, planRank } from '@/templates/types';

const DIFFICULTY: Record<TemplateDefinition['difficulty'], string> = {
  beginner: 'เริ่มต้น',
  intermediate: 'ปานกลาง',
  advanced: 'ขั้นสูง',
};

export const TemplateBadges = ({ t }: { t: TemplateDefinition }) => (
  <div className="flex flex-wrap gap-1">
    {t.popular && <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-ui font-bold text-primary">POPULAR</span>}
    {t.isNew && <span className="rounded-full bg-secondary/15 px-2 py-0.5 text-[10px] font-ui font-bold text-secondary">NEW</span>}
    {t.featured && <span className="rounded-full bg-highlight/15 px-2 py-0.5 text-[10px] font-ui font-bold text-highlight">RECOMMENDED</span>}
    {t.isPremium && <span className="rounded-full border border-border px-2 py-0.5 text-[10px] font-ui font-bold text-muted-foreground">PRO</span>}
  </div>
);

interface Props {
  template: TemplateDefinition;
  planCode?: string;
  unrestricted?: boolean;
  favorite?: boolean;
  onToggleFavorite?: (id: string) => void;
  onPreview: (t: TemplateDefinition) => void;
  onUse: (t: TemplateDefinition) => void;
  compact?: boolean;
}

const TemplateCard = ({ template: t, planCode, unrestricted, favorite, onToggleFavorite, onPreview, onUse, compact }: Props) => {
  const locked = !unrestricted && planRank(planCode) < planRank(t.minimumPlan);
  const unit = t.contentType === 'presentation' ? 'สไลด์' : 'หน้า';

  return (
    <article
      className={`flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-colors hover:border-primary/50 ${
        compact ? 'w-[240px] shrink-0 snap-start' : ''
      }`}
    >
      <button
        type="button"
        onClick={() => onPreview(t)}
        className={`relative flex h-24 w-full items-end bg-gradient-to-br ${t.thumbnail} p-3 text-left`}
      >
        <span className="rounded-full bg-background/70 px-2 py-0.5 text-[10px] font-ui font-bold uppercase tracking-wide text-foreground backdrop-blur">
          {CATEGORY_LABEL[t.category]}
        </span>
        {onToggleFavorite && (
          <span
            role="button"
            tabIndex={0}
            aria-label="บันทึกเทมเพลต"
            onClick={e => { e.stopPropagation(); onToggleFavorite(t.id); }}
            onKeyDown={e => { if (e.key === 'Enter') { e.stopPropagation(); onToggleFavorite(t.id); } }}
            className="absolute right-2 top-2 flex h-9 w-9 items-center justify-center rounded-full bg-background/70 backdrop-blur"
          >
            <Heart className={`h-4 w-4 ${favorite ? 'fill-secondary text-secondary' : 'text-muted-foreground'}`} />
          </span>
        )}
      </button>

      <div className="flex flex-1 flex-col gap-2 p-3">
        <TemplateBadges t={t} />
        <h3 className="font-display text-sm font-bold leading-tight">{t.name}</h3>
        <p className="line-clamp-2 text-[11px] font-ui text-muted-foreground">{t.description}</p>
        <dl className="grid grid-cols-2 gap-1 text-[10px] font-ui text-muted-foreground">
          <div>≈ {t.defaultPageCount} {unit}</div>
          <div>{DIFFICULTY[t.difficulty]}</div>
          <div className="col-span-2 flex items-center gap-1"><Layers className="h-3 w-3" /> {SOURCE_LOCK_LABEL[t.sourceStrategy.lock]}</div>
          <div className="col-span-2">ส่งออก: {t.exportPreset.map(f => EXPORT_LABEL[f]).join(' · ')}</div>
        </dl>

        <div className="mt-auto flex items-center gap-2 pt-1">
          <button
            type="button"
            onClick={() => onPreview(t)}
            className="press min-h-11 flex-1 rounded-xl border border-border text-[11px] font-ui font-bold"
          >
            PREVIEW
          </button>
          <button
            type="button"
            onClick={() => onUse(t)}
            className={`press min-h-11 flex-1 rounded-xl text-[11px] font-ui font-bold ${
              locked ? 'border border-primary/50 text-primary' : 'bg-gradient-ai text-primary-foreground'
            }`}
          >
            {locked ? (
              <span className="flex items-center justify-center gap-1"><Lock className="h-3 w-3" /> อัปเกรด</span>
            ) : (
              <span className="flex items-center justify-center gap-1"><Sparkles className="h-3 w-3" /> USE TEMPLATE</span>
            )}
          </button>
        </div>
        {locked && (
          <p className="text-[10px] font-ui text-muted-foreground">ใช้ได้กับแผน {t.minimumPlan.toUpperCase()} ขึ้นไป — ดูตัวอย่างได้ฟรี</p>
        )}
      </div>
    </article>
  );
};

export default TemplateCard;
