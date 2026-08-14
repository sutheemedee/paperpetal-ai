import { useMemo, useState } from 'react';
import { BookOpenCheck, Sparkles, Wand2 } from 'lucide-react';
import { BOOK_SIZES, BookSize } from '@/utils/bookSizes';
import { generateBook, StyleProfile } from '@/utils/generateBook';
import { generateCoverImage, generateBackCoverImage } from '@/utils/imageGen';
import { exportToDocx } from '@/utils/exportDocx';
import { exportToPdf } from '@/utils/exportPdf';
import { exportToEpub } from '@/utils/exportEpub';
import { exportCoverAsPng } from '@/utils/exportCovers';
import { useIllustrations, hydrateBook } from '@/hooks/useIllustrations';
import { useDevice } from '@/hooks/use-device';
import { useKnowledge } from '@/knowledge/store';
import BookSizeSelector from '@/components/BookSizeSelector';
import StyleTemplateUploader from '@/components/StyleTemplateUploader';
import CoverDesigner from '@/components/CoverDesigner';
import ExportMenu, { ExportFormat } from '@/components/ExportMenu';
import StudioLayout from '@/components/studio/StudioLayout';
import ZoomPanCanvas from '@/components/studio/ZoomPanCanvas';
import ImageViewer from '@/components/studio/ImageViewer';
import BookPageCanvas, { flattenBook } from '@/components/studio/bookPages';
import { toast } from 'sonner';

const PAGE_COUNTS = [10, 20, 30, 50, 100];
const COLOR_THEMES = [
  { color: '#FFD600', label: 'yellow and gold' },
  { color: '#4FC3F7', label: 'blue and sky' },
  { color: '#A5D6A7', label: 'green and nature' },
  { color: '#EF9A9A', label: 'red and rose' },
  { color: '#CE93D8', label: 'purple and violet' },
];
const COVER_STYLES = ['Modern', 'Minimal', 'Bold', 'Elegant'];
const LANGUAGES = [
  { id: 'thai', label: 'ไทย' },
  { id: 'english', label: 'English' },
];

const Index = () => {
  const { isMobile } = useDevice();
  const illustrations = useIllustrations();
  const { activeSources, chatPayloadSources } = useKnowledge();
  const [sourceMode, setSourceMode] = useState('source_ai');

  const [title, setTitle] = useState('');
  const [pageCount, setPageCount] = useState(20);
  const [selectedSize, setSelectedSize] = useState<BookSize>(BOOK_SIZES[1]);
  const [colorTheme, setColorTheme] = useState('yellow and gold');
  const [coverStyle, setCoverStyle] = useState('Modern');
  const [language, setLanguage] = useState('thai');
  const [styleProfile, setStyleProfile] = useState<StyleProfile | null>(null);
  const [bookData, setBookData] = useState<any>(null);
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [backCoverImageUrl, setBackCoverImageUrl] = useState('');
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressText, setProgressText] = useState('');
  const [exporting, setExporting] = useState('');
  const [illustrateAll, setIllustrateAll] = useState(false);
  const [current, setCurrent] = useState(0);
  const [viewer, setViewer] = useState<{ url: string; caption: string } | null>(null);

  const pages = useMemo(() => (bookData ? flattenBook(bookData) : []), [bookData]);
  const entry = pages[Math.min(current, Math.max(pages.length - 1, 0))];

  const handleGenerate = async () => {
    if (!title) {
      toast.error('กรุณากรอกหัวข้อหนังสือ');
      return;
    }
    setGenerating(true);
    setBookData(null);
    setCoverImageUrl('');
    setBackCoverImageUrl('');
    setCurrent(0);
    illustrations.reset();

    try {
      setProgress(25);
      setProgressText('กำลังสร้างโครงสร้างและเนื้อหาหนังสือ...');
      const book = await generateBook(title, pageCount, language, styleProfile, chatPayloadSources(), sourceMode);
      if (!book) {
        toast.error('ไม่สามารถสร้างหนังสือได้ กรุณาลองใหม่');
        setGenerating(false);
        return;
      }

      setProgress(60);
      setProgressText('กำลังสร้างภาพปกด้วย AI...');
      setBookData(book);

      const [coverUrl, backUrl] = await Promise.all([
        generateCoverImage(book, colorTheme),
        generateBackCoverImage(book),
      ]);
      setCoverImageUrl(coverUrl);
      setBackCoverImageUrl(backUrl);

      setProgress(100);
      setProgressText('เสร็จสิ้น ✓');
      toast.success('สร้าง E-Book สำเร็จ!');
    } catch (err: any) {
      toast.error(`เกิดข้อผิดพลาด: ${err.message || 'ไม่ทราบสาเหตุ'}`);
    }
    setGenerating(false);
  };

  const handleIllustrateAll = async () => {
    if (!bookData || illustrateAll) return;
    setIllustrateAll(true);
    toast.info('AI กำลังวาดภาพประกอบทุกส่วน อาจใช้เวลาสักครู่');
    await illustrations.makeAll(bookData);
    setIllustrateAll(false);
    toast.success('วาดภาพประกอบครบทุกส่วนแล้ว!');
  };

  const handleRegenerateCover = async () => {
    if (!bookData) return;
    setCoverImageUrl('');
    setCoverImageUrl(await generateCoverImage(bookData, colorTheme));
  };

  const handleRegenerateBack = async () => {
    if (!bookData) return;
    setBackCoverImageUrl('');
    setBackCoverImageUrl(await generateBackCoverImage(bookData));
  };

  const handleExport = async (format: ExportFormat) => {
    if (!bookData) return;
    const hydrated = hydrateBook(bookData, illustrations.chapterImages, illustrations.pageImages);
    setExporting(format);
    try {
      if (format === 'docx') {
        await exportToDocx(hydrated, selectedSize, coverImageUrl);
        toast.success('ดาวน์โหลด Word (.docx) สำเร็จ!');
      } else if (format === 'pdf') {
        await exportToPdf(
          hydrated,
          selectedSize,
          { coverImageUrl, chapterImages: illustrations.chapterImages },
          (_pct, label) => setProgressText(label),
        );
        toast.success('ดาวน์โหลด PDF สำเร็จ!');
      } else if (format === 'epub') {
        await exportToEpub(hydrated, { coverImageUrl, chapterImages: illustrations.chapterImages });
        toast.success('ดาวน์โหลด E-Book (.epub) สำเร็จ!');
      } else {
        await exportCoverAsPng('front-cover', 'front-cover.png');
        await exportCoverAsPng('back-cover', 'back-cover.png');
        toast.success('บันทึกปก PNG สำเร็จ!');
      }
    } catch (err: any) {
      toast.error(`ส่งออกไม่สำเร็จ: ${err?.message || 'ไม่ทราบสาเหตุ'}`);
    }
    setExporting('');
  };

  const chip = (active: boolean) =>
    `min-h-11 rounded-full border px-4 text-sm font-ui transition-all ${
      active
        ? 'border-primary bg-primary font-bold text-primary-foreground'
        : 'border-border bg-background hover:bg-card'
    }`;

  const director = (
    <div className="flex flex-col gap-5 pb-4">
      <div>
        <label className="mb-1.5 block text-sm font-semibold font-ui" htmlFor="book-topic">หัวข้อหนังสือ</label>
        <textarea
          id="book-topic"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="เช่น: การลงทุนสำหรับมือใหม่"
          rows={2}
          className="w-full resize-none rounded-xl border border-border bg-background px-3 py-3 text-base font-ui focus:outline-none focus:ring-2 focus:ring-ring md:text-sm"
        />
      </div>

      <div>
        <div className="mb-2 text-sm font-semibold font-ui">จำนวนหน้า</div>
        <div className="flex flex-wrap gap-2">
          {PAGE_COUNTS.map(n => (
            <button key={n} onClick={() => setPageCount(n)} className={chip(pageCount === n)}>{n}</button>
          ))}
        </div>
      </div>

      <BookSizeSelector selected={selectedSize} onChange={setSelectedSize} />

      <div>
        <div className="mb-2 text-sm font-semibold font-ui">โทนสีปก</div>
        <div className="flex flex-wrap gap-3">
          {COLOR_THEMES.map(c => (
            <button
              key={c.color}
              onClick={() => setColorTheme(c.label)}
              aria-label={c.label}
              className="h-11 w-11 rounded-full"
              style={{
                background: c.color,
                border: colorTheme === c.label ? '3px solid hsl(var(--foreground))' : '2px solid transparent',
              }}
            />
          ))}
        </div>
      </div>

      <div>
        <div className="mb-2 text-sm font-semibold font-ui">สไตล์ปก</div>
        <div className="flex flex-wrap gap-2">
          {COVER_STYLES.map(s => (
            <button key={s} onClick={() => setCoverStyle(s)} className={chip(coverStyle === s)}>{s}</button>
          ))}
        </div>
      </div>

      <div>
        <div className="mb-2 text-sm font-semibold font-ui">ภาษา</div>
        <div className="flex gap-2">
          {LANGUAGES.map(l => (
            <button key={l.id} onClick={() => setLanguage(l.id)} className={`flex-1 ${chip(language === l.id)}`}>
              {l.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold font-ui" htmlFor="source-mode">
          ใช้คลังความรู้ ({activeSources.length} แหล่ง)
        </label>
        <select
          id="source-mode"
          value={sourceMode}
          onChange={e => setSourceMode(e.target.value)}
          className="min-h-11 w-full rounded-xl border border-border bg-background px-3 text-sm font-ui"
        >
          <option value="source_only">ใช้แหล่งข้อมูลเท่านั้น (Source Lock: สูง)</option>
          <option value="source_ai">แหล่งข้อมูลเป็นหลัก + AI เสริม</option>
          <option value="creative">สร้างสรรค์อิสระ</option>
        </select>
      </div>

      <StyleTemplateUploader onStyleExtracted={setStyleProfile} />

      {generating && (
        <div className="animate-fade-in">
          <div className="mb-1 text-xs font-ui text-muted-foreground">{progressText}</div>
          <div className="h-1.5 overflow-hidden rounded-full bg-accent">
            <div className="h-1.5 rounded-full bg-primary transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
        </div>
      )}

      <button
        onClick={handleGenerate}
        disabled={generating || !title}
        className={`flex min-h-12 w-full items-center justify-center gap-2 rounded-full text-sm font-ui font-bold ${
          generating || !title ? 'cursor-not-allowed bg-accent text-muted-foreground' : 'bg-primary text-primary-foreground shadow-md'
        }`}
      >
        <Sparkles className="h-4 w-4" />
        {generating ? 'กำลังสร้าง...' : 'สร้าง E-Book'}
      </button>

      {bookData && (
        <>
          <button
            onClick={handleIllustrateAll}
            disabled={illustrateAll}
            className="flex min-h-12 items-center justify-center gap-2 rounded-full border border-border bg-card text-sm font-ui font-bold disabled:opacity-60"
          >
            <Wand2 className="h-4 w-4" />
            {illustrateAll ? 'AI กำลังวาด...' : 'วาดภาพประกอบทุกส่วน'}
          </button>
          <div>
            <div className="mb-2 text-sm font-semibold font-ui">ส่งออก · ตรวจแล้วพร้อมเผยแพร่</div>
            <ExportMenu onExport={handleExport} busy={!!exporting} busyLabel="กำลังส่งออก..." fullWidth />
            <ul className="mt-2 space-y-1 text-xs font-ui text-muted-foreground">
              <li>PDF · DOCX · EPUB · PNG ปก {bookData ? '✓ พร้อม' : ''}</li>
              <li>{pages.length} หน้าในเล่ม · {Object.keys(illustrations.pageImages).length} ภาพประกอบ</li>
            </ul>
          </div>
        </>
      )}
    </div>
  );

  const navigator = bookData ? (
    <ul className="flex flex-col gap-1.5">
      {pages.map((p, i) => (
        <li key={p.id}>
          <button
            onClick={() => setCurrent(i)}
            className={`flex min-h-11 w-full items-center gap-2 rounded-xl border px-3 py-2 text-left text-sm font-ui ${
              i === current ? 'border-primary bg-accent font-bold' : 'border-border bg-card'
            }`}
          >
            <span className="w-6 shrink-0 text-xs text-muted-foreground">{i + 1}</span>
            <span className="line-clamp-2 min-w-0">{p.label}</span>
          </button>
        </li>
      ))}
    </ul>
  ) : (
    <p className="text-sm font-ui text-muted-foreground">ยังไม่มีหนังสือ — กรอกหัวข้อใน AI Director แล้วกดสร้าง</p>
  );

  return (
    <>
      <StudioLayout
        title={bookData ? bookData.title : 'PaperPetal Write'}
        subtitle={bookData ? `${pages.length} หน้า · ${selectedSize.label}` : 'หนังสือ · eBook · คู่มือ'}
        left={{ label: 'บท / หน้า', content: navigator }}
        right={{ label: 'AI Director', content: director }}
        headerActions={
          bookData && !isMobile ? <ExportMenu onExport={handleExport} busy={!!exporting} /> : undefined
        }
      >
        {bookData && entry ? (
          <ZoomPanCanvas
            contentWidth={selectedSize.pageWidth || 559}
            contentHeight={selectedSize.pageHeight || 794}
            label={`${current + 1}/${pages.length} · ${entry.label}`}
            onPrev={current > 0 ? () => setCurrent(c => Math.max(0, c - 1)) : undefined}
            onNext={current < pages.length - 1 ? () => setCurrent(c => Math.min(pages.length - 1, c + 1)) : undefined}
          >
            <BookPageCanvas
              entry={entry}
              bookData={bookData}
              bookSize={selectedSize}
              illustrations={illustrations}
              coverImageUrl={coverImageUrl}
              backCoverImageUrl={backCoverImageUrl}
              onOpenImage={(url, caption) => setViewer({ url, caption })}
            />
          </ZoomPanCanvas>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 overflow-y-auto p-6 text-center">
            <BookOpenCheck className="h-14 w-14 text-primary" />
            <h2 className="font-heading text-2xl font-bold">พร้อมสร้าง E-Book ของคุณ</h2>
            <p className="max-w-sm text-sm font-body text-muted-foreground">
              กรอกหัวข้อ เลือกขนาดเล่ม แล้วให้ AI เขียนเนื้อหา วาดภาพประกอบ และส่งออกเป็น Word, PDF หรือ EPUB
            </p>
            <div className="w-full max-w-md text-left xl:hidden">{director}</div>
          </div>
        )}
      </StudioLayout>

      {/* off-screen cover artboards keep PNG export working on every device */}
      {bookData && (
        <div aria-hidden className="pointer-events-none fixed -left-[9999px] top-0 w-[320px]">
          <CoverDesigner
            bookData={bookData}
            coverImageUrl={coverImageUrl}
            backCoverImageUrl={backCoverImageUrl}
            colorTheme={colorTheme}
            onRegenerateCover={handleRegenerateCover}
            onRegenerateBack={handleRegenerateBack}
          />
        </div>
      )}

      {viewer && (
        <ImageViewer
          images={[viewer]}
          index={0}
          onIndexChange={() => {}}
          onClose={() => setViewer(null)}
        />
      )}
    </>
  );
};

export default Index;
