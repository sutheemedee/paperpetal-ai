import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowRight, Check, ChevronDown, Layers, Lightbulb, Sparkles, Wand2 } from 'lucide-react';
import AppShell from '@/components/AppShell';
import Seo from '@/components/Seo';
import TemplateCard from '@/components/templates/TemplateCard';
import TemplatePreview from '@/components/templates/TemplatePreview';
import { CREATE_CATEGORIES, categoryTemplates } from '@/templates/catalog';
import { buildProjectPlan, outputIdeasFromSources, recommendTemplates, recommendedForYou } from '@/templates/recommend';
import { CreationDraft, saveCreationDraft, trackTemplate, useTemplates } from '@/templates/store';
import { TemplateDefinition, planRank } from '@/templates/types';
import { BOOK_THEMES, COVER_STYLES, FONT_LIBRARY, designDefaultsFor } from '@/templates/visualPreview';
import { useAuth } from '@/auth/AuthProvider';
import { useEntitlements } from '@/auth/useEntitlements';
import { useKnowledge } from '@/knowledge/store';

const label = 'text-[10px] font-ui font-bold uppercase tracking-wide text-muted-foreground';
const field = 'min-h-11 w-full rounded-xl border border-border bg-card px-3 text-sm font-ui outline-none focus:border-primary/60';

const makeDraft = (template: TemplateDefinition, topic = '', sourceIds: string[] = []): CreationDraft => {
  const defaults = designDefaultsFor(template);
  return {
    templateId: template.id,
    topic,
    purpose: '',
    audience: template.targetAudience,
    language: 'thai',
    sourceIds,
    pages: template.defaultPageCount,
    chapters: template.defaultChapterCount,
    tone: template.writingDNA.tone,
    visualDensity: template.visualDNA.imageDensity,
    citationLevel: template.writingDNA.citationDensity,
    visualStyle: template.visualDNA.palette,
    imageStyle: template.visualDNA.imageStyle,
    designThemeId: defaults.themeId,
    coverStyleId: defaults.styleId,
    fontId: defaults.fontId,
  };
};

const Create = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { account } = useAuth();
  const { unrestricted } = useEntitlements();
  const { sources } = useKnowledge();
  const { all, byId, recent, isFavorite, toggleFavorite, markUsed } = useTemplates();

  const [categoryId, setCategoryId] = useState<string | undefined>(params.get('category') ?? undefined);
  const initial = byId(params.get('template'));
  const [selected, setSelected] = useState<TemplateDefinition | null>(initial);
  const [preview, setPreview] = useState<TemplateDefinition | null>(null);
  const [idea, setIdea] = useState('');
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [draft, setDraft] = useState<CreationDraft | null>(initial ? makeDraft(initial) : null);

  const set = (patch: Partial<CreationDraft>) => setDraft(d => (d ? { ...d, ...patch } : d));

  const sourceIds = sources.map(s => s.id);
  const matches = useMemo(
    () => (idea.trim().length > 2 ? recommendTemplates(idea, all, { sources, categoryId, recentIds: recent, limit: 6 }) : []),
    [idea, all, sources, categoryId, recent],
  );
  const recommended = useMemo(
    () => recommendedForYou(all, { categoryId, recentIds: recent, hasSources: sources.length > 0, limit: 6 }),
    [all, categoryId, recent, sources.length],
  );
  const sourceIdeas = useMemo(() => (sources.length ? outputIdeasFromSources(sources, all) : []), [sources, all]);
  const visibleTemplates = matches.length ? matches.map(r => r.template) : recommended;

  const choose = (template: TemplateDefinition, opts: { useSources?: boolean; pages?: number } = {}) => {
    if (!unrestricted && planRank(account?.planCode) < planRank(template.minimumPlan)) {
      trackTemplate('template_upgrade', template.id);
      navigate('/pricing');
      return;
    }
    markUsed(template.id);
    setSelected(template);
    setDraft({
      ...makeDraft(template, idea.trim(), opts.useSources ? sourceIds : []),
      pages: opts.pages ?? template.defaultPageCount,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const approve = () => {
    if (!selected || !draft || !draft.topic.trim()) return;
    const plan = buildProjectPlan(selected, draft);
    saveCreationDraft({ ...draft, plan, autoStart: true });
    trackTemplate('template_completion', selected.id);
    navigate(selected.contentType === 'presentation' ? '/present?start=1' : '/book?start=1');
  };

  const plan = selected && draft ? buildProjectPlan(selected, draft) : null;
  const unit = selected?.contentType === 'presentation' ? 'สไลด์' : 'หน้า';
  const ready = !!selected && !!draft?.topic.trim();

  return (
    <AppShell title="สร้างงานใหม่">
      <Seo title="สร้างงานใหม่ | KIVORA" description="พิมพ์ไอเดีย เลือกรูปแบบ แล้วให้ KIVORA วางแผนและสร้างงานให้ทันที" path="/create" noindex />

      <div className="mx-auto flex w-full max-w-6xl flex-col gap-5 p-4 pb-24 md:p-6">
        <header className="grid gap-4 rounded-2xl border border-border bg-card p-4 md:grid-cols-[1.4fr_0.8fr] md:p-5">
          <div>
            <p className={label}>KIVORA AI Director</p>
            <h1 className="font-display text-2xl font-extrabold md:text-3xl">เริ่มสร้างงานในจอเดียว</h1>
            <p className="mt-2 max-w-2xl text-sm font-ui text-muted-foreground">
              บอกเป้าหมายสั้น ๆ แล้ว KIVORA จะเลือกเทมเพลต โครงสร้าง จำนวนหน้า และสไตล์เริ่มต้นให้ คุณปรับเฉพาะจุดที่จำเป็นก่อนส่งไปสร้างจริง
            </p>
          </div>
          <div className="rounded-xl border border-border bg-surface p-3">
            <p className="text-xs font-ui font-bold text-foreground">สถานะสิทธิ์</p>
            <p className="mt-1 text-xs font-ui text-muted-foreground">
              {unrestricted || account?.planCode === 'unlimited'
                ? 'Operator / Unlimited: สร้างงานได้ไม่จำกัด'
                : `${account?.planName ?? 'Free Trial'} · ใช้ตามโควตาแผน`}
            </p>
          </div>
        </header>

        <section className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="flex flex-col gap-4">
            <section className="rounded-2xl border border-border bg-card p-4">
              <div className="flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-highlight" />
                <h2 className="font-display text-sm font-bold">บอกสิ่งที่อยากสร้าง</h2>
              </div>
              <textarea
                value={idea}
                onChange={e => {
                  setIdea(e.target.value);
                  if (draft) set({ topic: e.target.value });
                }}
                rows={4}
                className="mt-3 w-full resize-none rounded-xl border border-border bg-surface p-3 text-sm font-ui outline-none focus:border-primary/60"
                placeholder="เช่น: ทำพรีเซนเทชันสอนทีมขายเรื่องการใช้ AI ปิดการขาย โดยอ้างอิงจากแหล่งข้อมูลที่อัปโหลดไว้"
              />
              <div className="mt-3 flex flex-wrap gap-2">
                {CREATE_CATEGORIES.slice(0, 10).map(c => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setCategoryId(c.id === categoryId ? undefined : c.id)}
                    className={`press min-h-10 rounded-full border px-3 text-xs font-ui font-bold ${
                      categoryId === c.id ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-background'
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </section>

            {sources.length > 0 && (
              <section className="rounded-2xl border border-border bg-card p-4">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div>
                    <h2 className="flex items-center gap-2 font-display text-sm font-bold">
                      <Layers className="h-4 w-4 text-primary" /> เริ่มจากแหล่งข้อมูลของคุณ
                    </h2>
                    <p className="mt-1 text-xs font-ui text-muted-foreground">พบ {sources.length} แหล่งข้อมูล พร้อมแปลงเป็นงานได้ทันที</p>
                  </div>
                  <button type="button" onClick={() => navigate('/knowledge')} className="text-xs font-ui font-bold text-primary">
                    จัดการ
                  </button>
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  {sourceIdeas.map(i => (
                    <button
                      key={i.template.id}
                      type="button"
                      onClick={() => choose(i.template, { useSources: true, pages: i.pages })}
                      className="press rounded-xl border border-border bg-surface p-3 text-left hover:border-primary/50"
                    >
                      <span className="block text-xs font-ui font-bold">{i.template.name}</span>
                      <span className="mt-1 block text-[11px] font-ui text-muted-foreground">ประมาณ {i.pages} {i.unit} · ใช้ sources ทั้งหมด</span>
                    </button>
                  ))}
                </div>
              </section>
            )}

            <section>
              <div className="mb-2 flex items-center justify-between">
                <h2 className="font-display text-sm font-bold">{matches.length ? 'เทมเพลตที่เหมาะกับไอเดียนี้' : 'แนะนำสำหรับคุณ'}</h2>
                {matches.length > 0 && <span className="text-[11px] font-ui text-primary">{matches[0].match}% match</span>}
              </div>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {visibleTemplates.map(t => (
                  <TemplateCard
                    key={t.id}
                    template={t}
                    planCode={account?.planCode}
                    unrestricted={unrestricted}
                    favorite={isFavorite(t.id)}
                    onToggleFavorite={toggleFavorite}
                    onPreview={x => {
                      trackTemplate('template_preview', x.id);
                      setPreview(x);
                    }}
                    onUse={choose}
                    compact
                  />
                ))}
              </div>
            </section>

            {categoryId && (
              <section>
                <h2 className="mb-2 font-display text-sm font-bold">ทั้งหมดในหมวดนี้</h2>
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {categoryTemplates(categoryId).slice(0, 9).map(t => (
                    <TemplateCard
                      key={t.id}
                      template={t}
                      planCode={account?.planCode}
                      unrestricted={unrestricted}
                      favorite={isFavorite(t.id)}
                      onToggleFavorite={toggleFavorite}
                      onPreview={setPreview}
                      onUse={choose}
                    />
                  ))}
                </div>
              </section>
            )}
          </div>

          <aside className="lg:sticky lg:top-20 lg:self-start">
            <section className="rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-soft)]">
              <p className={label}>Project Setup</p>
              <h2 className="mt-1 font-display text-lg font-extrabold">{selected?.name ?? 'เลือกเทมเพลตเพื่อเริ่ม'}</h2>

              {!selected || !draft ? (
                <p className="mt-3 rounded-xl border border-border bg-surface p-3 text-sm font-ui text-muted-foreground">
                  พิมพ์ไอเดียแล้วเลือกเทมเพลตจากด้านซ้าย ระบบจะเติมค่าเริ่มต้นให้ทันที
                </p>
              ) : (
                <div className="mt-4 flex flex-col gap-3">
                  <label className="flex flex-col gap-1">
                    <span className={label}>หัวข้อ *</span>
                    <input className={field} value={draft.topic} onChange={e => set({ topic: e.target.value })} placeholder="หัวข้องานของคุณ" />
                  </label>
                  <label className="flex flex-col gap-1">
                    <span className={label}>กลุ่มเป้าหมาย</span>
                    <input className={field} value={draft.audience} onChange={e => set({ audience: e.target.value })} />
                  </label>
                  <label className="flex flex-col gap-1">
                    <span className={label}>เป้าหมาย</span>
                    <input className={field} value={draft.purpose} onChange={e => set({ purpose: e.target.value })} placeholder="อยากให้ผู้อ่านได้อะไร" />
                  </label>

                  <section className="rounded-xl border border-border bg-surface p-3">
                    <div className="mb-3 flex items-center justify-between gap-2">
                      <div>
                        <p className={label}>Book Design</p>
                        <h3 className="font-heading text-sm font-bold">หน้าตาหนังสือ</h3>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const defaults = designDefaultsFor(selected);
                          set({ designThemeId: defaults.themeId, coverStyleId: defaults.styleId, fontId: defaults.fontId });
                        }}
                        className="rounded-full border border-primary/40 px-3 py-1.5 text-[11px] font-ui font-bold text-primary"
                      >
                        AI เลือกให้
                      </button>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <p className="mb-2 text-[11px] font-ui font-bold text-muted-foreground">ธีมสีหนังสือ</p>
                        <div className="grid grid-cols-2 gap-2">
                          {BOOK_THEMES.slice(0, 6).map(theme => (
                            <button
                              key={theme.id}
                              type="button"
                              onClick={() => set({ designThemeId: theme.id, visualStyle: theme.name })}
                              className={`rounded-xl border p-2 text-left ${draft.designThemeId === theme.id ? 'border-primary bg-primary/10' : 'border-border bg-background'}`}
                            >
                              <span className={`mb-2 block h-7 rounded-lg bg-gradient-to-br ${theme.bg}`} />
                              <span className="block text-[11px] font-ui font-bold">{theme.name}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <p className="mb-2 text-[11px] font-ui font-bold text-muted-foreground">รูปแบบปก</p>
                        <div className="flex gap-2 overflow-x-auto pb-1">
                          {COVER_STYLES.map(style => (
                            <button
                              key={style.id}
                              type="button"
                              onClick={() => set({ coverStyleId: style.id, imageStyle: style.name })}
                              className={`min-h-10 shrink-0 rounded-full border px-3 text-[11px] font-ui font-bold ${draft.coverStyleId === style.id ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-background'}`}
                            >
                              {style.name}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <p className="mb-2 text-[11px] font-ui font-bold text-muted-foreground">ฟอนต์หนังสือ</p>
                        <div className="grid gap-2">
                          {FONT_LIBRARY.slice(0, 5).map(font => (
                            <button
                              key={font.id}
                              type="button"
                              onClick={() => set({ fontId: font.id })}
                              className={`rounded-xl border p-2 text-left ${draft.fontId === font.id ? 'border-primary bg-primary/10' : 'border-border bg-background'}`}
                            >
                              <span className="block text-sm font-bold" style={{ fontFamily: font.stack }}>{font.sample}</span>
                              <span className="text-[10px] font-ui text-muted-foreground">{font.name}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </section>

                  <button
                    type="button"
                    onClick={() => setAdvancedOpen(v => !v)}
                    className="flex min-h-11 items-center justify-between rounded-xl border border-border px-3 text-xs font-ui font-bold"
                  >
                    ปรับละเอียด
                    <ChevronDown className={`h-4 w-4 transition-transform ${advancedOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {advancedOpen && (
                    <div className="grid gap-3 sm:grid-cols-2">
                      <label className="flex flex-col gap-1">
                        <span className={label}>จำนวน{unit}</span>
                        <input type="number" min={4} max={600} className={field} value={draft.pages} onChange={e => set({ pages: Number(e.target.value) || 10 })} />
                      </label>
                      <label className="flex flex-col gap-1">
                        <span className={label}>บท / ส่วน</span>
                        <input type="number" min={1} max={60} className={field} value={draft.chapters} onChange={e => set({ chapters: Number(e.target.value) || 1 })} />
                      </label>
                      <label className="flex flex-col gap-1">
                        <span className={label}>ภาษา</span>
                        <select className={field} value={draft.language} onChange={e => set({ language: e.target.value })}>
                          <option value="thai">ไทย</option>
                          <option value="english">English</option>
                        </select>
                      </label>
                      <label className="flex flex-col gap-1">
                        <span className={label}>ภาพประกอบ</span>
                        <select className={field} value={draft.visualDensity} onChange={e => set({ visualDensity: e.target.value as CreationDraft['visualDensity'] })}>
                          <option value="none">ไม่มี</option>
                          <option value="low">น้อย</option>
                          <option value="medium">พอดี</option>
                          <option value="high">เยอะ</option>
                        </select>
                      </label>
                      <label className="flex flex-col gap-1 sm:col-span-2">
                        <span className={label}>โทนการเขียน</span>
                        <input className={field} value={draft.tone} onChange={e => set({ tone: e.target.value })} />
                      </label>
                    </div>
                  )}

                  {sources.length > 0 && (
                    <button
                      type="button"
                      onClick={() => set({ sourceIds: draft.sourceIds.length ? [] : sourceIds })}
                      className={`flex min-h-11 items-center justify-between rounded-xl border px-3 text-xs font-ui font-bold ${
                        draft.sourceIds.length ? 'border-primary bg-gradient-subtle text-foreground' : 'border-border'
                      }`}
                    >
                      ใช้แหล่งข้อมูลทั้งหมด ({sources.length})
                      {draft.sourceIds.length ? <Check className="h-4 w-4 text-primary" /> : null}
                    </button>
                  )}

                  {plan && (
                    <div className="rounded-xl border border-border bg-surface p-3">
                      <p className="text-xs font-ui font-bold">{plan.title}</p>
                      <p className="mt-1 text-[11px] font-ui text-muted-foreground">{plan.objective}</p>
                      <div className="mt-3 grid grid-cols-3 gap-2 text-center text-[11px] font-ui">
                        <span className="rounded-lg bg-card p-2">{draft.pages}<br />{unit}</span>
                        <span className="rounded-lg bg-card p-2">{draft.chapters}<br />ส่วน</span>
                        <span className="rounded-lg bg-card p-2">{plan.estimatedImages}<br />ภาพ</span>
                      </div>
                    </div>
                  )}

                  <button
                    type="button"
                    disabled={!ready}
                    onClick={approve}
                    className="press flex min-h-12 items-center justify-center gap-2 rounded-xl bg-gradient-ai text-sm font-ui font-bold text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {ready ? <Sparkles className="h-4 w-4" /> : <Wand2 className="h-4 w-4" />}
                    {ready ? 'อนุมัติและสร้างงาน' : 'กรอกหัวข้อก่อน'}
                    {ready && <ArrowRight className="h-4 w-4" />}
                  </button>
                </div>
              )}
            </section>
          </aside>
        </section>
      </div>

      <TemplatePreview
        template={preview}
        planCode={account?.planCode}
        unrestricted={unrestricted}
        onClose={() => setPreview(null)}
        onUse={t => {
          setPreview(null);
          choose(t);
        }}
      />
    </AppShell>
  );
};

export default Create;
