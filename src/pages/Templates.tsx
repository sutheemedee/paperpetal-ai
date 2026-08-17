import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import AppShell from '@/components/AppShell';
import Seo from '@/components/Seo';
import TemplateCard from '@/components/templates/TemplateCard';
import TemplatePreview from '@/components/templates/TemplatePreview';
import { useTemplates, trackTemplate } from '@/templates/store';
import { CATEGORY_LABEL, TemplateCategory, TemplateDefinition, planRank } from '@/templates/types';
import { useAuth } from '@/auth/AuthProvider';
import { useEntitlements } from '@/auth/useEntitlements';

const CATEGORIES: ('all' | TemplateCategory)[] = [
  'all', 'book', 'ebook', 'manual', 'education', 'course', 'presentation',
  'business', 'marketing', 'report', 'research', 'novel', 'children', 'manga', 'comic', 'screenplay', 'custom',
];

type Sort = 'recommended' | 'popular' | 'newest' | 'free' | 'premium';

const Templates = () => {
  const navigate = useNavigate();
  const { account } = useAuth();
  const { unrestricted } = useEntitlements();
  const { all, favorites, recent, toggleFavorite, isFavorite, markUsed } = useTemplates();
  const [cat, setCat] = useState<'all' | TemplateCategory>('all');
  const [q, setQ] = useState('');
  const [sort, setSort] = useState<Sort>('recommended');
  const [tab, setTab] = useState<'library' | 'favorites' | 'recent'>('library');
  const [preview, setPreview] = useState<TemplateDefinition | null>(null);

  const list = useMemo(() => {
    let rows = all;
    if (tab === 'favorites') rows = rows.filter(t => favorites.includes(t.id));
    if (tab === 'recent') rows = recent.map(id => all.find(t => t.id === id)).filter(Boolean) as TemplateDefinition[];
    if (cat !== 'all') rows = rows.filter(t => t.category === cat);
    const needle = q.trim().toLowerCase();
    if (needle) {
      rows = rows.filter(t =>
        `${t.name} ${t.description} ${t.tags.join(' ')} ${CATEGORY_LABEL[t.category]} ${t.targetAudience}`
          .toLowerCase()
          .includes(needle),
      );
    }
    const sorted = [...rows];
    if (sort === 'popular') sorted.sort((a, b) => Number(!!b.popular) - Number(!!a.popular));
    if (sort === 'newest') sorted.sort((a, b) => Number(!!b.isNew) - Number(!!a.isNew));
    if (sort === 'free') sorted.sort((a, b) => Number(a.isPremium) - Number(b.isPremium));
    if (sort === 'premium') sorted.sort((a, b) => Number(b.isPremium) - Number(a.isPremium));
    if (sort === 'recommended') sorted.sort((a, b) => (Number(!!b.featured) * 2 + Number(!!b.popular)) - (Number(!!a.featured) * 2 + Number(!!a.popular)));
    return sorted;
  }, [all, cat, q, sort, tab, favorites, recent]);

  const use = (t: TemplateDefinition) => {
    const locked = !unrestricted && planRank(account?.planCode) < planRank(t.minimumPlan);
    if (locked) {
      trackTemplate('template_upgrade', t.id);
      navigate('/pricing');
      return;
    }
    markUsed(t.id);
    navigate(`/create?template=${t.id}`);
  };

  return (
    <AppShell title="คลังเทมเพลต">
      <Seo
        title="คลังเทมเพลต | KIVORA"
        description="เลือกเทมเพลตหนังสือ คู่มือ คอร์ส พรีเซนเทชัน รายงาน นิยาย มังงะ และบทภาพยนตร์ พร้อมโครงสร้างและสไตล์สำเร็จรูป"
        path="/template-library"
        noindex
      />
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 p-4 md:p-6">
        <header>
          <h1 className="font-display text-xl font-extrabold md:text-2xl">คลังเทมเพลต</h1>
          <p className="text-xs font-ui text-muted-foreground">
            เทมเพลตคือโครงสร้างเนื้อหา + Writing DNA + Visual DNA + Source DNA พร้อมใช้งานทันที
          </p>
        </header>

        <div className="flex flex-col gap-2">
          <label className="flex min-h-11 items-center gap-2 rounded-xl border border-border bg-card px-3">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              value={q}
              onChange={e => setQ(e.target.value)}
              placeholder='ค้นหา "AI" "คู่มือ" "ขายของ" "ครู" "Manga" "Pitch Deck"'
              className="w-full bg-transparent py-2 text-sm font-ui outline-none"
            />
          </label>

          <div className="flex gap-2 overflow-x-auto pb-1">
            {(['library', 'favorites', 'recent'] as const).map(t => (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                className={`press min-h-9 shrink-0 rounded-full px-3 text-[11px] font-ui font-bold ${
                  tab === t ? 'bg-gradient-ai text-primary-foreground' : 'border border-border text-muted-foreground'
                }`}
              >
                {t === 'library' ? 'ทั้งคลัง' : t === 'favorites' ? 'Favorites' : 'Recently Used'}
              </button>
            ))}
            {(['recommended', 'popular', 'newest', 'free', 'premium'] as Sort[]).map(s => (
              <button
                key={s}
                type="button"
                onClick={() => setSort(s)}
                className={`press min-h-9 shrink-0 rounded-full px-3 text-[11px] font-ui font-bold ${
                  sort === s ? 'border border-primary/60 text-primary' : 'border border-border text-muted-foreground'
                }`}
              >
                {s === 'recommended' ? 'Recommended' : s === 'popular' ? 'Popular' : s === 'newest' ? 'Newest' : s === 'free' ? 'Free' : 'Premium'}
              </button>
            ))}
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1">
            {CATEGORIES.map(c => (
              <button
                key={c}
                type="button"
                onClick={() => setCat(c)}
                className={`press min-h-9 shrink-0 rounded-full px-3 text-[11px] font-ui font-semibold ${
                  cat === c ? 'bg-surface-hover text-foreground shadow-[inset_0_0_0_1px_hsl(var(--primary)/0.4)]' : 'text-muted-foreground'
                }`}
              >
                {c === 'all' ? 'All' : CATEGORY_LABEL[c]}
              </button>
            ))}
          </div>
        </div>

        <p className="text-[11px] font-ui text-muted-foreground">{list.length} เทมเพลต</p>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {list.map(t => (
            <TemplateCard
              key={t.id}
              template={t}
              planCode={account?.planCode}
              unrestricted={unrestricted}
              favorite={isFavorite(t.id)}
              onToggleFavorite={toggleFavorite}
              onPreview={x => { trackTemplate('template_preview', x.id); setPreview(x); }}
              onUse={use}
            />
          ))}
        </div>
      </div>

      <TemplatePreview
        template={preview}
        planCode={account?.planCode}
        unrestricted={unrestricted}
        onClose={() => setPreview(null)}
        onUse={t => { setPreview(null); use(t); }}
      />
    </AppShell>
  );
};

export default Templates;
