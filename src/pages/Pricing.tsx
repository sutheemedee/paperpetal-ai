import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Check, Loader2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import AppShell from '@/components/AppShell';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/auth/AuthProvider';
import { FALLBACK_PLANS, PLAN_CTA, PLAN_HIGHLIGHTS, Plan, PlanCode } from '@/lib/plans';
import Seo, { SITE_URL, breadcrumbJsonLd } from '@/components/Seo';

const Pricing = () => {
  const { session, account, refresh } = useAuth();
  const [plans, setPlans] = useState<Plan[]>(FALLBACK_PLANS);
  const [promo, setPromo] = useState('');
  const [busy, setBusy] = useState<PlanCode | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    supabase
      .from('plans')
      .select('*')
      .eq('is_active', true)
      .order('sort_order')
      .then(({ data }) => {
        if (data?.length) setPlans(data as unknown as Plan[]);
      });
  }, []);

  const choose = async (code: PlanCode) => {
    if (!session) {
      navigate('/auth/sign-up');
      return;
    }
    if (code === 'free') {
      navigate('/dashboard');
      return;
    }
    setBusy(code);
    const { data, error } = await supabase.functions.invoke('billing', {
      body: { action: 'checkout', planCode: code, promoCode: promo || undefined },
    });
    setBusy(null);
    if (error) {
      toast.error('เริ่มการชำระเงินไม่สำเร็จ');
      return;
    }
    if (data?.error) {
      toast.error(data.error === 'invalid_promo' ? 'โค้ดส่วนลดไม่ถูกต้อง' : data.error);
      return;
    }
    await refresh();
    toast.success('สร้างใบแจ้งหนี้เรียบร้อย', { description: data?.message });
    navigate('/billing');
  };

  return (
    <AppShell>
      <Seo
        path="/pricing"
        title="ราคาและแผนการใช้งาน | KIVORA"
        description="เปรียบเทียบแผน KIVORA: Free Trial ใช้ฟรี, Starter 399 บาท, Creator 799 บาท และ Unlimited 1,490 บาท ต่อเดือน พร้อมโควตา AI และการส่งออก PDF, DOCX, EPUB, PPTX"
        jsonLd={[
          breadcrumbJsonLd([
            { name: 'หน้าแรก', path: '/' },
            { name: 'ราคา', path: '/pricing' },
          ]),
          {
            '@context': 'https://schema.org',
            '@type': 'Product',
            name: 'KIVORA',
            description: 'AI Knowledge, Book & Presentation Studio',
            url: `${SITE_URL}/pricing`,
            offers: FALLBACK_PLANS.map(p => ({
              '@type': 'Offer',
              name: p.name,
              price: p.price_thb,
              priceCurrency: 'THB',
              availability: 'https://schema.org/InStock',
            })),
          },
        ]}
      />
      <div className="mx-auto w-full max-w-6xl p-4 md:p-8">
        <div className="text-center">
          <p className="text-[11px] font-ui font-bold uppercase tracking-[0.2em] text-primary">Pricing</p>
          <h1 className="mt-1 font-display text-2xl font-extrabold md:text-4xl">CHOOSE YOUR CREATIVE POWER</h1>
          <p className="mt-2 text-sm font-ui text-muted-foreground">
            เริ่มฟรี อัปเกรดเมื่อพร้อม ยกเลิกได้ทุกเมื่อ — งานของคุณไม่หายไปไหน
          </p>
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {plans.map(plan => {
            const current = account?.planCode === plan.code;
            const popular = plan.badge === 'MOST POPULAR';
            return (
              <div
                key={plan.code}
                className={`rounded-3xl p-[1px] ${popular ? 'bg-gradient-ai' : 'bg-border'}`}
              >
                <div className="flex h-full flex-col rounded-3xl bg-card p-5">
                  <div className="flex items-center justify-between gap-2">
                    <h2 className="font-display text-base font-bold uppercase">{plan.name}</h2>
                    {plan.badge && (
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-ui font-bold ${popular ? 'bg-gradient-ai text-primary-foreground' : 'border border-border text-muted-foreground'}`}>
                        {plan.badge}
                      </span>
                    )}
                  </div>
                  <p className="mt-3 font-display text-3xl font-extrabold">
                    ฿{plan.price_thb.toLocaleString()}
                    <span className="ml-1 text-xs font-ui font-semibold text-muted-foreground">
                      {plan.price_thb === 0 ? '' : '/ เดือน'}
                    </span>
                  </p>
                  <ul className="mt-4 flex flex-1 flex-col gap-1.5">
                    {PLAN_HIGHLIGHTS[plan.code].map(h => (
                      <li key={h} className="flex items-start gap-1.5 text-xs font-ui text-muted-foreground">
                        <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-success" /> {h}
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() => choose(plan.code)}
                    disabled={current || busy === plan.code}
                    className={`mt-4 flex min-h-12 items-center justify-center gap-2 rounded-full text-sm font-ui font-bold disabled:opacity-60 ${
                      popular ? 'bg-gradient-ai text-primary-foreground' : 'border border-border'
                    }`}
                  >
                    {busy === plan.code && <Loader2 className="h-4 w-4 animate-spin" />}
                    {current ? 'แผนปัจจุบันของคุณ' : PLAN_CTA[plan.code]}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mx-auto mt-6 flex max-w-md flex-col gap-2 rounded-2xl border border-border bg-card p-4">
          <span className="text-xs font-ui font-bold">มีโค้ดส่วนลด / โค้ดพาร์ทเนอร์ / โค้ดสถานศึกษา?</span>
          <input
            value={promo}
            onChange={e => setPromo(e.target.value.toUpperCase())}
            placeholder="กรอกโค้ด"
            className="min-h-12 rounded-xl border border-border bg-elevated px-3 text-sm outline-none focus:border-primary"
          />
          <p className="text-[11px] font-ui text-muted-foreground">ระบบจะตรวจสอบโค้ดตอนสร้างใบแจ้งหนี้</p>
        </div>

        <div className="mt-6 rounded-2xl border border-border bg-card p-4 text-xs font-ui text-muted-foreground">
          <p className="flex items-center gap-1.5 font-bold text-foreground">
            <Sparkles className="h-4 w-4 text-primary" /> AI Page คิดอย่างไร?
          </p>
          <p className="mt-1.5">
            1 AI Page = การสร้างหรือการเขียนใหม่ด้วย AI เทียบเท่าหนึ่งหน้าหนังสือ ·
            การแก้ไขด้วยตัวเอง เปิดโปรเจกต์ บันทึก หรือดูตัวอย่าง <b className="text-foreground">ไม่คิดเครดิต</b> ·
            AI Image คิดเฉพาะเมื่อสร้างหรือสร้างภาพใหม่จริง · การส่งออกที่ล้มเหลว
            <b className="text-foreground"> ไม่ตัดสิทธิ์</b>
          </p>
          <Link to="/billing" className="mt-2 inline-block font-bold text-primary">ดูการใช้งานของฉัน</Link>
        </div>
      </div>
    </AppShell>
  );
};

export default Pricing;
