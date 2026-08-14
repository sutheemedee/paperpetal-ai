import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookmarkPlus, Send } from 'lucide-react';
import AppShell from '@/components/AppShell';
import { useKnowledge } from '@/knowledge/store';
import { toast } from 'sonner';

const MODES = [
  { id: 'source_only', label: 'ใช้แหล่งข้อมูลเท่านั้น' },
  { id: 'source_ai', label: 'แหล่งข้อมูล + AI' },
  { id: 'creative', label: 'สร้างสรรค์' },
  { id: 'brainstorm', label: 'ระดมไอเดีย' },
  { id: 'editor', label: 'บรรณาธิการ' },
  { id: 'factcheck', label: 'ตรวจข้อเท็จจริง' },
  { id: 'compare', label: 'เปรียบเทียบแหล่งข้อมูล' },
];

const SUGGESTIONS = [
  'สรุปแหล่งข้อมูลทั้งหมดให้หน่อย',
  'มีอะไรที่แหล่งข้อมูลขัดแย้งกัน',
  'จากข้อมูลนี้ช่วยวางโครงหนังสือ 120 หน้า',
  'ข้อมูลส่วนไหนเหมาะทำบทที่ 3',
];

interface Msg { role: 'user' | 'assistant'; content: string }

const Chat = () => {
  const { activeSources, chatPayloadSources, addNote } = useKnowledge();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [mode, setMode] = useState('source_ai');
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  const send = async (textArg?: string) => {
    const text = (textArg ?? input).trim();
    if (!text || busy) return;
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
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-3 p-4">
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={mode}
            onChange={e => setMode(e.target.value)}
            className="min-h-9 rounded-full border border-border bg-background px-3 text-xs font-ui"
          >
            {MODES.map(m => (
              <option key={m.id} value={m.id}>{m.label}</option>
            ))}
          </select>
          <Link to="/knowledge" className="text-xs font-ui text-muted-foreground underline">
            ใช้ {activeSources.length} แหล่งข้อมูล
          </Link>
        </div>

        {messages.length === 0 && (
          <div className="flex flex-col gap-2 rounded-2xl border border-border bg-card p-4">
            <p className="font-heading text-sm font-bold">ถามอะไรก็ได้จากคลังความรู้ของคุณ</p>
            {SUGGESTIONS.map(s => (
              <button
                key={s}
                onClick={() => send(s)}
                className="rounded-xl border border-border bg-background px-3 py-2 text-left text-xs font-ui hover:bg-accent"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        <div className="flex flex-col gap-3">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`rounded-2xl p-3 text-sm font-body whitespace-pre-wrap ${
                m.role === 'user' ? 'ml-auto max-w-[85%] bg-primary text-primary-foreground' : 'bg-card'
              }`}
            >
              {m.content || (busy ? 'กำลังคิด...' : '')}
              {m.role === 'assistant' && m.content && !busy && (
                <button
                  onClick={() => {
                    addNote({ title: 'AI Note', content: m.content, kind: 'ai' });
                    toast.success('เพิ่มเข้าคลังความรู้เป็นโน้ตแล้ว');
                  }}
                  className="mt-2 flex min-h-8 items-center gap-1 rounded-full border border-border bg-background px-3 text-[11px] font-ui font-semibold"
                >
                  <BookmarkPlus className="h-3.5 w-3.5" />
                  เพิ่มเข้าคลังความรู้
                </button>
              )}
            </div>
          ))}
          <div ref={endRef} />
        </div>

        <div className="sticky bottom-20 flex items-end gap-2 rounded-2xl border border-border bg-background p-2 md:bottom-4">
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
            className="max-h-32 min-h-10 flex-1 resize-none bg-transparent px-2 py-2 text-sm font-ui focus:outline-none"
          />
          <button
            onClick={() => send()}
            disabled={busy || !input.trim()}
            aria-label="ส่ง"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </AppShell>
  );
};

export default Chat;
