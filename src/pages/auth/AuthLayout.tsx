import { Link } from 'react-router-dom';
import { BookOpen, Presentation, Sparkles } from 'lucide-react';
import { FullLogo, PetalMark } from '@/components/brand/Logo';
import Seo from '@/components/Seo';

const AuthLayout = ({
  children,
  headline,
  sub,
  seo,
}: {
  children: React.ReactNode;
  headline: string;
  sub: string;
  seo?: { title: string; description: string; path: string; noindex?: boolean };
}) => (
  <div className="min-h-[100dvh] bg-background">
    {seo && <Seo {...seo} />}
    <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:py-16">
      {/* Product preview — desktop only */}
      <section className="hidden lg:block">
        <Link to="/" className="flex items-center gap-2">
          <PetalMark className="h-9 w-9" />
          <span className="font-display text-base font-bold">KIVORA</span>
        </Link>
        <h2 className="mt-8 font-display text-4xl font-extrabold leading-tight">
          <span className="text-gradient-ai">{headline}</span>
        </h2>
        <p className="mt-3 max-w-md text-sm font-body text-muted-foreground">{sub}</p>

        <div className="mt-8 grid grid-cols-3 gap-3">
          {[
            { icon: Sparkles, label: 'Knowledge AI', hint: 'YouTube · PDF · เว็บ' },
            { icon: BookOpen, label: 'Book Studio', hint: 'PDF · DOCX · EPUB' },
            { icon: Presentation, label: 'Presentation', hint: 'PPTX แก้ไขได้' },
          ].map(f => (
            <div key={f.label} className="rounded-2xl border border-border bg-card p-3">
              <f.icon className="h-5 w-5 text-primary" />
              <div className="mt-2 font-display text-xs font-bold">{f.label}</div>
              <div className="text-[11px] font-ui text-muted-foreground">{f.hint}</div>
            </div>
          ))}
        </div>

        <div className="mt-8 max-w-xs opacity-90">
          <FullLogo className="w-48" />
        </div>
      </section>

      {/* Form column */}
      <section className="mx-auto w-full max-w-md">
        <div className="mb-5 flex items-center gap-2 lg:hidden">
          <PetalMark className="h-9 w-9" />
          <span className="font-display text-base font-bold">KIVORA</span>
        </div>
        <div className="rounded-3xl border border-border bg-card p-5 shadow-[var(--shadow-card)] md:p-6">{children}</div>
        <p className="mt-4 text-center text-[11px] font-ui text-muted-foreground">
          AI Knowledge, Book & Presentation Studio
        </p>
      </section>
    </div>
  </div>
);

export default AuthLayout;
