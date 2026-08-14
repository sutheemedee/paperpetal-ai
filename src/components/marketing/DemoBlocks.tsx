import { ArrowRight, Quote, Terminal } from 'lucide-react';
import type { DemoBlock } from '@/marketing/demoTypes';

/** Renders one content block of a demo page (book, manual, slide or comic). */
const Block = ({ block }: { block: DemoBlock }) => {
  switch (block.type) {
    case 'h':
      return <h3 className="mt-4 font-display text-base font-bold md:text-lg">{block.text}</h3>;
    case 'p':
      return <p className="mt-3 font-body text-sm leading-7 text-foreground/85 md:text-base md:leading-8">{block.text}</p>;
    case 'list':
      return block.ordered ? (
        <ol className="mt-3 flex list-decimal flex-col gap-1.5 pl-5 font-body text-sm leading-7 text-foreground/85 md:text-base">
          {block.items.map(i => <li key={i}>{i}</li>)}
        </ol>
      ) : (
        <ul className="mt-3 flex flex-col gap-1.5 font-body text-sm leading-7 text-foreground/85 md:text-base">
          {block.items.map(i => (
            <li key={i} className="flex gap-2">
              <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
              {i}
            </li>
          ))}
        </ul>
      );
    case 'quote':
      return (
        <blockquote className="mt-4 flex gap-2 rounded-2xl border border-primary/30 bg-primary/10 p-4 font-body text-sm italic leading-7 md:text-base">
          <Quote className="mt-1 h-4 w-4 shrink-0 text-primary" />
          {block.text}
        </blockquote>
      );
    case 'prompt':
      return (
        <figure className="mt-4 overflow-hidden rounded-2xl border border-border bg-background-deep">
          <figcaption className="flex items-center gap-1.5 border-b border-border px-3 py-2 font-ui text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
            <Terminal className="h-3.5 w-3.5 text-primary" /> {block.label || 'PROMPT'}
          </figcaption>
          <pre className="overflow-x-auto whitespace-pre-wrap px-3 py-3 font-mono text-[11px] leading-6 text-foreground/90 md:text-xs">{block.text}</pre>
        </figure>
      );
    case 'table':
      return (
        <div className="mt-4 overflow-x-auto rounded-2xl border border-border">
          <table className="w-full min-w-[420px] border-collapse text-left">
            <thead className="bg-secondary/60">
              <tr>
                {block.head.map(h => (
                  <th key={h} className="px-3 py-2 font-ui text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((r, i) => (
                <tr key={i} className="border-t border-border">
                  {r.map((c, j) => (
                    <td key={j} className="px-3 py-2 font-body text-xs text-foreground/85 md:text-sm">{c}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    case 'stat':
      return (
        <div className="mt-4 grid gap-2 sm:grid-cols-3">
          {block.items.map(s => (
            <div key={s.label} className="rounded-2xl border border-border bg-card p-3">
              <div className="font-display text-xl font-extrabold text-gradient-ai md:text-2xl">{s.value}</div>
              <div className="mt-1 font-ui text-[11px] text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </div>
      );
    case 'diagram':
      return (
        <ol className="mt-4 flex flex-wrap items-center gap-1.5">
          {block.steps.map((s, i) => (
            <li key={s} className="flex items-center gap-1.5">
              <span className="rounded-xl border border-primary/30 bg-primary/10 px-2.5 py-1.5 font-ui text-[11px] font-bold text-foreground md:text-xs">{s}</span>
              {i < block.steps.length - 1 && <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />}
            </li>
          ))}
        </ol>
      );
    case 'panel':
      return (
        <figure className="mt-4 overflow-hidden rounded-2xl border border-border bg-background-deep">
          <div
            className={`flex items-center justify-center bg-gradient-to-br from-primary/25 via-background-deep to-secondary/40 p-4 text-center ${
              block.tone === 'tall' ? 'aspect-[3/4]' : 'aspect-[16/9]'
            }`}
          >
            <span className="max-w-md font-body text-xs leading-6 text-foreground/80 md:text-sm">{block.art}</span>
          </div>
          {block.caption && (
            <figcaption className="border-t border-border px-3 py-2 font-ui text-[11px] uppercase tracking-wider text-muted-foreground">{block.caption}</figcaption>
          )}
          {block.dialogue?.length ? (
            <div className="flex flex-col gap-2 border-t border-border p-3">
              {block.dialogue.map((d, i) => (
                <p key={i} className="font-body text-sm leading-6">
                  <span className="font-ui text-xs font-bold text-primary">{d.who}: </span>
                  {d.line}
                </p>
              ))}
            </div>
          ) : null}
        </figure>
      );
    case 'note':
      return (
        <p className="mt-4 rounded-xl border border-border bg-secondary/40 px-3 py-2 font-ui text-[11px] text-muted-foreground">
          {block.text}
        </p>
      );
    default:
      return null;
  }
};

const DemoBlocks = ({ blocks }: { blocks: DemoBlock[] }) => (
  <>
    {blocks.map((b, i) => (
      <Block key={i} block={b} />
    ))}
  </>
);

export default DemoBlocks;
