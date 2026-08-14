import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookmarkPlus, Send } from 'lucide-react';
import AppShell from '@/components/AppShell';
import { useKnowledge } from '@/knowledge/store';
import { toast } from 'sonner';
import { useEntitlements } from '@/auth/useEntitlements';

const MODES = [
  { id: 'source_only', label: 'ใช้แหล่งข้อมูลเท่านั้น' },
  { id: 'source_ai', label: 'แหล่งข้อมูล + AI' },
  { id: 'creative', label: 'สร้างสรรค์' },
  { id: 'brainstorm', label: 'ระดมไอเดีย' },
  { id: 'editor', label: 'บรรณาธิการ' },
  { id: 'factcheck', label: 'ตรวจข้อเท็จจริง' },
  { id: 'compare', label: 'เปรียบเทียบแหล่งข้อมูล' },
];

const QUICK = [
  { label: 'สรุปแหล่งข้อมูล', prompt: 'สรุปแหล่งข้อมูลทั้งหมดให้หน่อย' },
  { label: 'ระดมไอเดีย', prompt: 'ช่วยระดมไอเดียหัวข้อจากแหล่งข้อมูลนี้ 10 ข้อ' },
  { label: 'วางโครงเรื่อง', prompt: 'จากข้อมูลนี้ช่วยวางโครงหนังสือ 120 หน้า' },
  { label: 'สร้างหนังสือ', prompt: 'ช่วยเสนอโครงหนังสือพร้อมชื่อบททั้งเล่มเพื่อนำไปสร้างใน Write' },
  { label: 'สร้างพรีเซนเทชัน', prompt: 'ช่วยวางโครงสไลด์ 20 สไลด์จากแหล่งข้อมูลนี้' },
  { label: 'ทำโน้ตสรุป', prompt: 'ทำโน้ตสรุปแบบ bullet สำหรับทบทวน' },
];

interface Msg { role: 'user' | 'assistant'; content: string }

const Chat = () => {
  const { activeSources, chatPayloadSources, addNote } = useKnowledge();
  const { consume } = useEntitlements();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [mode, setMode] = useState('source_ai');
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  const send = async (textArg?: string) => {
    const text = (textArg ?? input).trim();
    if (!text || busy) return;
    if (!(await consume({ metric: 'research', operation: 'knowledge_chat', metadata: { mode } }))) return;
    const next: Msg[] = [...messages, { role: 'user', content: text }];
    setMessages([...next, { role: 'assistant', content: '' }]);
    setInput('');
    setBusy(true);

    try {
      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/knowledge-chat`;
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: next, sources: chatPayloadSources(), mode, language: 'thai' }),
      });
      if (!res.ok || !res.body) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'AI ตอบกลับไม่สำเร็จ');
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let acc = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const payload = line.slice(6).trim();
          if (payload === '[DONE]') continue;
          try {
            const delta = JSON.parse(payload).choices?.[0]?.delta?.content;
            if (delta) {
              acc += delta;
              setMessages(m => [...m.slice(0, -1), { role: 'assistant', content: acc }]);
            }
          } catch { /* partial chunk */ }
        }
      }
      endRef.current?.scrollIntoView({ behavior: 'smooth' });
    } catch (e: any) {
      toast.error(e?.message || 'เกิดข้อผิดพลาด');
      setMessages(m => m.slice(0, -1));
    }
    setBusy(false);
  };

  return (
    <AppShell title="Ask PaperPetal">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-3 px-3 py-4 md:px-4">
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={mode}
            onChange={e => setMode(e.target.value)}
            aria-label="โหมดการตอบ"
            className="min-h-11 rounded-full border border-border bg-background px-3 text-sm font-ui"
          >
            {MODES.map(m => (
              <option key={m.id} value={m.id}>{m.label}</option>
            ))}
          </select>
          <Link to="/knowledge" className="min-h-11 content-center text-sm font-ui text-muted-foreground underline">
            ใช้ {activeSources.length} แหล่งข้อมูล
          </Link>
        </div>

        <div className="-mx-3 flex gap-2 overflow-x-auto px-3 pb-1 md:mx-0 md:flex-wrap md:px-0">
          {QUICK.map(q => (
            <button
              key={q.label}
              onClick={() => send(q.prompt)}
              className="min-h-11 shrink-0 rounded-full border border-border bg-card px-4 text-sm font-ui font-semibold hover:bg-accent"
            >
              {q.label}
            </button>
          ))}
        </div>

        {messages.length === 0 && (
          <div className="rounded-2xl border border-border bg-card p-4">
            <p className="font-heading text-base font-bold">ถามอะไรก็ได้จากคลังความรู้ของคุณ</p>
            <p className="mt-1 text-sm font-body text-muted-foreground">
              แตะปุ่มด้านบนเพื่อเริ่มเร็ว หรือพิมพ์คำถามของคุณเอง — คำตอบจะอ้างอิงแหล่งข้อมูลที่แตะดูได้
            </p>
          </div>
        )}

        <div className="flex flex-col gap-3">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`whitespace-pre-wrap break-words rounded-2xl text-[15px] font-body leading-relaxed ${
                m.role === 'user'
                  ? 'ml-auto max-w-[88%] bg-primary p-3 text-primary-foreground'
                  : 'max-w-full text-foreground'
              }`}
            >
              {m.content || (busy ? 'กำลังคิด...' : '')}
              {m.role === 'assistant' && m.content && !busy && (
                <button
                  onClick={() => {
                    addNote({ title: 'AI Note', content: m.content, kind: 'ai' });
                    toast.success('เพิ่มเข้าคลังความรู้เป็นโน้ตแล้ว');
                  }}
                  className="mt-2 flex min-h-11 items-center gap-1.5 rounded-full border border-border bg-card px-4 text-sm font-ui font-semibold"
                >
                  <BookmarkPlus className="h-4 w-4" />
                  เพิ่มเข้าคลังความรู้
                </button>
              )}
            </div>
          ))}
          <div ref={endRef} />
        </div>
      </div>

      {/* composer stays visible above the mobile nav and the virtual keyboard */}
      <div className="sticky bottom-[calc(56px+env(safe-area-inset-bottom))] z-20 mx-auto w-full max-w-3xl px-3 pb-2 md:bottom-3 md:px-4">
        <div className="flex items-end gap-2 rounded-2xl border border-border bg-background p-2 shadow-[var(--shadow-card)]">
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            rows={1}
            placeholder="ถาม PaperPetal จากแหล่งข้อมูลของคุณ..."
            className="max-h-32 min-h-11 flex-1 resize-none bg-transparent px-2 py-2.5 text-base font-ui focus:outline-none md:text-sm"
          />
          <button
            onClick={() => send()}
            disabled={busy || !input.trim()}
            aria-label="ส่ง"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground disabled:opacity-50"
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
      </div>
    </AppShell>
  );
};

export default Chat;
