import { useEffect, useMemo, useState } from 'react';
import { BookOpenCheck, FileDown, Save, Sparkles, Wand2 } from 'lucide-react';
import StudioLayout from '@/components/studio/StudioLayout';
import ZoomPanCanvas from '@/components/studio/ZoomPanCanvas';
import ImageViewer from '@/components/studio/ImageViewer';
import BookPageCanvas, { flattenBook } from '@/components/studio/bookPages';
import BookSizeSelector from '@/components/BookSizeSelector';
import StyleTemplateUploader from '@/components/StyleTemplateUploader';
import CoverDesigner from '@/components/CoverDesigner';
import ExportMenu, { ExportFormat } from '@/components/ExportMenu';
import UsageBar from '@/components/account/UsageBar';
import { BOOK_SIZES, BookSize } from '@/utils/bookSizes';
import { generateBook, StyleProfile } from '@/utils/generateBook';
import { generateBackCoverImage, generateCoverImage } from '@/utils/imageGen';
import { exportCoverAsPng } from '@/utils/exportCovers';
import { exportToDocx } from '@/utils/exportDocx';
import { exportToEpub } from '@/utils/exportEpub';
import { exportToPdf } from '@/utils/exportPdf';
import { hydrateBook, useIllustrations } from '@/hooks/useIllustrations';
import { useDevice } from '@/hooks/use-device';
import { useKnowledge } from '@/knowledge/store';
import { useAuth } from '@/auth/AuthProvider';
import { useEntitlements } from '@/auth/useEntitlements';
import { supabase } from '@/integrations/supabase/client';
import { getTemplate } from '@/templates/catalog';
import { readCreationDraft } from '@/templates/store';
import { BOOK_THEMES, COVER_STYLES, FONT_LIBRARY, designDefaultsFor, fontById, styleById, themeById } from '@/templates/visualPreview';
import { toast } from 'sonner';

const PAGE_COUNTS = [20, 40, 60, 80, 120];
const LANGUAGES = [
  { id: 'thai', label: 'ไทย' },
  { id: 'english', label: 'English' },
];

const buttonBase = 'min-h-11 rounded-xl border px-3 text-sm font-ui transition-colors';

const BookStudioV2 = () => {
  const { isMobile } = useDevice();
  const illustrations = useIllustrations();
  const { activeSources, chatPayloadSources } = useKnowledge();
  const { consume, check, requireFeature, unrestricted } = useEntitlements();
  const { user, refresh, account, isAdmin } = useAuth();

  const [projectId, setProjectId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [pageCount, setPageCount] = useState(60);
  const [selectedSize, setSelectedSize] = useState<BookSize>(BOOK_SIZES[1]);
  const [designThemeId, setDesignThemeId] = useState('ai-technology');
  const [coverStyleId, setCoverStyleId] = useState('modern');
  const [fontId, setFontId] = useState('noto-sans-thai');
  const [language, setLanguage] = useState('thai');
  const [sourceMode, setSourceMode] = useState('source_ai');
  const [styleProfile, setStyleProfile] = useState<StyleProfile | null>(null);
  const [bookData, setBookData] = useState<any>(null);
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [backCoverImageUrl, setBackCoverImageUrl] = useState('');
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState('');
  const [illustrateAll, setIllustrateAll] = useState(false);
  const [current, setCurrent] = useState(0);
  const [progress, setProgress] = useState(0);
  const [progressText, setProgressText] = useState('');
  const [viewer, setViewer] = useState<{ url: string; caption: string } | null>(null);

  const selectedTheme = themeById(designThemeId);
  const selectedCoverStyle = styleById(coverStyleId);
  const selectedFont = fontById(fontId);
  const pages = useMemo(() => (bookData ? flattenBook(bookData) : []), [bookData]);
  const entry = pages[Math.min(current, Math.max(pages.length - 1, 0))];

  useEffect(() => {
    const draft = readCreationDraft();
    if (!draft) return;
    const template = getTemplate(draft.templateId);
    const defaults = designDefaultsFor(template);
    setTitle(draft.topic || template?.name || '');
    setPageCount(draft.pages || template?.defaultPageCount || 60);
    setLanguage(draft.language || 'thai');
    setDesignThemeId(defaults.themeId);
    setCoverStyleId(defaults.styleId);
    setFontId(defaults.fontId);
    setSourceMode(draft.sourceIds?.length ? 'source_ai' : 'creative');
    setStyleProfile({
      tone: draft.tone || template?.writingDNA.tone || 'ชัดเจน เป็นมิตร มืออาชีพ',
      complexity: template?.writingDNA.sentenceComplexity || 'medium',
      language: draft.language || 'thai',
      sentenceStyle: template?.writingDNA.paragraphLength || 'medium',
      characteristics: [`Template: ${template?.name ?? draft.templateId}`, `Audience: ${draft.audience}`],
      vocabularyLevel: template?.writingDNA.technicalLevel || 'intermediate',
      writingPersona: 'KIVORA AI Design Director',
      styleInstructions: `วางงานตามเทมเพลต ${template?.name ?? draft.templateId} และปรับภาษาให้เหมาะกับ ${draft.audience}`,
    });
  }, []);

  const applyAiDesign = () => {
    const lower = title.toLowerCase();
    const pick =
      lower.includes('เด็ก') || lower.includes('kids')
        ? { themeId: 'kids', styleId: 'kids', fontId: 'mitr', pages: 32 }
        : lower.includes('manga') || lower.includes('มังงะ') || lower.includes('comic')
          ? { themeId: 'dark-premium', styleId: 'manga', fontId: 'kanit', pages: 48 }
          : lower.includes('ธุรกิจ') || lower.includes('business') || lower.includes('marketing')
            ? { themeId: 'business', styleId: 'editorial', fontId: 'ibm-plex-sans-thai', pages: 80 }
            : lower.includes('วิจัย') || lower.includes('research') || lower.includes('academic')
              ? { themeId: 'academic', styleId: 'academic', fontId: 'noto-serif-thai', pages: 90 }
              : { themeId: 'ai-technology', styleId: 'modern', fontId: 'kanit', pages: 60 };
    setDesignThemeId(pick.themeId);
    setCoverStyleId(pick.styleId);
    setFontId(pick.fontId);
    if (!bookData) setPageCount(pick.pages);
    toast.success('AI Design Director เลือกชุดออกแบบให้แล้ว');
  };

  const designProfile = (): StyleProfile => ({
    tone: styleProfile?.tone || 'ชัดเจน เป็นมิตร มืออาชีพ',
    complexity: styleProfile?.complexity || 'medium',
    language,
    sentenceStyle: styleProfile?.sentenceStyle || 'balanced',
    characteristics: [
      ...(styleProfile?.characteristics ?? []),
      `Book theme: ${selectedTheme.name} - ${selectedTheme.description}`,
      `Cover style: ${selectedCoverStyle.name} - ${selectedCoverStyle.description}`,
      `Font pairing: ${selectedFont.name} - ${selectedFont.description}`,
    ],
    vocabularyLevel: styleProfile?.vocabularyLevel || 'intermediate',
    writingPersona: styleProfile?.writingPersona || 'KIVORA AI Design Director',
    styleInstructions: [
      styleProfile?.styleInstructions,
      `ออกแบบเป็นหนังสือจริง ใช้ mood ${selectedTheme.name}, cover composition ${selectedCoverStyle.composition}, font ${selectedFont.name}.`,
      'ภาษาไทยต้องอ่านง่าย หัวข้อไม่ทับกัน และแบ่งบทให้เหมาะกับการส่งออก PDF/EPUB.',
    ].filter(Boolean).join('\n'),
  });

  const handleGenerate = async () => {
    if (!title.trim()) {
      toast.error('กรุณากรอกหัวข้อหนังสือ');
      return;
    }
    if (!(await consume({ metric: 'aiPages', quantity: pageCount, operation: 'generate_book' }))) return;
    setGenerating(true);
    setBookData(null);
    setCoverImageUrl('');
    setBackCoverImageUrl('');
    setCurrent(0);
    illustrations.reset();

    try {
      setProgress(25);
      setProgressText('กำลังวางโครงสร้างและเขียนเนื้อหา...');
      const book = await generateBook(title, pageCount, language, designProfile(), chatPayloadSources(), sourceMode);
      if (!book) throw new Error('สร้างหนังสือไม่สำเร็จ');
      setBookData(book);
      setProgress(65);
      setProgressText('กำลังสร้างปกหน้าและปกหลัง...');
      if (await consume({ metric: 'aiImages', quantity: 2, operation: 'generate_covers' })) {
        const [front, back] = await Promise.all([generateCoverImage(book, selectedTheme.name), generateBackCoverImage(book)]);
        setCoverImageUrl(front);
        setBackCoverImageUrl(back);
      }
      setProgress(100);
      setProgressText('เสร็จแล้ว');
      toast.success('สร้างหนังสือสำเร็จ');
    } catch (err: any) {
      toast.error(err?.message || 'สร้างหนังสือไม่สำเร็จ');
    } finally {
      setGenerating(false);
    }
  };

  const saveProject = async () => {
    if (!bookData || !user) return;
    setSaving(true);
    const payload = {
      name: bookData.title || title || 'Untitled book',
      kind: 'book',
      cover_url: coverImageUrl || null,
      data: { bookData, size: selectedSize.id, designThemeId, coverStyleId, fontId, language, coverImageUrl, backCoverImageUrl },
    };
    const { error } = projectId
      ? await supabase.from('projects').update({ ...payload, updated_at: new Date().toISOString() }).eq('id', projectId)
      : await supabase.from('projects').insert({ ...payload, user_id: user.id }).select('id').single().then(res => {
          if (res.data) setProjectId(res.data.id);
          return { error: res.error };
        });
    setSaving(false);
    if (error) return toast.error('บันทึกโปรเจกต์ไม่สำเร็จ');
    refresh();
    toast.success('บันทึกโปรเจกต์แล้ว');
  };

  const handleIllustrateAll = async () => {
    if (!bookData || illustrateAll) return;
    const targets = Math.max(1, flattenBook(bookData).length);
    if (!(await consume({ metric: 'aiImages', quantity: targets, operation: 'illustrate_all' }))) return;
    setIllustrateAll(true);
    await illustrations.makeAll(bookData);
    setIllustrateAll(false);
    toast.success('สร้างภาพประกอบครบแล้ว');
  };

  const handleExport = async (format: ExportFormat) => {
    if (!bookData) return;
    const featureGate: Record<ExportFormat, { key: 'pdf' | 'docx' | 'epub'; label: string } | null> = {
      pdf: { key: 'pdf', label: 'ส่งออก PDF' },
      docx: { key: 'docx', label: 'ส่งออก Word (.docx)' },
      epub: { key: 'epub', label: 'ส่งออก EPUB' },
      png: null,
    };
    const gate = featureGate[format];
    if (gate && !requireFeature(gate.key, gate.label)) return;
    if (!(await check('exports'))) return;

    const hydrated = hydrateBook(bookData, illustrations.chapterImages, illustrations.pageImages);
    setExporting(format);
    try {
      if (format === 'docx') await exportToDocx(hydrated, selectedSize, coverImageUrl);
      else if (format === 'pdf') await exportToPdf(hydrated, selectedSize, { coverImageUrl, chapterImages: illustrations.chapterImages }, (_pct, label) => setProgressText(label));
      else if (format === 'epub') await exportToEpub(hydrated, { coverImageUrl, chapterImages: illustrations.chapterImages });
      else {
        await exportCoverAsPng('front-cover', 'front-cover.png');
        await exportCoverAsPng('back-cover', 'back-cover.png');
      }
      await consume({ metric: 'exports', operation: 'export_book', format, projectId });
      toast.success('ส่งออกสำเร็จ');
    } catch (err: any) {
      toast.error(`ส่งออกไม่สำเร็จ: ${err?.message || 'ไม่ทราบสาเหตุ'}`);
    } finally {
      setExporting('');
    }
  };

  const optionClass = (active: boolean) => `${buttonBase} ${active ? 'border-primary bg-primary/10 font-bold text-foreground' : 'border-border bg-background hover:bg-card'}`;

  const director = (
    <div className="flex flex-col gap-5 pb-4">
      <section>
        <div className="mb-2 flex items-center justify-between gap-2">
          <label className="block text-sm font-ui font-bold" htmlFor="book-topic">หัวข้อหนังสือ</label>
          <button type="button" onClick={applyAiDesign} className="rounded-full border border-primary/40 px-3 py-1.5 text-[11px] font-ui font-bold text-primary">
            ✨ ให้ AI เลือกให้
          </button>
        </div>
        <textarea id="book-topic" value={title} onChange={e => setTitle(e.target.value)} rows={3} placeholder="เช่น: สร้างคู่มือสอนใช้ AI สำหรับผู้สูงอายุ" className="w-full resize-none rounded-xl border border-border bg-background px-3 py-3 text-sm font-ui leading-relaxed focus:outline-none focus:ring-2 focus:ring-ring" />
        <div className="mt-3 rounded-xl border border-border bg-card p-3 text-[11px] font-ui leading-relaxed text-muted-foreground">
          <strong className="text-foreground">AI Design Director:</strong> {selectedSize.label} · {pageCount} หน้า · {selectedTheme.name} · {selectedCoverStyle.name} · {selectedFont.name}
        </div>
        {(unrestricted || isAdmin || account?.planCode === 'unlimited') && (
          <div className="mt-2 rounded-xl border border-primary/20 bg-primary/10 p-2 text-[11px] font-ui font-bold text-primary">
            UNLIMITED: สร้างหนังสือ พรีเซนเทชัน เทมเพลต และส่งออกได้ ไม่แสดงเครดิตหมด
          </div>
        )}
      </section>

      <section>
        <div className="mb-2 text-sm font-ui font-bold">จำนวนหน้า</div>
        <div className="flex flex-wrap gap-2">{PAGE_COUNTS.map(n => <button key={n} onClick={() => setPageCount(n)} className={optionClass(pageCount === n)}>{n}</button>)}</div>
      </section>

      <BookSizeSelector selected={selectedSize} onChange={setSelectedSize} />

      <section>
        <div className="mb-2 text-sm font-ui font-bold">ธีมสีหนังสือ</div>
        <div className="grid grid-cols-2 gap-2">
          {BOOK_THEMES.map(theme => (
            <button key={theme.id} type="button" onClick={() => setDesignThemeId(theme.id)} className={`min-h-[92px] rounded-xl border p-2 text-left ${designThemeId === theme.id ? 'border-primary bg-primary/10' : 'border-border bg-background'}`}>
              <span className={`mb-2 block h-8 rounded-lg bg-gradient-to-br ${theme.bg}`} />
              <span className="block text-xs font-ui font-bold">{theme.name}</span>
              <span className="mt-1 line-clamp-2 block text-[10px] font-ui leading-relaxed text-muted-foreground">{theme.description}</span>
            </button>
          ))}
        </div>
      </section>

      <section>
        <div className="mb-2 text-sm font-ui font-bold">รูปแบบการออกแบบปก</div>
        <div className="grid grid-cols-2 gap-2">
          {COVER_STYLES.map(style => (
            <button key={style.id} type="button" onClick={() => setCoverStyleId(style.id)} className={`rounded-xl border p-3 text-left ${coverStyleId === style.id ? 'border-primary bg-primary/10' : 'border-border bg-background'}`}>
              <span className="block text-xs font-ui font-bold">{style.name}</span>
              <span className="mt-1 line-clamp-2 block text-[10px] font-ui leading-relaxed text-muted-foreground">{style.description}</span>
            </button>
          ))}
        </div>
      </section>

      <section>
        <div className="mb-2 text-sm font-ui font-bold">ฟอนต์หนังสือ</div>
        <div className="grid gap-2">
          {FONT_LIBRARY.map(font => (
            <button key={font.id} type="button" onClick={() => setFontId(font.id)} className={`rounded-xl border p-3 text-left ${fontId === font.id ? 'border-primary bg-primary/10' : 'border-border bg-background'}`}>
              <span className="block text-sm font-bold" style={{ fontFamily: font.stack }}>{font.sample}</span>
              <span className="mt-1 block text-[10px] font-ui text-muted-foreground">{font.name} — {font.description}</span>
            </button>
          ))}
        </div>
      </section>

      <section>
        <div className="mb-2 text-sm font-ui font-bold">ภาษา</div>
        <div className="flex gap-2">{LANGUAGES.map(l => <button key={l.id} onClick={() => setLanguage(l.id)} className={`flex-1 ${optionClass(language === l.id)}`}>{l.label}</button>)}</div>
      </section>

      <section>
        <label className="mb-2 block text-sm font-ui font-bold" htmlFor="source-mode">ใช้คลังความรู้ ({activeSources.length} แหล่ง)</label>
        <select id="source-mode" value={sourceMode} onChange={e => setSourceMode(e.target.value)} className="min-h-11 w-full rounded-xl border border-border bg-background px-3 text-sm font-ui">
          <option value="source_only">ใช้แหล่งข้อมูลเท่านั้น (Source Lock สูง)</option>
          <option value="source_ai">แหล่งข้อมูลเป็นหลัก + AI เสริม</option>
          <option value="creative">สร้างสรรค์อิสระ</option>
        </select>
      </section>

      <StyleTemplateUploader onStyleExtracted={setStyleProfile} />

      {generating && (
        <div className="animate-fade-in">
          <div className="mb-1 text-xs font-ui text-muted-foreground">{progressText}</div>
          <div className="h-1.5 overflow-hidden rounded-full bg-accent"><div className="h-1.5 rounded-full bg-primary transition-all duration-500" style={{ width: `${progress}%` }} /></div>
        </div>
      )}

      <button onClick={handleGenerate} disabled={generating || !title.trim()} className={`flex min-h-12 w-full items-center justify-center gap-2 rounded-full text-sm font-ui font-bold ${generating || !title.trim() ? 'cursor-not-allowed bg-accent text-muted-foreground' : 'bg-gradient-ai text-primary-foreground shadow-md'}`}>
        <Sparkles className="h-4 w-4" /> {generating ? 'กำลังสร้าง...' : 'สร้างหนังสือ'}
      </button>

      {bookData && (
        <>
          <button onClick={handleIllustrateAll} disabled={illustrateAll} className="flex min-h-12 items-center justify-center gap-2 rounded-full border border-border bg-card text-sm font-ui font-bold disabled:opacity-60">
            <Wand2 className="h-4 w-4" /> {illustrateAll ? 'AI กำลังวาด...' : 'วาดภาพประกอบทุกส่วน'}
          </button>
          <button onClick={saveProject} disabled={saving} className="flex min-h-12 items-center justify-center gap-2 rounded-full border border-border bg-card text-sm font-ui font-bold disabled:opacity-60">
            <Save className="h-4 w-4" /> {saving ? 'กำลังบันทึก...' : projectId ? 'บันทึกการแก้ไข' : 'บันทึกเป็นโปรเจกต์'}
          </button>
          <UsageBar metric="aiPages" compact />
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm font-ui font-bold"><FileDown className="h-4 w-4" /> ส่งออก</div>
            <ExportMenu onExport={handleExport} busy={!!exporting} busyLabel="กำลังส่งออก..." fullWidth />
          </div>
        </>
      )}
    </div>
  );

  const navigator = bookData ? (
    <ul className="flex flex-col gap-1.5">
      {pages.map((p, i) => (
        <li key={p.id}>
          <button onClick={() => setCurrent(i)} className={`flex min-h-11 w-full items-center gap-2 rounded-xl border px-3 py-2 text-left text-sm font-ui ${i === current ? 'border-primary bg-accent font-bold' : 'border-border bg-card'}`}>
            <span className="w-6 shrink-0 text-xs text-muted-foreground">{i + 1}</span>
            <span className="line-clamp-2 min-w-0">{p.label}</span>
          </button>
        </li>
      ))}
    </ul>
  ) : (
    <p className="text-sm font-ui text-muted-foreground">ยังไม่มีหนังสือ กรอกหัวข้อหรือเลือกเทมเพลตจาก Library แล้วเริ่มสร้างได้เลย</p>
  );

  return (
    <>
      <StudioLayout
        title={bookData ? bookData.title : 'KIVORA Book Studio'}
        subtitle={bookData ? `${pages.length} หน้า · ${selectedSize.label}` : 'Template → Project Setup → Book Studio'}
        left={{ label: 'บท / หน้า', content: navigator }}
        right={{ label: 'AI Design Director', content: director }}
        headerActions={bookData && !isMobile ? <ExportMenu onExport={handleExport} busy={!!exporting} /> : undefined}
      >
        {bookData && entry ? (
          <ZoomPanCanvas
            contentWidth={selectedSize.pageWidth || 559}
            contentHeight={selectedSize.pageHeight || 794}
            label={`${current + 1}/${pages.length} · ${entry.label}`}
            onPrev={current > 0 ? () => setCurrent(c => Math.max(0, c - 1)) : undefined}
            onNext={current < pages.length - 1 ? () => setCurrent(c => Math.min(pages.length - 1, c + 1)) : undefined}
          >
            <BookPageCanvas entry={entry} bookData={bookData} bookSize={selectedSize} illustrations={illustrations} coverImageUrl={coverImageUrl} backCoverImageUrl={backCoverImageUrl} onOpenImage={(url, caption) => setViewer({ url, caption })} />
          </ZoomPanCanvas>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 overflow-y-auto p-6 text-center">
            <BookOpenCheck className="h-14 w-14 text-primary" />
            <h2 className="font-heading text-2xl font-bold leading-snug">พร้อมสร้างหนังสือของคุณ</h2>
            <p className="max-w-md text-sm font-body leading-relaxed text-muted-foreground">
              เลือกเทมเพลตแล้วระบบจะเติมค่ามาให้ หรือพิมพ์หัวข้อแล้วให้ AI Design Director เลือกขนาด ธีม ฟอนต์ และรูปแบบปกให้เอง
            </p>
            <div className="w-full max-w-md text-left xl:hidden">{director}</div>
          </div>
        )}
      </StudioLayout>

      {bookData && (
        <div aria-hidden className="pointer-events-none fixed -left-[9999px] top-0 w-[320px]">
          <CoverDesigner bookData={bookData} coverImageUrl={coverImageUrl} backCoverImageUrl={backCoverImageUrl} colorTheme={selectedTheme.name} onRegenerateCover={async () => setCoverImageUrl(await generateCoverImage(bookData, selectedTheme.name))} onRegenerateBack={async () => setBackCoverImageUrl(await generateBackCoverImage(bookData))} />
        </div>
      )}

      {viewer && <ImageViewer images={[viewer]} index={0} onIndexChange={() => {}} onClose={() => setViewer(null)} />}
    </>
  );
};

export default BookStudioV2;
