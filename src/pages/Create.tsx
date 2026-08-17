import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowRight, Check, Lightbulb, Layers, Sparkles, Wand2 } from 'lucide-react';
import AppShell from '@/components/AppShell';
import Seo from '@/components/Seo';
import TemplateCard from '@/components/templates/TemplateCard';
import TemplatePreview from '@/components/templates/TemplatePreview';
import { CREATE_CATEGORIES, categoryTemplates } from '@/templates/catalog';
import { buildProjectPlan, outputIdeasFromSources, recommendTemplates, recommendedForYou } from '@/templates/recommend';
import { CreationDraft, saveCreationDraft, trackTemplate, useTemplates } from '@/templates/store';
import { TemplateDefinition, planRank } from '@/templates/types';
import { useAuth } from '@/auth/AuthProvider';
import { useEntitlements } from '@/auth/useEntitlements';
import { useKnowledge } from '@/knowledge/store';

const label = 'text-[10px] font-ui font-bold uppercase tracking-wide text-muted-foreground';
const field = 'min-h-11 w-full rounded-xl border border-border bg-card px-3 text-sm font-ui outline-none focus:border-primary/60';

const Create = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { account } = useAuth();
  const { unrestricted } = useEntitlements();
  const { sources } = useKnowledge();
  const { all, byId, recent, isFavorite, toggleFavorite, markUsed } = useTemplates();

  const [categoryId, setCategoryId] = useState<string | undefined>(params.get('category') ?? undefined);
  const [selected, setSelected] = useState<TemplateDefinition | null>(byId(params.get('template')));
  const [preview, setPreview] = useState<TemplateDefinition | null>(null);
  const [idea, setIdea] = useState('');
  const [step, setStep] = useState(1);

  const [draft, setDraft] = useState<CreationDraft>({
    templateId: params.get('template') ?? '',
    topic: '', purpose: '', audience: '', language: 'thai',
    sourceIds: [], pages: 40, chapters: 8, tone: '',
    visualDensity: 'medium', citationLevel: 'light', visualStyle: 'Midnight Prism', imageStyle: '',
  });
  const [plan, setPlan] = useState<CreationDraft['plan'] | null>(null);

  const set = (patch: Partial<CreationDraft>) => setDraft(d => ({ ...d, ...patch }));

  const recommended = useMemo(
    () => recommendedForYou(all, { categoryId, recentIds: recent, hasSources: sources.length > 0, limit: 6 }),
    [all, categoryId, recent, sources.length],
  );
  const ideaMatches = useMemo(
    () => (idea.trim().length > 3 ? recommendTemplates(idea, all, { sources, recentIds: recent, limit: 3 }) : []),
    [idea, all, sources, recent],
  );
  const sourceIdeas = useMemo(() => (sources.length ? outputIdeasFromSources(sources, all) : []), [sources, all]);

  const pick = (t: TemplateDefinition) => {
    if (!unrestricted && planRank(account?.planCode) < planRank(t.minimumPlan)) {
      trackTemplate('template_upgrade', t.id);
      navigate('/pricing');
      return;
    }
    markUsed(t.id);
    setSelected(t);
    setPlan(null);
    setStep(1);
    set({
      templateId: t.id,
      pages: t.defaultPageCount,
      chapters: t.defaultChapterCount,
      audience: t.targetAudience,
      tone: t.writingDNA.tone,
      visualDensity: t.visualDNA.imageDensity,
      citationLevel: t.writingDNA.citationDensity,
      imageStyle: t.visualDNA.imageStyle,
      visualStyle: t.visualDNA.palette,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const generatePlan = () => {
    if (!selected) return;
    if (!draft.topic.trim()) { setStep(1); return; }
    setPlan(buildProjectPlan(selected, draft));
  };

  const approve = () => {
    if (!selected || !plan) return;
    saveCreationDraft({ ...draft, plan });
    trackTemplate('template_completion', selected.id);
    navigate(selected.contentType === 'presentation' ? '/present' : '/book');
  };

  const unit = selected?.contentType === 'presentation' ? 'สไลด์' : 'หน้า';

  return (
    <AppShell title="สร้างงานใหม่">
      <Seo title="สร้างงานใหม่ | PaperPetal AI" description="เลือกสิ่งที่อยากสร้าง เลือกเทมเพลต แล้วให้ AI วางแผนโปรเจกต์ก่อนสร้างจริง" path="/create" noindex />
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-5 p-4 pb-24 md:p-6">
        {!selected && (
          <>
            <header>
              <p className={label}>Create</p>
              <h1 className="font-display text-xl font-extrabold md:text-2xl">วันนี้คุณอยากสร้างอะไร?</h1>
            </header>

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
              {CREATE_CATEGORIES.map(c => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setCategoryId(c.id === categoryId ? undefined : c.id)}
                  className={`press flex min-h-[86px] flex-col justify-center gap-1 rounded-2xl border p-3 text-left ${
                    categoryId === c.id ? 'border-primary/60 bg-gradient-subtle' : 'border-border bg-card hover:border-primary/40'
                  }`}
                >
                  <span className="text-lg leading-none">{c.emoji}</span>
                  <span className="text-xs font-ui font-semibold leading-tight">{c.label}</span>
                </button>
              ))}
            </div>

            {/* HELP ME CHOOSE / FROM IDEA */}
            <section className="rounded-2xl border border-border bg-card p-4">
              <h2 className="flex items-center gap-1.5 font-display text-sm font-bold"><Lightbulb className="h-4 w-4 text-highlight" /> ให้ AI ช่วยเลือก (HELP ME CHOOSE)</h2>
              <p className="mt-1 text-[11px] font-ui text-muted-foreground">เล่าสั้น ๆ ว่าคุณมีอะไรและอยากได้อะไร เช่น “ผมมีคลิป YouTube 5 คลิปเกี่ยวกับ AI อยากทำไว้สอนนักเรียน”</p>
              <textarea
                value={idea}
                onChange={e => setIdea(e.target.value)}
                rows={2}
                className="mt-2 w-full rounded-xl border border-border bg-surface p-3 text-sm font-ui outline-none focus:border-primary/60"
                placeholder="อยากทำหนังสือสอนร้านอาหารใช้ AI..."
              />
              {ideaMatches.length > 0 && (
                <ul className="mt-3 flex flex-col gap-2">
                  {ideaMatches.map((r, i) => (
                    <li key={r.template.id} className="flex items-center justify-between gap-3 rounded-xl border border-border bg-surface p-3">
                      <div>
                        <p className="text-xs font-ui font-bold">
                          {r.template.name}{' '}
                          <span className="text-primary">{i === 0 ? 'Best Match ' : ''}{r.match}%</span>
                        </p>
                        <p className="text-[11px] font-ui text-muted-foreground">{r.reason}</p>
                      </div>
                      <button type="button" onClick={() => pick(r.template)} className="press min-h-11 shrink-0 rounded-xl bg-gradient-ai px-3 text-[11px] font-ui font-bold text-primary-foreground">
                        เลือก
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            {/* FROM SOURCES */}
            <section className="rounded-2xl border border-border bg-card p-4">
              <h2 className="flex items-center gap-1.5 font-display text-sm font-bold"><Layers className="h-4 w-4 text-primary" /> START FROM SOURCES</h2>
              {sources.length === 0 ? (
                <p className="mt-1 text-[11px] font-ui text-muted-foreground">
                  ยังไม่มีแหล่งข้อมูล — <button type="button" onClick={() => navigate('/knowledge')} className="font-bold text-primary">เพิ่ม YouTube / PDF / เว็บไซต์</button>
                </p>
              ) : (
                <>
                  <p className="mt-1 text-[11px] font-ui text-muted-foreground">แหล่งข้อมูล {sources.length} ชิ้นของคุณสามารถกลายเป็น:</p>
                  <ul className="mt-2 grid gap-2 sm:grid-cols-2">
                    {sourceIdeas.map(i => (
                      <li key={i.template.id} className="flex items-center justify-between gap-2 rounded-xl border border-border bg-surface p-3">
                        <span className="text-xs font-ui">{i.template.name}<span className="block text-[11px] text-muted-foreground">≈ {i.pages} {i.unit}</span></span>
                        <button
                          type="button"
                          onClick={() => { pick(i.template); set({ pages: i.pages, sourceIds: sources.map(s => s.id) }); }}
                          className="press min-h-11 shrink-0 rounded-xl border border-primary/50 px-3 text-[11px] font-ui font-bold text-primary"
                        >
                          CREATE
                        </button>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </section>

            {/* RECOMMENDED TEMPLATES */}
            <section>
              <div className="mb-2 flex items-center justify-between">
                <h2 className="font-display text-sm font-bold">แนะนำสำหรับคุณ</h2>
                <button type="button" onClick={() => navigate('/templates')} className="text-[11px] font-ui font-bold text-primary">ดูคลังทั้งหมด</button>
              </div>
              <div className="flex gap-3 overflow-x-auto pb-2 sm:grid sm:grid-cols-2 sm:overflow-visible lg:grid-cols-3">
                {recommended.map(t => (
                  <TemplateCard
                    key={t.id}
                    template={t}
                    planCode={account?.planCode}
                    unrestricted={unrestricted}
                    favorite={isFavorite(t.id)}
                    onToggleFavorite={toggleFavorite}
                    onPreview={x => { trackTemplate('template_preview', x.id); setPreview(x); }}
                    onUse={pick}
                    compact
                  />
                ))}
              </div>
            </section>

            {categoryId && (
              <section>
                <h2 className="mb-2 font-display text-sm font-bold">เทมเพลตในหมวดนี้</h2>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {categoryTemplates(categoryId).slice(0, 9).map(t => (
                    <TemplateCard
                      key={t.id}
                      template={t}
                      planCode={account?.planCode}
                      unrestricted={unrestricted}
                      favorite={isFavorite(t.id)}
                      onToggleFavorite={toggleFavorite}
                      onPreview={x => setPreview(x)}
                      onUse={pick}
                    />
                  ))}
                </div>
              </section>
            )}
          </>
        )}

        {/* ------------------------- WIZARD ------------------------- */}
        {selected && !plan && (
          <>
            <header className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className={label}>Creation Wizard · ขั้นที่ {step}/4</p>
                <h1 className="font-display text-lg font-extrabold md:text-xl">{selected.name}</h1>
              </div>
              <button type="button" onClick={() => setSelected(null)} className="press min-h-11 rounded-xl border border-border px-3 text-[11px] font-ui font-bold">
                เปลี่ยนเทมเพลต
              </button>
            </header>

            <div className="flex gap-1">
              {[1, 2, 3, 4].map(s => (
                <span key={s} className={`h-1.5 flex-1 rounded-full ${s <= step ? 'bg-gradient-ai' : 'bg-border'}`} />
              ))}
            </div>

            <section className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4">
              {step === 1 && (
                <>
                  <h2 className="font-display text-sm font-bold">1. เนื้อหา</h2>
                  <label className="flex flex-col gap-1"><span className={label}>หัวข้อ *</span>
                    <input className={field} value={draft.topic} onChange={e => set({ topic: e.target.value })} placeholder="เช่น ใช้ AI เพิ่มยอดขายร้านอาหาร" />
                  </label>
                  <label className="flex flex-col gap-1"><span className={label}>วัตถุประสงค์</span>
                    <input className={field} value={draft.purpose} onChange={e => set({ purpose: e.target.value })} placeholder="ให้ผู้อ่านทำอะไรได้หลังอ่านจบ" />
                  </label>
                  <label className="flex flex-col gap-1"><span className={label}>กลุ่มผู้อ่าน</span>
                    <input className={field} value={draft.audience} onChange={e => set({ audience: e.target.value })} />
                  </label>
                  <label className="flex flex-col gap-1"><span className={label}>ภาษา</span>
                    <select className={field} value={draft.language} onChange={e => set({ language: e.target.value })}>
                      <option value="thai">ไทย</option>
                      <option value="english">English</option>
                    </select>
                  </label>
                </>
              )}

              {step === 2 && (
                <>
                  <h2 className="font-display text-sm font-bold">2. แหล่งข้อมูล</h2>
                  <p className="text-[11px] font-ui text-muted-foreground">{selected.sourceStrategy.note}</p>
                  {sources.length === 0 && (
                    <button type="button" onClick={() => navigate('/knowledge')} className="press min-h-11 rounded-xl border border-border px-3 text-xs font-ui font-bold">
                      เพิ่มแหล่งข้อมูล (YouTube / เว็บ / PDF)
                    </button>
                  )}
                  <ul className="flex flex-col gap-1.5">
                    {sources.map(s => {
                      const on = draft.sourceIds.includes(s.id);
                      return (
                        <li key={s.id}>
                          <button
                            type="button"
                            onClick={() => set({ sourceIds: on ? draft.sourceIds.filter(x => x !== s.id) : [...draft.sourceIds, s.id] })}
                            className={`press flex min-h-11 w-full items-center justify-between gap-2 rounded-xl border px-3 text-left text-xs font-ui ${
                              on ? 'border-primary/60 bg-gradient-subtle' : 'border-border'
                            }`}
                          >
                            <span className="truncate">{s.title}</span>
                            {on && <Check className="h-4 w-4 shrink-0 text-primary" />}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </>
              )}

              {step === 3 && (
                <>
                  <h2 className="font-display text-sm font-bold">3. ผลลัพธ์</h2>
                  <label className="flex flex-col gap-1"><span className={label}>จำนวน{unit}</span>
                    <input type="number" min={4} max={400} className={field} value={draft.pages} onChange={e => set({ pages: Number(e.target.value) || 10 })} />
                  </label>
                  <label className="flex flex-col gap-1"><span className={label}>จำนวนบท / ส่วน</span>
                    <input type="number" min={1} max={40} className={field} value={draft.chapters} onChange={e => set({ chapters: Number(e.target.value) || 1 })} />
                  </label>
                  <label className="flex flex-col gap-1"><span className={label}>โทนการเขียน</span>
                    <input className={field} value={draft.tone} onChange={e => set({ tone: e.target.value })} />
                  </label>
                  <label className="flex flex-col gap-1"><span className={label}>ความหนาแน่นภาพ</span>
                    <select className={field} value={draft.visualDensity} onChange={e => set({ visualDensity: e.target.value as CreationDraft['visualDensity'] })}>
                      <option value="none">ไม่มีภาพ</option><option value="low">น้อย</option><option value="medium">ปานกลาง</option><option value="high">มาก</option>
                    </select>
                  </label>
                  <label className="flex flex-col gap-1"><span className={label}>ระดับการอ้างอิง</span>
                    <select className={field} value={draft.citationLevel} onChange={e => set({ citationLevel: e.target.value as CreationDraft['citationLevel'] })}>
                      <option value="none">ไม่อ้างอิง</option><option value="light">เบา</option><option value="medium">ปานกลาง</option><option value="heavy">เข้ม</option>
                    </select>
                  </label>
                </>
              )}

              {step === 4 && (
                <>
                  <h2 className="font-display text-sm font-bold">4. สไตล์</h2>
                  <p className="text-[11px] font-ui text-muted-foreground">เทมเพลต: {selected.name} · {selected.visualDNA.typography}</p>
                  <label className="flex flex-col gap-1"><span className={label}>Visual Style</span>
                    <input className={field} value={draft.visualStyle} onChange={e => set({ visualStyle: e.target.value })} />
                  </label>
                  <label className="flex flex-col gap-1"><span className={label}>Image Style</span>
                    <input className={field} value={draft.imageStyle} onChange={e => set({ imageStyle: e.target.value })} />
                  </label>
                </>
              )}
            </section>

            <div className="sticky bottom-16 flex gap-2 md:bottom-0">
              {step > 1 && (
                <button type="button" onClick={() => setStep(step - 1)} className="press min-h-12 rounded-xl border border-border bg-card px-4 text-xs font-ui font-bold">
                  ย้อนกลับ
                </button>
              )}
              {step < 4 ? (
                <button type="button" onClick={() => setStep(step + 1)} className="press flex min-h-12 flex-1 items-center justify-center gap-1.5 rounded-xl bg-gradient-ai text-sm font-ui font-bold text-primary-foreground">
                  CONTINUE <ArrowRight className="h-4 w-4" />
                </button>
              ) : (
                <button type="button" onClick={generatePlan} className="press flex min-h-12 flex-1 items-center justify-center gap-1.5 rounded-xl bg-gradient-ai text-sm font-ui font-bold text-primary-foreground">
                  <Wand2 className="h-4 w-4" /> GENERATE PROJECT PLAN
                </button>
              )}
            </div>
          </>
        )}

        {/* --------------------- PROJECT PLAN --------------------- */}
        {selected && plan && (
          <>
            <header>
              <p className={label}>Project Plan</p>
              <h1 className="font-display text-xl font-extrabold">{plan.title}</h1>
              <p className="text-xs font-ui text-muted-foreground">
                {draft.audience || selected.targetAudience} · {plan.objective}
              </p>
            </header>

            <section className="rounded-2xl border border-border bg-card p-4">
              <h2 className="font-display text-sm font-bold">การจัดสรร{unit} (รวม {plan.sections.reduce((s, r) => s + r.pages, 0)} {unit})</h2>
              <ul className="mt-2 flex flex-col gap-1">
                {plan.sections.map((s, i) => (
                  <li key={`${s.label}-${i}`} className="flex items-center justify-between rounded-xl border border-border px-3 py-2 text-xs font-ui">
                    <span>{s.label}</span><span className="text-muted-foreground">{s.pages} {unit}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-3 grid gap-2 sm:grid-cols-3">
                <p className="rounded-xl border border-border bg-surface p-2.5 text-[11px] font-ui">ประมาณการ AI Pages<span className="block font-bold text-foreground">{draft.pages}</span></p>
                <p className="rounded-xl border border-border bg-surface p-2.5 text-[11px] font-ui">ภาพประกอบ<span className="block font-bold text-foreground">{plan.estimatedImages}</span></p>
                <p className="rounded-xl border border-border bg-surface p-2.5 text-[11px] font-ui">แหล่งข้อมูลที่ใช้<span className="block font-bold text-foreground">{draft.sourceIds.length || sources.length}</span></p>
              </div>
            </section>

            <div className="flex gap-2">
              <button type="button" onClick={() => setPlan(null)} className="press min-h-12 rounded-xl border border-border bg-card px-4 text-xs font-ui font-bold">EDIT PLAN</button>
              <button type="button" onClick={approve} className="press flex min-h-12 flex-1 items-center justify-center gap-1.5 rounded-xl bg-gradient-ai text-sm font-ui font-bold text-primary-foreground">
                <Sparkles className="h-4 w-4" /> APPROVE & GENERATE
              </button>
            </div>
          </>
        )}
      </div>

      <TemplatePreview
        template={preview}
        planCode={account?.planCode}
        unrestricted={unrestricted}
        onClose={() => setPreview(null)}
        onUse={t => { setPreview(null); pick(t); }}
      />
    </AppShell>
  );
};

export default Create;
