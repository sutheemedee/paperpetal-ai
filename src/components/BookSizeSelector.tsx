import { BookSize, BOOK_SIZES } from '@/utils/bookSizes';
import { useState } from 'react';

interface BookSizeSelectorProps {
  selected: BookSize;
  onChange: (size: BookSize) => void;
}

const BookSizeSelector = ({ selected, onChange }: BookSizeSelectorProps) => {
  const [customW, setCustomW] = useState(148);
  const [customH, setCustomH] = useState(210);

  const handleCustomChange = (w: number, h: number) => {
    setCustomW(w);
    setCustomH(h);
    const pw = Math.round(w * 3.7795);
    const ph = Math.round(h * 3.7795);
    onChange({
      ...BOOK_SIZES[7],
      width: w,
      height: h,
      pageWidth: pw,
      pageHeight: ph,
    });
  };

  return (
    <div>
      <div className="text-xs font-semibold font-ui text-foreground mb-2">ขนาดหนังสือ</div>
      <div className="grid grid-cols-2 gap-2">
        {BOOK_SIZES.map(size => (
          <div
            key={size.id}
            onClick={() => {
              if (size.id === 'custom') {
                handleCustomChange(customW, customH);
              } else {
                onChange(size);
              }
            }}
            className={`cursor-pointer rounded-lg p-2 border transition-all ${
              selected.id === size.id
                ? 'border-primary bg-card shadow-sm'
                : 'border-border bg-background hover:bg-secondary'
            }`}
          >
            <div className="text-xs font-bold font-ui">{size.label}</div>
            <div className="text-[10px] text-muted-foreground font-ui">
              {size.width ? `${size.width}×${size.height}mm` : 'Custom'}
            </div>
            <div className="text-[10px] text-muted-foreground font-ui">{size.desc}</div>
          </div>
        ))}
      </div>

      {selected.id === 'custom' && (
        <div className="flex gap-2 mt-2">
          <input
            type="number"
            value={customW}
            onChange={e => handleCustomChange(Number(e.target.value), customH)}
            placeholder="W (mm)"
            className="w-full rounded-md border border-border bg-background px-2 py-1 text-xs font-ui"
          />
          <span className="text-xs text-muted-foreground self-center">×</span>
          <input
            type="number"
            value={customH}
            onChange={e => handleCustomChange(customW, Number(e.target.value))}
            placeholder="H (mm)"
            className="w-full rounded-md border border-border bg-background px-2 py-1 text-xs font-ui"
          />
        </div>
      )}
    </div>
  );
};

export default BookSizeSelector;
