import { Heart, Layers, Lock, Sparkles } from 'lucide-react';
import { CATEGORY_LABEL, EXPORT_LABEL, SOURCE_LOCK_LABEL, TemplateDefinition, planRank } from '@/templates/types';
import { designDefaultsFor, previewPagesFor, themeById } from '@/templates/visualPreview';

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

const MiniPreview = ({ template }: { template: TemplateDefinition }) => {
  const defaults = designDefaultsFor(template);
  const theme = themeById(defaults.themeId);
  const pages = previewPagesFor(template);
  const isDeck = template.contentType === 'presentation';

  return (
    <div className={`relative h-36 overflow-hidden bg-gradient-to-br ${theme.bg} p-3`}>
      <div className="absolute inset-0 opacity-35">
        <div className="absolute left-4 top-5 h-20 w-20 rounded-full border border-white/30" />
        <div className="absolute right-4 top-4 h-16 w-24 rounded-full bg-white/10 blur-xl" />
        <div className="absolute bottom-3 left-12 h-px w-36 bg-white/35" />
      </div>
      <div className={`relative mx-auto flex h-full ${isDeck ? 'aspect-video w-[86%] items-center' : 'w-24 flex-col'} rounded-lg border border-white/15 bg-black/25 p-2 shadow-2xl backdrop-blur`}>
        <span className="text-[8px] font-ui font-bold uppercase tracking-wide text-white/60">{template.category}</span>
        <strong className={`${isDeck ? 'mt-2 text-base' : 'mt-4 text-sm'} line-clamp-2 font-heading leading-tight text-white`}>
          {template.name}
        </strong>
        <span className="mt-auto h-1 w-12 rounded-full" style={{ backgroundColor: theme.accent }} />
      </div>
      <div className="absolute bottom-3 right-3 flex gap-1">
        {pages.slice(1, 4).map(page => (
          <span key={page.title} className={`${isDeck ? 'h-7 w-11' : 'h-9 w-7'} rounded border border-white/20 bg-white/80 shadow-sm`} />
        ))}
      </div>
    </div>
  );
};

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
    <article className={`flex min-w-0 flex-col overflow-hidden rounded-2xl border border-border bg-card transition-colors hover:border-primary/50 ${compact ? 'w-full' : ''}`}>
      <button type="button" onClick={() => onPreview(t)} className="relative w-full text-left">
        <MiniPreview template={t} />
        <span className="absolute left-3 top-3 rounded-full bg-background/75 px-2 py-0.5 text-[10px] font-ui font-bold text-foreground backdrop-blur">
          {CATEGORY_LABEL[t.category]}
        </span>
        {onToggleFavorite && (
          <span
            role="button"
            tabIndex={0}
            aria-label="บันทึกเทมเพลต"
            onClick={e => { e.stopPropagation(); onToggleFavorite(t.id); }}
            onKeyDown={e => { if (e.key === 'Enter') { e.stopPropagation(); onToggleFavorite(t.id); } }}
            className="absolute right-2 top-2 flex h-9 w-9 items-center justify-center rounded-full bg-background/75 backdrop-blur"
          >
            <Heart className={`h-4 w-4 ${favorite ? 'fill-secondary text-secondary' : 'text-muted-foreground'}`} />
          </span>
        )}
      </button>

      <div className="flex flex-1 flex-col gap-2 p-3">
        <TemplateBadges t={t} />
        <h3 className="font-heading text-sm font-bold leading-[1.45]">{t.name}</h3>
        <p className="line-clamp-2 text-[11px] font-ui leading-relaxed text-muted-foreground">{t.description}</p>
        <dl className="grid grid-cols-2 gap-1 text-[10px] font-ui text-muted-foreground">
          <div>≈ {t.defaultPageCount} {unit}</div>
          <div>{DIFFICULTY[t.difficulty]}</div>
          <div className="col-span-2 flex items-center gap-1"><Layers className="h-3 w-3" /> {SOURCE_LOCK_LABEL[t.sourceStrategy.lock]}</div>
          <div className="col-span-2">ส่งออก: {t.exportPreset.map(f => EXPORT_LABEL[f]).join(' · ')}</div>
        </dl>

        <div className="mt-auto flex items-center gap-2 pt-1">
          <button type="button" onClick={() => onPreview(t)} className="press min-h-11 flex-1 rounded-xl border border-border text-[11px] font-ui font-bold">
            PREVIEW
          </button>
          <button
            type="button"
            onClick={() => onUse(t)}
            className={`press min-h-11 flex-1 rounded-xl text-[11px] font-ui font-bold ${locked ? 'border border-primary/50 text-primary' : 'bg-gradient-ai text-primary-foreground'}`}
          >
            {locked ? <span className="flex items-center justify-center gap-1"><Lock className="h-3 w-3" /> อัปเกรด</span> : <span className="flex items-center justify-center gap-1"><Sparkles className="h-3 w-3" /> USE TEMPLATE</span>}
          </button>
        </div>
        {locked && <p className="text-[10px] font-ui text-muted-foreground">ดูตัวอย่างได้ฟรี ใช้งานจริงต้องใช้แผน {t.minimumPlan.toUpperCase()} ขึ้นไป</p>}
      </div>
    </article>
  );
};

export default TemplateCard;
