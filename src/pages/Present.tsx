import { useState } from 'react';
import { Download, Loader2, Maximize2, Presentation, Wand2, X } from 'lucide-react';
import StudioLayout from '@/components/studio/StudioLayout';
import ZoomPanCanvas from '@/components/studio/ZoomPanCanvas';
import { useKnowledge } from '@/knowledge/store';
import { useDevice } from '@/hooks/use-device';
import { supabase } from '@/integrations/supabase/client';
import { generateImage } from '@/utils/imageGen';
import { exportToPptx, Deck } from '@/utils/exportPptx';
import { toast } from 'sonner';

const SLIDE_COUNTS = [10, 20, 30, 40, 80];
const PRESETS = ['Business', 'Technology', 'Teaching', 'Course', 'Pitch Deck', 'Research', 'Academic', 'Workshop', 'Keynote', 'Marketing', 'Minimal', 'Dark Tech', 'Children'];
const TONES = ['Modern Technology', 'Professional', 'Friendly', 'Luxury', 'Creative', 'Minimal'];

const SLIDE_W = 1280;
const SLIDE_H = 720;

const Present = () => {
  const { activeSources, chatPayloadSources } = useKnowledge();
  const { isMobile } = useDevice();
  const [topic, setTopic] = useState('');
  const [slideCount, setSlideCount] = useState(20);
  const [preset, setPreset] = useState('Teaching');
  const [tone, setTone] = useState('Modern Technology');
  const [audience, setAudience] = useState('ผู้เริ่มต้น');
  const [notesLevel, setNotesLevel] = useState('short');
  const [sourceMode, setSourceMode] = useState('source_ai');
  const [deck, setDeck] = useState<Deck | null>(null);
  const [busy, setBusy] = useState('');
  const [current, setCurrent] = useState(0);
  const [presentMode, setPresentMode] = useState(false);
  const [notesOpen, setNotesOpen] = useState(true);

  const generate = async () => {
    if (!topic.trim()) return toast.error('กรุณากรอกหัวข้อพรีเซนเทชัน');
    setBusy('deck');
    setDeck(null);
    try {
      const { data, error } = await supabase.functions.invoke('generate-presentation', {
        body: {
          topic, slideCount, presetType: preset, tone, audience, notesLevel, sourceMode,
          language: 'thai', sources: chatPayloadSources(),
        },
      });
      if (error) throw new Error(error.message);
      if (data?.error) throw new Error(data.error);
      setDeck(data);
      setCurrent(0);
      toast.success(`สร้าง ${data.slides?.length || 0} สไลด์สำเร็จ`);
    } catch (e: any) {
      toast.error(e?.message || 'สร้างพรีเซนเทชันไม่สำเร็จ');
    }
    setBusy('');
  };

  const illustrate = async () => {
    if (!deck) return;
    setBusy('images');
    const slides = [...deck.slides];
    for (let i = 0; i < slides.length; i++) {
      const v: any = (slides[i] as any).visual;
      if (!v?.prompt || v.kind === 'none' || (slides[i] as any).imageUrl) continue;
      const url = await generateImage(
        `${v.prompt}. Style: ${tone} presentation ${v.kind}, 16:9 composition, clean, no text overlay.`,
      );
      if (url) {
        slides[i] = { ...slides[i], imageUrl: url };
        setDeck({ ...deck, slides: [...slides] });
      }
    }
    setBusy('');
    toast.success('สร้างภาพประกอบสไลด์เสร็จแล้ว');
  };

  const exportPptx = async () => {
    if (!deck) return;
    setBusy('export');
    try {
      await exportToPptx(deck, `${deck.title || 'presentation'}.pptx`);
      toast.success('ดาวน์โหลด PPTX (แก้ไขได้) สำเร็จ');
    } catch (e: any) {
      toast.error(e?.message || 'ส่งออกไม่สำเร็จ');
    }
    setBusy('');
  };

  const slides = deck?.slides || [];
  const slide = slides[current];

  const chip = (active: boolean) =>
    `min-h-11 rounded-full border px-4 text-sm font-ui ${
      active ? 'border-primary bg-primary font-bold text-primary-foreground' : 'border-border bg-background'
    }`;

  const slideCanvas = slide && (
    <div className="flex flex-col bg-background p-14 shadow-[var(--shadow-card)]" style={{ width: SLIDE_W, height: SLIDE_H }}>
      <div className="mb-3 h-2 w-24 bg-primary" />
      <h2 className="font-heading text-5xl font-bold leading-tight">{slide.title}</h2>
      {slide.subtitle && <p className="mt-2 font-ui text-2xl text-muted-foreground">{slide.subtitle}</p>}
      <div className="mt-8 flex min-h-0 flex-1 gap-8">
        <div className="min-w-0 flex-1">
          {slide.bullets?.length ? (
            <ul className="list-disc space-y-3 pl-6 font-body text-2xl">
              {slide.bullets.map((b, i) => <li key={i}>{b}</li>)}
            </ul>
          ) : (
            <p className="font-body text-2xl">{slide.body}</p>
          )}
        </div>
        {(slide as any).imageUrl && (
          <img src={(slide as any).imageUrl} alt={slide.title || 'ภาพประกอบสไลด์'} className="h-full w-[420px] shrink-0 rounded-2xl object-cover" />
        )}
      </div>
      {!!slide.citations?.length && (
        <p className="mt-4 font-ui text-base text-muted-foreground">{slide.citations.join('  ')}</p>
      )}
    </div>
  );

  const director = (
    <div className="flex flex-col gap-4 pb-4">
      <textarea
        value={topic}
        onChange={e => setTopic(e.target.value)}
        rows={2}
        placeholder="เช่น: สอนใช้ AI สร้างคอนเทนต์สำหรับผู้เริ่มต้น"
        className="w-full resize-none rounded-xl border border-border bg-background px-3 py-3 text-base font-ui focus:outline-none focus:ring-2 focus:ring-ring md:text-sm"
      />
      <div>
        <div className="mb-2 text-sm font-semibold font-ui">จำนวนสไลด์</div>
        <div className="flex flex-wrap gap-2">
          {SLIDE_COUNTS.map(n => (
            <button key={n} onClick={() => setSlideCount(n)} className={chip(slideCount === n)}>{n}</button>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <select value={preset} onChange={e => setPreset(e.target.value)} className="min-h-11 rounded-xl border border-border bg-background px-3 text-sm font-ui">
          {PRESETS.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
        <select value={tone} onChange={e => setTone(e.target.value)} className="min-h-11 rounded-xl border border-border bg-background px-3 text-sm font-ui">
          {TONES.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
        <input
          value={audience}
          onChange={e => setAudience(e.target.value)}
          placeholder="ผู้ฟัง"
          className="min-h-11 rounded-xl border border-border bg-background px-3 text-sm font-ui"
        />
        <select value={notesLevel} onChange={e => setNotesLevel(e.target.value)} className="min-h-11 rounded-xl border border-border bg-background px-3 text-sm font-ui">
          <option value="short">โน้ตผู้บรรยายแบบสั้น</option>
          <option value="detailed">โน้ตละเอียด</option>
          <option value="script">สคริปต์เต็ม</option>
        </select>
        <select value={sourceMode} onChange={e => setSourceMode(e.target.value)} className="min-h-11 rounded-xl border border-border bg-background px-3 text-sm font-ui sm:col-span-2">
          <option value="source_only">ใช้แหล่งข้อมูลเท่านั้น (เข้มงวดสูง)</option>
          <option value="source_ai">แหล่งข้อมูลเป็นหลัก + AI เสริม</option>
          <option value="creative">สร้างสรรค์อิสระ</option>
        </select>
      </div>

      <button
        onClick={generate}
        disabled={!!busy}
        className="flex min-h-12 items-center justify-center gap-2 rounded-full bg-primary text-sm font-ui font-bold text-primary-foreground disabled:opacity-60"
      >
        {busy === 'deck' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Presentation className="h-4 w-4" />}
        {busy === 'deck' ? 'AI กำลังวางโครงและเขียนสไลด์...' : 'สร้างพรีเซนเทชัน'}
      </button>

      {deck && (
        <>
          <button onClick={illustrate} disabled={!!busy} className="flex min-h-12 items-center justify-center gap-2 rounded-full border border-border bg-card text-sm font-ui font-semibold disabled:opacity-60">
            {busy === 'images' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
            สร้างภาพประกอบสไลด์
          </button>
          <button onClick={exportPptx} disabled={!!busy} className="flex min-h-12 items-center justify-center gap-2 rounded-full bg-primary text-sm font-ui font-bold text-primary-foreground disabled:opacity-60">
            <Download className="h-4 w-4" />
            ส่งออก PPTX (แก้ไขได้)
          </button>
          <p className="rounded-xl bg-secondary p-3 text-sm font-body">
            <span className="font-ui font-bold">โครงเรื่อง: </span>
            {(deck as any).storyline}
          </p>
        </>
      )}
    </div>
  );

  const navigator = slides.length ? (
    <ul className="flex flex-col gap-1.5">
      {slides.map((s, i) => (
        <li key={i}>
          <button
            onClick={() => setCurrent(i)}
            className={`flex min-h-11 w-full items-start gap-2 rounded-xl border px-3 py-2 text-left text-sm font-ui ${
              i === current ? 'border-primary bg-accent font-bold' : 'border-border bg-card'
            }`}
          >
            <span className="shrink-0 text-xs text-muted-foreground">{String(s.number).padStart(2, '0')}</span>
            <span className="line-clamp-2 min-w-0">{s.title}</span>
          </button>
        </li>
      ))}
    </ul>
  ) : (
    <p className="text-sm font-ui text-muted-foreground">ยังไม่มีสไลด์ — กรอกหัวข้อใน AI Director</p>
  );

  if (presentMode && slide) {
    return (
      <div className="fixed inset-0 z-[70] flex flex-col bg-foreground">
        <button
          onClick={() => setPresentMode(false)}
          aria-label="ออกจากโหมดนำเสนอ"
          className="absolute right-3 top-3 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-background/90"
        >
          <X className="h-5 w-5" />
        </button>
        <ZoomPanCanvas
          contentWidth={SLIDE_W}
          contentHeight={SLIDE_H}
          label={`${current + 1}/${slides.length}`}
          onPrev={current > 0 ? () => setCurrent(c => c - 1) : undefined}
          onNext={current < slides.length - 1 ? () => setCurrent(c => c + 1) : undefined}
        >
          {slideCanvas}
        </ZoomPanCanvas>
      </div>
    );
  }

  return (
    <StudioLayout
      title="PaperPetal Present"
      subtitle={deck ? `${slides.length} สไลด์ · ${preset}` : `ใช้ ${activeSources.length} แหล่งข้อมูล`}
      left={{ label: 'สไลด์', content: navigator }}
      right={{ label: 'AI Director', content: director }}
      headerActions={
        deck ? (
          <button
            onClick={() => setPresentMode(true)}
            className="flex min-h-11 items-center gap-1.5 rounded-full border border-border bg-card px-3 text-sm font-ui font-semibold"
          >
            <Maximize2 className="h-4 w-4" />
            <span className="hidden sm:inline">นำเสนอ</span>
          </button>
        ) : undefined
      }
    >
      {deck && slide ? (
        <div className="flex min-h-0 flex-1 flex-col">
          <ZoomPanCanvas
            contentWidth={SLIDE_W}
            contentHeight={SLIDE_H}
            label={`${current + 1}/${slides.length} · ${slide.title}`}
            onPrev={current > 0 ? () => setCurrent(c => c - 1) : undefined}
            onNext={current < slides.length - 1 ? () => setCurrent(c => c + 1) : undefined}
          >
            {slideCanvas}
          </ZoomPanCanvas>
          {slide.notes && (
            <div className="max-h-[30dvh] shrink-0 overflow-y-auto border-t border-border bg-card px-4 py-3">
              <button
                onClick={() => setNotesOpen(o => !o)}
                className="min-h-11 font-ui text-sm font-bold"
              >
                โน้ตผู้บรรยาย {notesOpen ? '▾' : '▸'}
              </button>
              {notesOpen && <p className="text-sm font-body">{slide.notes}</p>}
            </div>
          )}
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto p-4">
          <div className="mx-auto flex max-w-xl flex-col gap-4">
            <div>
              <h1 className="font-heading text-xl font-bold">สร้างพรีเซนเทชันจากคลังความรู้</h1>
              <p className="text-sm font-ui text-muted-foreground">
                AI วางโครงเรื่องก่อนเขียนสไลด์ · ส่งออก PPTX ที่แก้ไขได้ · ใช้ได้ทั้งมือถือและเดสก์ท็อป
              </p>
            </div>
            <div className="xl:hidden">{director}</div>
            {!isMobile && <div className="hidden xl:block" />}
          </div>
        </div>
      )}
    </StudioLayout>
  );
};

export default Present;
