import { Link } from 'react-router-dom';
import { BookOpenCheck, Sparkles } from 'lucide-react';
import type { DemoProject } from '@/marketing/demoTypes';
import { DEMO_PROJECTS } from '@/marketing/demos';
import { useCreateFromDemo } from '@/marketing/useCreateFromDemo';

export const DemoCard = ({ demo }: { demo: DemoProject }) => {
  const createFromDemo = useCreateFromDemo();
  return (
    <article className="flex flex-col overflow-hidden rounded-3xl border border-border bg-card">
      <Link to={`/showcase/${demo.id}`} className="relative block">
        <img
          src={demo.cover}
          alt={`ปกตัวอย่าง ${demo.title}`}
          loading="lazy"
          decoding="async"
          className={`w-full object-cover ${demo.unit === 'slides' ? 'aspect-[16/9]' : 'aspect-[3/4]'}`}
        />
        <span className="absolute left-3 top-3 rounded-full bg-background/85 px-2.5 py-1 font-ui text-[10px] font-bold uppercase tracking-wider text-primary backdrop-blur">
          {demo.badge}
        </span>
      </Link>
      <div className="flex flex-1 flex-col p-4">
        <h3 className="font-display text-sm font-extrabold leading-snug md:text-base">{demo.title}</h3>
        <p className="mt-1 font-ui text-[11px] font-bold text-muted-foreground">
          {demo.typeLabel} · {demo.total.toLocaleString()} {demo.unit === 'slides' ? 'สไลด์' : 'หน้า'}
        </p>
        <p className="mt-2 flex-1 font-body text-xs leading-6 text-foreground/80">{demo.description}</p>
        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
          <Link
            to={`/showcase/${demo.id}`}
            className="flex min-h-11 flex-1 items-center justify-center gap-1.5 rounded-full border border-border font-ui text-xs font-bold"
          >
            <BookOpenCheck className="h-4 w-4" /> ดูตัวอย่าง
          </Link>
          <button
            type="button"
            onClick={() => createFromDemo(demo)}
            className="flex min-h-11 flex-1 items-center justify-center gap-1.5 rounded-full bg-gradient-ai font-ui text-xs font-bold text-primary-foreground"
          >
            <Sparkles className="h-4 w-4" /> สร้างงานแบบนี้
          </button>
        </div>
      </div>
    </article>
  );
};

export const ShowcaseGrid = ({ limit }: { limit?: number }) => (
  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
    {(limit ? DEMO_PROJECTS.slice(0, limit) : DEMO_PROJECTS).map(d => (
      <DemoCard key={d.id} demo={d} />
    ))}
  </div>
);

export default DemoCard;
