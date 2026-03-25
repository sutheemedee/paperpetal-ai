import { useState } from 'react';
import { BOOK_SIZES, BookSize } from '@/utils/bookSizes';
import { generateBook, StyleProfile } from '@/utils/generateBook';
import { buildCoverImageUrl, buildBackCoverImageUrl } from '@/utils/imageGen';
import { exportToDocx } from '@/utils/exportDocx';
import { exportCoverAsPng } from '@/utils/exportCovers';
import BookSizeSelector from '@/components/BookSizeSelector';
import StyleTemplateUploader from '@/components/StyleTemplateUploader';
import CoverDesigner from '@/components/CoverDesigner';
import BookPreview from '@/components/BookPreview';
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
  const [exporting, setExporting] = useState(false);

  const handleGenerate = async () => {
    if (!title) {
      toast.error('กรุณากรอกหัวข้อหนังสือ');
      return;
    }
    setGenerating(true);
    setBookData(null);

    try {
      setProgress(30);
      setProgressText('กำลังสร้างโครงสร้างและเนื้อหาหนังสือ...');
      const book = await generateBook(title, pageCount, language, styleProfile);
      if (!book) {
        toast.error('ไม่สามารถสร้างหนังสือได้ กรุณาลองใหม่');
        setGenerating(false);
        return;
      }

      setProgress(70);
      setProgressText('กำลังสร้างภาพปก...');
      setBookData(book);
      setCoverImageUrl(buildCoverImageUrl(book, colorTheme));
      setBackCoverImageUrl(buildBackCoverImageUrl(book));

      setProgress(100);
      setProgressText('เสร็จสิ้น ✓');
      toast.success('สร้าง E-Book สำเร็จ!');
    } catch (err: any) {
      toast.error(`เกิดข้อผิดพลาด: ${err.message || 'ไม่ทราบสาเหตุ'}`);
    }
    setGenerating(false);
  };

  const handleExportDocx = async () => {
    if (!bookData) return;
    setExporting(true);
    try {
      await exportToDocx(bookData, selectedSize, coverImageUrl);
      toast.success('ดาวน์โหลด .docx สำเร็จ!');
    } catch {
      toast.error('ไม่สามารถส่งออก .docx ได้');
    }
    setExporting(false);
  };

  const handleExportCovers = async () => {
    try {
      await exportCoverAsPng('front-cover', 'front-cover.png');
      await exportCoverAsPng('back-cover', 'back-cover.png');
      toast.success('บันทึกปก PNG สำเร็จ!');
    } catch {
      toast.error('ไม่สามารถบันทึกปกได้');
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <div className="w-80 min-w-[320px] border-r border-border bg-secondary flex flex-col p-5 gap-5 overflow-y-auto max-h-screen">
        <div className="flex items-center gap-2">
          <span className="text-2xl">📚</span>
          <h1 className="text-lg font-heading font-bold text-foreground">AI E-Book Generator</h1>
        </div>

        {/* Topic */}
        <div>
          <label className="text-xs font-semibold font-ui text-foreground mb-1 block">หัวข้อหนังสือ</label>
          <textarea
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="เช่น: การลงทุนสำหรับมือใหม่"
            rows={2}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs font-ui resize-none focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        {/* Page Count */}
        <div>
          <div className="text-xs font-semibold font-ui text-foreground mb-2">จำนวนหน้า</div>
          <div className="flex gap-1.5 flex-wrap">
            {PAGE_COUNTS.map(n => (
              <button
                key={n}
                onClick={() => setPageCount(n)}
                className={`rounded-md px-3 py-1 text-xs font-ui cursor-pointer transition-all border ${
                  pageCount === n
                    ? 'bg-primary border-primary font-bold text-primary-foreground'
                    : 'bg-background border-border hover:bg-card'
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        {/* Book Size */}
        <BookSizeSelector selected={selectedSize} onChange={setSelectedSize} />

        {/* Color Theme */}
        <div>
          <div className="text-xs font-semibold font-ui text-foreground mb-2">โทนสีปก</div>
          <div className="flex gap-2">
            {COLOR_THEMES.map(c => (
              <div
                key={c.color}
                onClick={() => setColorTheme(c.label)}
                className="w-7 h-7 rounded-full cursor-pointer transition-all"
                style={{
                  background: c.color,
                  border: colorTheme === c.label ? '3px solid hsl(var(--foreground))' : '2px solid transparent',
                  boxShadow: colorTheme === c.label ? '0 0 0 2px hsl(var(--background))' : 'none',
                }}
                title={c.label}
              />
            ))}
          </div>
        </div>

        {/* Cover Style */}
        <div>
          <div className="text-xs font-semibold font-ui text-foreground mb-2">สไตล์ปก</div>
          <div className="flex gap-1.5">
            {COVER_STYLES.map(s => (
              <button
                key={s}
                onClick={() => setCoverStyle(s)}
                className={`rounded-md px-2.5 py-1 text-[10px] font-ui cursor-pointer transition-all border ${
                  coverStyle === s
                    ? 'bg-primary border-primary font-bold text-primary-foreground'
                    : 'bg-background border-border hover:bg-card'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Language */}
        <div>
          <div className="text-xs font-semibold font-ui text-foreground mb-2">ภาษา</div>
          <div className="flex gap-1.5">
            {LANGUAGES.map(l => (
              <button
                key={l.id}
                onClick={() => setLanguage(l.id)}
                className={`rounded-md px-3 py-1 text-xs font-ui cursor-pointer transition-all border ${
                  language === l.id
                    ? 'bg-primary border-primary font-bold text-primary-foreground'
                    : 'bg-background border-border hover:bg-card'
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>
        </div>

        {/* Style Template */}
        <StyleTemplateUploader onStyleExtracted={setStyleProfile} />

        {/* Progress */}
        {generating && (
          <div className="animate-fade-in">
            <div className="text-[11px] font-ui text-muted-foreground mb-1">{progressText}</div>
            <div className="bg-accent rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-primary rounded-full h-1.5 transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Generate Button */}
        <button
          onClick={handleGenerate}
          disabled={generating || !title}
          className={`w-full rounded-full py-3 text-sm font-ui font-bold transition-all ${
            generating || !title
              ? 'bg-accent text-muted-foreground cursor-not-allowed'
              : 'bg-primary text-primary-foreground cursor-pointer hover:opacity-90 shadow-md'
          }`}
        >
          {generating ? '⏳ กำลังสร้าง...' : '✦ สร้าง E-Book'}
        </button>
      </div>

      {/* Main Preview Area */}
      <div className="flex-1 flex flex-col overflow-y-auto">
        {/* Top Bar */}
        <div className="sticky top-0 z-10 border-b border-border bg-background px-6 py-3 flex items-center justify-between">
          <div className="font-heading font-bold text-base text-foreground">
            {bookData ? `📖 ${bookData.title}` : 'AI E-Book Generator'}
          </div>
          {bookData && (
            <div className="flex gap-2">
              <button
                onClick={handleExportDocx}
                disabled={exporting}
                className="rounded-lg border border-border bg-card px-4 py-1.5 text-xs font-ui font-bold cursor-pointer hover:bg-accent transition-colors disabled:opacity-50"
              >
                {exporting ? '⏳ กำลังส่งออก...' : '⬇ ดาวน์โหลด .docx'}
              </button>
              <button
                onClick={handleExportCovers}
                className="rounded-lg border border-border bg-card px-4 py-1.5 text-xs font-ui cursor-pointer hover:bg-accent transition-colors"
              >
                🖼 บันทึกปก PNG
              </button>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-6">
          {bookData ? (
            <div className="flex gap-8 items-start flex-wrap justify-center lg:justify-start">
              <CoverDesigner
                bookData={bookData}
                coverImageUrl={coverImageUrl}
                backCoverImageUrl={backCoverImageUrl}
                colorTheme={colorTheme}
                onRegenerateCover={() => setCoverImageUrl(buildCoverImageUrl(bookData, colorTheme))}
                onRegenerateBack={() => setBackCoverImageUrl(buildBackCoverImageUrl(bookData))}
              />
              <BookPreview bookData={bookData} bookSize={selectedSize} />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
              <div className="text-6xl">📚</div>
              <h2 className="font-heading text-2xl font-bold text-foreground">พร้อมสร้าง E-Book ของคุณ</h2>
              <p className="text-sm font-ui text-muted-foreground">กรอกหัวข้อและกด "สร้าง E-Book" ได้เลย</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;
