import { useState } from 'react';
import { Download, Loader2, Presentation, Wand2 } from 'lucide-react';
import AppShell from '@/components/AppShell';
import { useKnowledge } from '@/knowledge/store';
import { supabase } from '@/integrations/supabase/client';
import { generateImage } from '@/utils/imageGen';
import { exportToPptx, Deck } from '@/utils/exportPptx';
import { toast } from 'sonner';

const SLIDE_COUNTS = [10, 20, 30, 40, 80];
const PRESETS = ['Business', 'Technology', 'Teaching', 'Course', 'Pitch Deck', 'Research', 'Academic', 'Workshop', 'Keynote', 'Marketing', 'Minimal', 'Dark Tech', 'Children'];
const TONES = ['Modern Technology', 'Professional', 'Friendly', 'Luxury', 'Creative', 'Minimal'];

const Present = () => {
  const { activeSources, chatPayloadSources } = useKnowledge();
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

  const generate = async () => {
    if (!topic.trim()) return toast.error('กรุณากรอกหัวข้อพรีเซนเทชัน');
    setBusy('deck');
    setDeck(null);
    try {
      const { data, error } = await supabase.functions.invoke('generate-presentation', {
        body: {
          topic,
          slideCount,
          presetType: preset,
          tone,
          audience,
          notesLevel,
          sourceMode,
          language: 'thai',
          sources: chatPayloadSources(),
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

  const slide = deck?.slides?.[current];

  return (
    <AppShell title="PaperPetal Present">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 p-4">
        <div>
          <h1 className="font-heading text-xl font-bold">สร้างพรีเซนเทชันจากคลังความรู้</h1>
          <p className="text-xs font-ui text-muted-foreground">
            ใช้ {activeSources.length} แหล่งข้อมูล · AI วางโครงเรื่องก่อนเขียนสไลด์ · ส่งออก PPTX ที่แก้ไขได้
          </p>
        </div>

        <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4">
          <textarea
            value={topic}
            onChange={e => setTopic(e.target.value)}
            rows={2}
            placeholder="เช่น: สอนใช้ AI สร้างคอนเทนต์สำหรับผู้เริ่มต้น"
            className="w-full resize-none rounded-xl border border-border bg-background px-3 py-2.5 text-sm font-ui focus:outline-none focus:ring-2 focus:ring-ring"
          />

          <div>
            <div className="mb-2 text-xs font-semibold font-ui">จำนวนสไลด์</div>
            <div className="flex flex-wrap gap-2">
              {SLIDE_COUNTS.map(n => (
                <button
                  key={n}
                  onClick={() => setSlideCount(n)}
                  className={`min-h-9 rounded-full border px-4 text-xs font-ui ${
                    slideCount === n ? 'border-primary bg-primary font-bold text-primary-foreground' : 'border-border bg-background'
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <select value={preset} onChange={e => setPreset(e.target.value)} className="min-h-10 rounded-xl border border-border bg-background px-3 text-xs font-ui">
              {PRESETS.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
            <select value={tone} onChange={e => setTone(e.target.value)} className="min-h-10 rounded-xl border border-border bg-background px-3 text-xs font-ui">
              {TONES.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
            <input
              value={audience}
              onChange={e => setAudience(e.target.value)}
              placeholder="ผู้ฟัง"
              className="min-h-10 rounded-xl border border-border bg-background px-3 text-xs font-ui"
            />
            <select value={notesLevel} onChange={e => setNotesLevel(e.target.value)} className="min-h-10 rounded-xl border border-border bg-background px-3 text-xs font-ui">
              <option value="short">โน้ตผู้บรรยายแบบสั้น</option>
              <option value="detailed">โน้ตละเอียด</option>
              <option value="script">สคริปต์เต็ม</option>
            </select>
            <select value={sourceMode} onChange={e => setSourceMode(e.target.value)} className="col-span-2 min-h-10 rounded-xl border border-border bg-background px-3 text-xs font-ui">
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
        </div>

        {deck && (
          <>
            <div className="flex flex-wrap gap-2">
              <button onClick={illustrate} disabled={!!busy} className="flex min-h-10 items-center gap-1.5 rounded-full border border-border bg-card px-4 text-xs font-ui font-semibold disabled:opacity-60">
                {busy === 'images' ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Wand2 className="h-3.5 w-3.5" />}
                สร้างภาพประกอบสไลด์
              </button>
              <button onClick={exportPptx} disabled={!!busy} className="flex min-h-10 items-center gap-1.5 rounded-full bg-primary px-4 text-xs font-ui font-bold text-primary-foreground disabled:opacity-60">
                <Download className="h-3.5 w-3.5" />
                ส่งออก PPTX
              </button>
            </div>

            <p className="rounded-xl bg-secondary p-3 text-xs font-body">
              <span className="font-ui font-bold">โครงเรื่อง: </span>
              {(deck as any).storyline}
            </p>

            <div className="grid gap-4 md:grid-cols-[200px_1fr]">
              <div className="flex max-h-[60vh] gap-2 overflow-auto md:flex-col">
                {deck.slides.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrent(i)}
                    className={`min-w-[140px] rounded-xl border p-2 text-left text-[11px] font-ui ${
                      i === current ? 'border-primary bg-accent' : 'border-border bg-card'
                    }`}
                  >
                    <div className="font-bold">{String(s.number).padStart(2, '0')}</div>
                    <div className="line-clamp-2">{s.title}</div>
                  </button>
                ))}
              </div>

              {slide && (
                <div className="flex flex-col gap-3">
                  <div className="aspect-video overflow-hidden rounded-2xl border border-border bg-background p-5 shadow-[var(--shadow-card)]">
                    <div className="mb-1 h-1 w-16 bg-primary" />
                    <h2 className="font-heading text-lg font-bold md:text-2xl">{slide.title}</h2>
                    {slide.subtitle && <p className="text-xs font-ui text-muted-foreground md:text-sm">{slide.subtitle}</p>}
                    <div className="mt-3 flex gap-3">
                      <div className="flex-1">
                        {slide.bullets?.length ? (
                          <ul className="list-disc pl-4 text-[11px] font-body md:text-sm">
                            {slide.bullets.map((b, i) => <li key={i}>{b}</li>)}
                          </ul>
                        ) : (
                          <p className="text-[11px] font-body md:text-sm">{slide.body}</p>
                        )}
                      </div>
                      {(slide as any).imageUrl && (
                        <img src={(slide as any).imageUrl} alt={slide.title || 'ภาพประกอบสไลด์'} className="h-24 w-32 rounded-lg object-cover md:h-40 md:w-56" />
                      )}
                    </div>
                    {!!slide.citations?.length && (
                      <p className="mt-2 text-[10px] font-ui text-muted-foreground">{slide.citations.join('  ')}</p>
                    )}
                  </div>
                  {slide.notes && (
                    <div className="rounded-xl border border-border bg-card p-3 text-xs font-body">
                      <span className="font-ui font-bold">โน้ตผู้บรรยาย: </span>
                      {slide.notes}
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </AppShell>
  );
};

export default Present;
