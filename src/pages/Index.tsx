import { useState } from 'react';
import { BookOpenCheck, Flower2, Settings2, Sparkles, Wand2, X } from 'lucide-react';
import { BOOK_SIZES, BookSize } from '@/utils/bookSizes';
import { generateBook, StyleProfile } from '@/utils/generateBook';
import { generateCoverImage, generateBackCoverImage } from '@/utils/imageGen';
import { exportToDocx } from '@/utils/exportDocx';
import { exportToPdf } from '@/utils/exportPdf';
import { exportToEpub } from '@/utils/exportEpub';
import { exportCoverAsPng } from '@/utils/exportCovers';
import { useIllustrations, hydrateBook } from '@/hooks/useIllustrations';
import { useIsMobile } from '@/hooks/use-mobile';
import { useKnowledge } from '@/knowledge/store';
import { Link } from 'react-router-dom';
import BookSizeSelector from '@/components/BookSizeSelector';
import StyleTemplateUploader from '@/components/StyleTemplateUploader';
import CoverDesigner from '@/components/CoverDesigner';
import BookPreview from '@/components/BookPreview';
import ExportMenu, { ExportFormat } from '@/components/ExportMenu';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  const isMobile = useIsMobile();
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
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [illustrateAll, setIllustrateAll] = useState(false);

  const handleGenerate = async () => {
    if (!title) {
      toast.error('กรุณากรอกหัวข้อหนังสือ');
      return;
    }
    setGenerating(true);
    setSettingsOpen(false);
    setBookData(null);
    setCoverImageUrl('');
    setBackCoverImageUrl('');
    illustrations.reset();

    try {
      setProgress(25);
      setProgressText('กำลังสร้างโครงสร้างและเนื้อหาหนังสือ...');
      const book = await generateBook(
        title,
        pageCount,
        language,
        styleProfile,
        chatPayloadSources(),
        sourceMode,
      );
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

  const settingsPanel = (
    <div className="flex flex-col gap-5 pb-6">
      {/* Topic */}
      <div>
        <label className="mb-1.5 block text-xs font-semibold font-ui text-foreground">หัวข้อหนังสือ</label>
        <textarea
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="เช่น: การลงทุนสำหรับมือใหม่"
          rows={2}
          className="w-full resize-none rounded-xl border border-border bg-background px-3 py-2.5 text-sm font-ui focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      {/* Page count */}
      <div>
        <div className="mb-2 text-xs font-semibold font-ui text-foreground">จำนวนหน้า</div>
        <div className="flex flex-wrap gap-2">
          {PAGE_COUNTS.map(n => (
            <button
              key={n}
              onClick={() => setPageCount(n)}
              className={`min-h-9 rounded-full border px-4 text-xs font-ui transition-all ${
                pageCount === n
                  ? 'border-primary bg-primary font-bold text-primary-foreground'
                  : 'border-border bg-background hover:bg-card'
              }`}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      <BookSizeSelector selected={selectedSize} onChange={setSelectedSize} />

      {/* Color theme */}
      <div>
        <div className="mb-2 text-xs font-semibold font-ui text-foreground">โทนสีปก</div>
        <div className="flex gap-3">
          {COLOR_THEMES.map(c => (
            <button
              key={c.color}
              onClick={() => setColorTheme(c.label)}
              aria-label={c.label}
              className="h-9 w-9 rounded-full transition-all"
              style={{
                background: c.color,
                border: colorTheme === c.label ? '3px solid hsl(var(--foreground))' : '2px solid transparent',
                boxShadow: colorTheme === c.label ? '0 0 0 2px hsl(var(--background))' : 'none',
              }}
            />
          ))}
        </div>
      </div>

      {/* Cover style */}
      <div>
        <div className="mb-2 text-xs font-semibold font-ui text-foreground">สไตล์ปก</div>
        <div className="flex flex-wrap gap-2">
          {COVER_STYLES.map(s => (
            <button
              key={s}
              onClick={() => setCoverStyle(s)}
              className={`min-h-9 rounded-full border px-3 text-xs font-ui transition-all ${
                coverStyle === s
                  ? 'border-primary bg-primary font-bold text-primary-foreground'
                  : 'border-border bg-background hover:bg-card'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Language */}
      <div>
        <div className="mb-2 text-xs font-semibold font-ui text-foreground">ภาษา</div>
        <div className="flex gap-2">
          {LANGUAGES.map(l => (
            <button
              key={l.id}
              onClick={() => setLanguage(l.id)}
              className={`min-h-9 flex-1 rounded-full border px-3 text-xs font-ui transition-all ${
                language === l.id
                  ? 'border-primary bg-primary font-bold text-primary-foreground'
                  : 'border-border bg-background hover:bg-card'
              }`}
            >
              {l.label}
            </button>
          ))}
        </div>
      </div>

      {/* Source grounding */}
      <div>
        <div className="mb-2 text-xs font-semibold font-ui text-foreground">
          ใช้คลังความรู้ ({activeSources.length} แหล่ง)
        </div>
        <select
          value={sourceMode}
          onChange={e => setSourceMode(e.target.value)}
          className="min-h-10 w-full rounded-xl border border-border bg-background px-3 text-xs font-ui"
        >
          <option value="source_only">ใช้แหล่งข้อมูลเท่านั้น (Source Lock: สูง)</option>
          <option value="source_ai">แหล่งข้อมูลเป็นหลัก + AI เสริม</option>
          <option value="creative">สร้างสรรค์อิสระ</option>
        </select>
      </div>

      <StyleTemplateUploader onStyleExtracted={setStyleProfile} />

      {generating && (
        <div className="animate-fade-in">
          <div className="mb-1 text-[11px] font-ui text-muted-foreground">{progressText}</div>
          <div className="h-1.5 overflow-hidden rounded-full bg-accent">
            <div className="h-1.5 rounded-full bg-primary transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
        </div>
      )}

      <button
        onClick={handleGenerate}
        disabled={generating || !title}
        className={`flex min-h-12 w-full items-center justify-center gap-2 rounded-full text-sm font-ui font-bold transition-all ${
          generating || !title
            ? 'cursor-not-allowed bg-accent text-muted-foreground'
            : 'bg-primary text-primary-foreground shadow-md hover:opacity-90'
        }`}
      >
        <Sparkles className="h-4 w-4" />
        {generating ? 'กำลังสร้าง...' : 'สร้าง E-Book'}
      </button>
    </div>
  );

  const previewScale = isMobile ? 0.52 : 0.65;

  const workspace = bookData ? (
    isMobile ? (
      <Tabs defaultValue="content" className="w-full">
        <TabsList className="sticky top-[57px] z-10 grid w-full grid-cols-2 rounded-none bg-secondary">
          <TabsTrigger value="cover" className="text-xs font-ui">ปกหนังสือ</TabsTrigger>
          <TabsTrigger value="content" className="text-xs font-ui">เนื้อหา</TabsTrigger>
        </TabsList>
        <TabsContent value="cover" className="mt-4 px-4">
          <CoverDesigner
            bookData={bookData}
            coverImageUrl={coverImageUrl}
            backCoverImageUrl={backCoverImageUrl}
            colorTheme={colorTheme}
            onRegenerateCover={handleRegenerateCover}
            onRegenerateBack={handleRegenerateBack}
          />
        </TabsContent>
        <TabsContent value="content" className="mt-4 px-3">
          <BookPreview bookData={bookData} bookSize={selectedSize} illustrations={illustrations} scale={previewScale} />
        </TabsContent>
      </Tabs>
    ) : (
      <div className="flex flex-wrap items-start justify-center gap-8 p-6 lg:justify-start">
        <CoverDesigner
          bookData={bookData}
          coverImageUrl={coverImageUrl}
          backCoverImageUrl={backCoverImageUrl}
          colorTheme={colorTheme}
          onRegenerateCover={handleRegenerateCover}
          onRegenerateBack={handleRegenerateBack}
        />
        <BookPreview bookData={bookData} bookSize={selectedSize} illustrations={illustrations} scale={previewScale} />
      </div>
    )
  ) : (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-6 text-center">
      <BookOpenCheck className="h-14 w-14 text-primary" />
      <h2 className="font-heading text-2xl font-bold text-foreground">พร้อมสร้าง E-Book ของคุณ</h2>
      <p className="max-w-xs text-sm font-ui text-muted-foreground">
        กรอกหัวข้อ เลือกขนาดเล่ม แล้วให้ AI เขียนเนื้อหา วาดภาพประกอบ และส่งออกเป็น Word, PDF หรือ EPUB
      </p>
      {isMobile && (
        <button
          onClick={() => setSettingsOpen(true)}
          className="flex min-h-12 items-center gap-2 rounded-full bg-primary px-6 text-sm font-ui font-bold text-primary-foreground shadow-md"
        >
          <Settings2 className="h-4 w-4" />
          เริ่มตั้งค่าหนังสือ
        </button>
      )}
    </div>
  );

  return (
    <div className="flex min-h-screen flex-col bg-background md:flex-row">
      {/* Desktop sidebar */}
      <aside className="hidden max-h-screen w-80 min-w-[320px] flex-col gap-5 overflow-y-auto border-r border-border bg-secondary p-5 md:flex">
        <div className="flex items-center gap-2">
          <Flower2 className="h-6 w-6 text-primary" />
          <Link to="/" className="font-heading text-lg font-bold text-foreground">PaperPetal AI</Link>
        </div>
        {settingsPanel}
      </aside>

      {/* Mobile settings sheet */}
      <Sheet open={settingsOpen} onOpenChange={setSettingsOpen}>
        <SheetContent side="bottom" className="max-h-[88vh] overflow-y-auto rounded-t-3xl bg-secondary px-4">
          <SheetHeader className="text-left">
            <SheetTitle className="font-heading text-base">ตั้งค่าหนังสือ</SheetTitle>
          </SheetHeader>
          <div className="mt-4">{settingsPanel}</div>
        </SheetContent>
      </Sheet>

      {/* Main */}
      <main className="flex flex-1 flex-col overflow-x-hidden">
        <header className="sticky top-0 z-20 flex items-center justify-between gap-2 border-b border-border bg-background/95 px-4 py-3 backdrop-blur md:px-6">
          <div className="flex min-w-0 items-center gap-2">
            <Link to="/" aria-label="กลับหน้าแรก"><Flower2 className="h-5 w-5 text-primary" /></Link>
            <div className="truncate font-heading text-sm font-bold text-foreground md:text-base">
              {bookData ? bookData.title : 'PaperPetal Write'}
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            {bookData && (
              <>
                <button
                  onClick={handleIllustrateAll}
                  disabled={illustrateAll}
                  className="flex min-h-9 items-center gap-1.5 rounded-full border border-border bg-card px-3 text-xs font-ui font-semibold transition-colors hover:bg-accent disabled:opacity-60"
                >
                  <Wand2 className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">{illustrateAll ? 'AI กำลังวาด...' : 'วาดภาพทุกส่วน'}</span>
                </button>
                {!isMobile && <ExportMenu onExport={handleExport} busy={!!exporting} busyLabel="กำลังส่งออก..." />}
              </>
            )}
            <button
              onClick={() => setSettingsOpen(true)}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card md:hidden"
              aria-label="ตั้งค่า"
            >
              {settingsOpen ? <X className="h-4 w-4" /> : <Settings2 className="h-4 w-4" />}
            </button>
          </div>
        </header>

        <div className="flex-1 pb-24 md:pb-0">{workspace}</div>

        {/* Mobile bottom action bar */}
        {bookData && isMobile && (
          <div className="fixed bottom-0 left-0 right-0 z-30 flex gap-2 border-t border-border bg-background/95 p-3 backdrop-blur">
            <button
              onClick={() => setSettingsOpen(true)}
              className="flex min-h-12 flex-1 items-center justify-center gap-2 rounded-full border border-border bg-card text-xs font-ui font-bold"
            >
              <Settings2 className="h-4 w-4" />
              ตั้งค่า
            </button>
            <div className="flex-1">
              <ExportMenu onExport={handleExport} busy={!!exporting} fullWidth />
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
