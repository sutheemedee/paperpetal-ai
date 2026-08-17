import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, Search, Sparkles } from 'lucide-react';
import PublicHeader from '@/components/marketing/PublicHeader';
import PublicFooter from '@/components/marketing/PublicFooter';
import Seo, { breadcrumbJsonLd, itemListJsonLd, webPageJsonLd } from '@/components/Seo';
import { TemplateVisual } from '@/components/marketing/MiniPreviews';
import { TEMPLATES } from '@/templates/catalog';
import { CATEGORY_LABEL, CONTENT_TYPE_LABEL, TemplateCategory } from '@/templates/types';

const categoryIds: ('all' | TemplateCategory)[] = [
  'all',
  'book',
  'research',
  'presentation',
  'children',
  'manga',
  'education',
  'business',
  'manual',
  'novel',
];

const categoryLabel = (id: 'all' | TemplateCategory) => (id === 'all' ? 'ทั้งหมด' : CATEGORY_LABEL[id]);

const PublicTemplates = () => {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<'all' | TemplateCategory>('all');

  const templates = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return TEMPLATES
      .filter(template => template.featured || template.popular || ['ai-tech-guide', 'sources-to-book', 'sources-to-presentation', 'manga-japanese', 'kids-picture-book'].includes(template.id))
      .filter(template => category === 'all' || template.category === category || template.contentType === category)
      .filter(template => {
        if (!needle) return true;
        return [template.name, template.description, template.targetAudience, ...template.tags].join(' ').toLowerCase().includes(needle);
      })
      .slice(0, 24);
  }, [category, query]);

  return (
    <div className="min-h-[100dvh] bg-[#070A18] text-white">
      <Seo
        path="/templates"
        title="KIVORA Templates | เริ่มเร็วขึ้นด้วยเทมเพลต"
        description="เลือกเทมเพลต KIVORA พร้อม preview สำหรับหนังสือ งานวิจัย Presentation หนังสือเด็ก Manga และงานเผยแพร่"
        jsonLd={[
          breadcrumbJsonLd([{ name: 'หน้าแรก', path: '/' }, { name: 'เทมเพลต', path: '/templates' }]),
          webPageJsonLd({
            name: 'KIVORA Templates',
            description: 'คลังเทมเพลตสำหรับเริ่มสร้างหนังสือ งานวิจัย Presentation หนังสือเด็ก Manga และงานเผยแพร่',
            path: '/templates',
            about: ['Book Templates', 'Research Templates', 'Presentation Templates', 'Kids Templates', 'Manga Templates'],
          }),
          itemListJsonLd(templates.slice(0, 24).map(template => ({
            name: template.name,
            description: template.description,
            path: `/templates?template=${template.id}`,
          }))),
        ]}
      />
      <PublicHeader />
      <main>
        <section className="mx-auto max-w-7xl px-4 py-10 md:py-12">
          <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
            <div>
              <p className="text-xs font-ui font-bold uppercase tracking-[0.16em] text-violet-300">Template Library</p>
              <h1 className="thai-heading-safe mt-3 font-heading text-3xl font-extrabold md:text-5xl">
                เริ่มเร็วขึ้นด้วย KIVORA Templates
              </h1>
              <p className="thai-safe mt-3 max-w-2xl text-sm text-slate-300 md:text-base">
                เลือกโครงสร้างที่พร้อมใช้งาน แล้วให้ AI ปรับเนื้อหา รูปแบบ และ Visual ให้เหมาะกับงานของคุณ
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-[#10172B] p-4">
              <label className="relative block">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <input
                  value={query}
                  onChange={event => setQuery(event.target.value)}
                  placeholder="ค้นหาเทมเพลต..."
                  className="min-h-12 w-full rounded-xl border border-white/10 bg-[#070A18] pl-11 pr-4 text-sm outline-none focus:border-violet-400"
                />
              </label>
              <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                {categoryIds.map(id => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setCategory(id)}
                    className={`flex min-h-10 shrink-0 items-center rounded-full border px-4 text-xs font-ui font-bold ${
                      category === id ? 'border-violet-300 bg-violet-400/15 text-white' : 'border-white/10 text-slate-400 hover:text-white'
                    }`}
                  >
                    {categoryLabel(id)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 pb-14">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {templates.map((template, index) => (
              <article key={template.id} className="rounded-2xl border border-white/10 bg-[#10172B] p-3">
                <TemplateVisual template={template} index={index} compact />
                <div className="p-2 pt-4">
                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full bg-violet-500/12 px-2.5 py-1 text-[10px] font-ui font-bold text-violet-200">
                      {CONTENT_TYPE_LABEL[template.contentType]}
                    </span>
                    {template.popular && (
                      <span className="rounded-full bg-cyan-500/12 px-2.5 py-1 text-[10px] font-ui font-bold text-cyan-200">Popular</span>
                    )}
                  </div>
                  <h2 className="thai-heading-safe mt-3 font-heading text-base font-extrabold">{template.name}</h2>
                  <p className="thai-safe mt-1 text-xs text-slate-400">{template.description}</p>
                  <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] font-ui text-slate-400">
                    <span className="rounded-lg border border-white/10 px-2 py-1.5">{template.layoutDNA.pageSize ?? 'A4'}</span>
                    <span className="rounded-lg border border-white/10 px-2 py-1.5">{template.defaultPageCount} หน้า</span>
                    <span className="col-span-2 rounded-lg border border-white/10 px-2 py-1.5">{template.visualDNA.coverStyle}</span>
                  </div>
                  <div className="mt-4 grid gap-2 sm:grid-cols-2">
                    <Link to={`/showcase?template=${template.id}`} className="flex min-h-10 items-center justify-center gap-1 rounded-lg border border-white/10 text-xs font-ui font-bold">
                      <Eye className="h-3.5 w-3.5" /> Preview
                    </Link>
                    <Link to={`/auth/sign-up?template=${template.id}`} className="flex min-h-10 items-center justify-center gap-1 rounded-lg bg-gradient-ai px-3 text-xs font-ui font-bold text-primary-foreground">
                      <Sparkles className="h-3.5 w-3.5" /> ใช้เทมเพลต
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {!templates.length && (
            <div className="rounded-2xl border border-white/10 bg-[#10172B] p-8 text-center">
              <p className="thai-safe text-slate-300">ยังไม่พบเทมเพลตที่ตรงกับคำค้นนี้ ลองเปลี่ยนคำค้นหรือเลือกหมวดอื่น</p>
            </div>
          )}
        </section>
      </main>
      <PublicFooter />
    </div>
  );
};

export default PublicTemplates;
