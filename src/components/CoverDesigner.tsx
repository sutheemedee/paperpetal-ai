import BookImage from './BookImage';

interface CoverDesignerProps {
  bookData: any;
  coverImageUrl: string;
  backCoverImageUrl: string;
  colorTheme: string;
  onRegenerateCover: () => void;
  onRegenerateBack: () => void;
}

const CoverDesigner = ({ bookData, coverImageUrl, backCoverImageUrl, onRegenerateCover, onRegenerateBack }: CoverDesignerProps) => {
  return (
    <div className="flex flex-col gap-6 items-center">
      {/* Front Cover */}
      <div
        id="front-cover"
        className="relative overflow-hidden rounded-xl shadow-lg"
        style={{ width: 320, height: 460 }}
      >
        <BookImage
          src={coverImageUrl}
          width="100%"
          height="100%"
          alt="Front Cover"
          onRegenerate={onRegenerateCover}
        />
        <div className="absolute inset-0 flex flex-col justify-end p-6 bg-gradient-to-t from-black/70 via-black/20 to-transparent">
          <p className="text-[10px] font-ui tracking-widest uppercase text-primary" style={{ color: '#FFD600' }}>
            {bookData.author}
          </p>
          <h2 className="text-xl font-heading font-bold leading-tight mt-1" style={{ color: '#fff' }}>
            {bookData.title}
          </h2>
          <p className="text-xs font-body mt-1" style={{ color: 'rgba(255,255,255,0.85)' }}>
            {bookData.subtitle}
          </p>
        </div>
      </div>

      {/* Back Cover */}
      <div
        id="back-cover"
        className="relative overflow-hidden rounded-xl shadow-lg"
        style={{ width: 320, height: 220 }}
      >
        <BookImage
          src={backCoverImageUrl}
          width="100%"
          height="100%"
          alt="Back Cover"
          onRegenerate={onRegenerateBack}
        />
        <div className="absolute inset-0 flex flex-col justify-center p-6" style={{ background: 'rgba(0,0,0,0.55)' }}>
          <p className="text-[11px] font-body leading-relaxed" style={{ color: 'rgba(255,255,255,0.9)' }}>
            {bookData.backCoverText}
          </p>
          <div className="mt-3 w-16 h-16 rounded-md bg-foreground/20 flex items-center justify-center">
            <span className="text-[8px] font-ui" style={{ color: 'rgba(255,255,255,0.5)' }}>BARCODE</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoverDesigner;
