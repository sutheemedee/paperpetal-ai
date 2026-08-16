import { useState, useRef } from 'react';
import { extractTextFromFile } from '@/utils/extractText';
import { analyzeWritingStyle } from '@/utils/analyzeStyle';
import type { StyleProfile } from '@/utils/generateBook';

interface StyleTemplateUploaderProps {
  onStyleExtracted: (profile: StyleProfile | null) => void;
}

const StyleTemplateUploader = ({ onStyleExtracted }: StyleTemplateUploaderProps) => {
  const [analyzing, setAnalyzing] = useState(false);
  const [styleProfile, setStyleProfile] = useState<StyleProfile | null>(null);
  const [fileName, setFileName] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFileName(f.name);
    setAnalyzing(true);
    try {
      const text = await extractTextFromFile(f);
      const profile = await analyzeWritingStyle(text);
      setStyleProfile(profile);
      onStyleExtracted(profile);
    } catch (err: any) {
      setStyleProfile(null);
      toast.error(err?.message || 'วิเคราะห์สไตล์การเขียนไม่สำเร็จ');
    }
    setAnalyzing(false);
  };

  const handleClear = () => {
    setStyleProfile(null);
    setFileName('');
    onStyleExtracted(null);
    if (fileRef.current) fileRef.current.value = '';
  };

  return (
    <div>
      <div className="text-xs font-semibold font-ui text-foreground mb-2">
        ต้นแบบสไตล์การเขียน <span className="font-normal text-muted-foreground">(ไม่บังคับ)</span>
      </div>

      <label className="flex flex-col items-center gap-1 rounded-lg border-2 border-dashed border-border p-4 cursor-pointer hover:bg-secondary transition-colors">
        <span className="text-2xl">📄</span>
        <span className="text-xs font-ui font-medium">อัพโหลด .txt / .docx / .pdf</span>
        <span className="text-[10px] text-muted-foreground font-ui">AI จะวิเคราะห์สไตล์และใช้เป็นต้นแบบ</span>
        <input
          ref={fileRef}
          type="file"
          accept=".txt,.docx,.pdf"
          onChange={handleUpload}
          className="hidden"
        />
      </label>

      {analyzing && (
        <div className="mt-2 rounded-lg bg-card p-3 text-xs font-ui text-muted-foreground animate-fade-in">
          ⏳ กำลังวิเคราะห์สไตล์การเขียน... ({fileName})
        </div>
      )}

      {styleProfile && !analyzing && (
        <div className="mt-2 rounded-lg bg-card border border-border p-3 animate-fade-in">
          <div className="text-xs font-bold font-ui text-foreground mb-1">✓ วิเคราะห์สไตล์สำเร็จ</div>
          <div className="text-[10px] text-muted-foreground font-ui">
            โทน: {styleProfile.tone} · ระดับ: {styleProfile.complexity}
          </div>
          <div className="text-[10px] text-muted-foreground font-ui">
            ลักษณะ: {styleProfile.characteristics?.slice(0, 2).join(', ')}
          </div>
          <button
            onClick={handleClear}
            className="mt-1 text-[10px] text-destructive bg-transparent border-none cursor-pointer hover:underline font-ui"
          >
            ✕ ลบต้นแบบ
          </button>
        </div>
      )}
    </div>
  );
};

export default StyleTemplateUploader;
