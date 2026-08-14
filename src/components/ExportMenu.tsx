import { useState } from 'react';
import { Download, FileText, FileType, BookOpen, Image, Loader2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export type ExportFormat = 'docx' | 'pdf' | 'epub' | 'png';

interface ExportMenuProps {
  onExport: (format: ExportFormat) => void;
  busy?: boolean;
  busyLabel?: string;
  fullWidth?: boolean;
}

const ITEMS: { id: ExportFormat; label: string; hint: string; Icon: typeof FileText }[] = [
  { id: 'docx', label: 'Word (.docx)', hint: 'แก้ไขต่อได้ใน Word / Google Docs', Icon: FileText },
  { id: 'pdf', label: 'PDF (.pdf)', hint: 'พร้อมส่งโรงพิมพ์ ตรงตามขนาดเล่ม', Icon: FileType },
  { id: 'epub', label: 'E-Book (.epub)', hint: 'อ่านบน Kindle / Apple Books / Reader', Icon: BookOpen },
  { id: 'png', label: 'ปกหน้า-หลัง (.png)', hint: 'ใช้โปรโมทบนโซเชียล', Icon: Image },
];

const ExportMenu = ({ onExport, busy, busyLabel, fullWidth }: ExportMenuProps) => {
  const [open, setOpen] = useState(false);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger
        disabled={busy}
        className={`flex items-center justify-center gap-2 rounded-full bg-primary px-4 py-2 text-xs font-ui font-bold text-primary-foreground shadow-sm transition-opacity hover:opacity-90 disabled:opacity-60 ${
          fullWidth ? 'w-full' : ''
        }`}
      >
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
        {busy ? busyLabel || 'กำลังส่งออก...' : 'ส่งออกหนังสือ'}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel className="font-ui text-xs">เลือกรูปแบบไฟล์</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {ITEMS.map(({ id, label, hint, Icon }) => (
          <DropdownMenuItem
            key={id}
            onSelect={() => onExport(id)}
            className="flex cursor-pointer items-start gap-2.5 py-2"
          >
            <Icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
            <span className="flex flex-col">
              <span className="text-xs font-ui font-semibold">{label}</span>
              <span className="text-[11px] font-ui text-muted-foreground">{hint}</span>
            </span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ExportMenu;
