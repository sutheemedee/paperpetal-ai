import { useState } from 'react';
import { Loader2, Upload } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { extractTextFromFile } from '@/utils/extractText';
import { useKnowledge } from '@/knowledge/store';
import { SourceType } from '@/knowledge/types';
import { toast } from 'sonner';

const TABS: { id: SourceType; label: string }[] = [
  { id: 'youtube', label: 'YouTube' },
  { id: 'website', label: 'เว็บไซต์' },
  { id: 'txt', label: 'อัปโหลดไฟล์' },
  { id: 'text', label: 'วางข้อความ' },
];

const AddSourceDialog = ({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) => {
  const { addSource } = useKnowledge();
  const [tab, setTab] = useState<SourceType>('youtube');
  const [url, setUrl] = useState('');
  const [text, setText] = useState('');
  const [title, setTitle] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (payload: { sourceType: SourceType; url?: string; text?: string; title?: string }) => {
    setBusy(true);
    try {
      const s = await addSource(payload);
      toast.success(`เพิ่มแหล่งข้อมูล: ${s.title}`);
      if (s.warnings.length) toast.warning(s.warnings[0]);
      setUrl('');
      setText('');
      setTitle('');
      onOpenChange(false);
    } catch (e: any) {
      toast.error(e?.message || 'เพิ่มแหล่งข้อมูลไม่สำเร็จ');
    }
    setBusy(false);
  };

  const onFile = async (file: File) => {
    const ext = (file.name.split('.').pop() || '').toLowerCase();
    const content = await extractTextFromFile(file);
    if (!content.trim()) {
      toast.error('อ่านเนื้อหาจากไฟล์นี้ไม่ได้ กรุณาวางข้อความแทน');
      return;
    }
    await submit({
      sourceType: (['pdf', 'docx', 'txt'].includes(ext) ? ext : 'txt') as SourceType,
      text: content,
      title: file.name,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[88vh] w-[calc(100vw-2rem)] max-w-lg overflow-y-auto rounded-2xl">
        <DialogHeader>
          <DialogTitle className="font-heading text-base">เพิ่มแหล่งข้อมูล</DialogTitle>
        </DialogHeader>

        <div className="flex flex-wrap gap-2">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`min-h-9 rounded-full border px-3 text-xs font-ui transition-all ${
                tab === t.id
                  ? 'border-primary bg-primary font-bold text-primary-foreground'
                  : 'border-border bg-background hover:bg-card'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="mt-4 flex flex-col gap-3">
          {(tab === 'youtube' || tab === 'website') && (
            <>
              <input
                value={url}
                onChange={e => setUrl(e.target.value)}
                placeholder={tab === 'youtube' ? 'https://youtube.com/watch?v=...' : 'https://example.com/article'}
                className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm font-ui focus:outline-none focus:ring-2 focus:ring-ring"
              />
              {tab === 'youtube' && (
                <p className="text-[11px] font-ui text-muted-foreground">
                  ระบบจะดึงชื่อคลิป คำอธิบาย และคำบรรยาย (transcript) พร้อม timestamp เท่าที่เผยแพร่สาธารณะ
                  หากไม่มี transcript ระบบจะแจ้งให้ทราบและไม่แต่งข้อมูลเพิ่ม
                </p>
              )}
              <button
                disabled={busy || !url}
                onClick={() => submit({ sourceType: tab, url })}
                className="flex min-h-11 items-center justify-center gap-2 rounded-full bg-primary text-sm font-ui font-bold text-primary-foreground disabled:opacity-50"
              >
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {busy ? 'กำลังวิเคราะห์...' : 'เพิ่มแหล่งข้อมูล'}
              </button>
            </>
          )}

          {tab === 'txt' && (
            <label className="flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed border-border p-6 text-center">
              {busy ? <Loader2 className="h-6 w-6 animate-spin text-primary" /> : <Upload className="h-6 w-6 text-primary" />}
              <span className="text-sm font-ui font-semibold">
                {busy ? 'กำลังวิเคราะห์ไฟล์...' : 'เลือกไฟล์ PDF, DOCX หรือ TXT'}
              </span>
              <input
                type="file"
                accept=".pdf,.docx,.txt,.md,.csv"
                className="hidden"
                disabled={busy}
                onChange={e => e.target.files?.[0] && onFile(e.target.files[0])}
              />
            </label>
          )}

          {tab === 'text' && (
            <>
              <input
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="ชื่อแหล่งข้อมูล เช่น: ไอเดียของฉัน"
                className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm font-ui focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <textarea
                value={text}
                onChange={e => setText(e.target.value)}
                rows={7}
                placeholder="วางข้อความ / transcript / โน้ตของคุณที่นี่"
                className="w-full resize-none rounded-xl border border-border bg-background px-3 py-2.5 text-sm font-ui focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <button
                disabled={busy || text.trim().length < 20}
                onClick={() => submit({ sourceType: 'text', text, title: title || 'ข้อความของฉัน' })}
                className="flex min-h-11 items-center justify-center gap-2 rounded-full bg-primary text-sm font-ui font-bold text-primary-foreground disabled:opacity-50"
              >
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {busy ? 'กำลังวิเคราะห์...' : 'เพิ่มแหล่งข้อมูล'}
              </button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddSourceDialog;
