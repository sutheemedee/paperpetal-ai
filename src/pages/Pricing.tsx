import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Check, HelpCircle, Loader2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import PublicHeader from '@/components/marketing/PublicHeader';
import PublicFooter from '@/components/marketing/PublicFooter';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/auth/AuthProvider';
import { FALLBACK_PLANS, PLAN_CTA, PLAN_HIGHLIGHTS, Plan, PlanCode } from '@/lib/plans';
import Seo, { SITE_URL, breadcrumbJsonLd, faqJsonLd, webPageJsonLd } from '@/components/Seo';

const faqs = [
  {
    q: 'เริ่มใช้ฟรีได้ไหม?',
    a: 'ได้ แพ็กเกจ Free Trial เหมาะสำหรับทดลองสร้างงานจริงก่อนอัปเกรด ไม่ต้องใช้บัตรเครดิตตอนสมัคร',
  },
  {
    q: 'เลือกแพ็กเกจแล้วต้องทำอะไรต่อ?',
    a: 'ถ้ายังไม่ล็อกอิน ระบบจะพาไปสมัครพร้อมเก็บแพ็กเกจที่เลือกไว้ หลังเข้าใช้งานแล้วค่อยอัปเกรดหรือชำระเงินต่อ',
  },
  {
    q: 'AI Page คิดอย่างไร?',
    a: 'นับเฉพาะงานที่ให้ AI สร้างหรือเขียนใหม่เทียบเท่าหนึ่งหน้าหนังสือ การเปิดอ่าน แก้ไขเอง หรือดูตัวอย่างไม่คิดเครดิต',
  },
];

const Pricing = () => {
  const { session, account, refresh } = useAuth();
  const [plans, setPlans] = useState<Plan[]>(FALLBACK_PLANS);
  const [promo, setPromo] = useState('');
  const [busy, setBusy] = useState<PlanCode | null>(null);
  const [searchParams] = useSearchParams();
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

  useEffect(() => {
    const selectedPlan = searchParams.get('plan');
    if (selectedPlan) sessionStorage.setItem('kivora.selectedPlan', selectedPlan);
  }, [searchParams]);

  const choose = async (code: PlanCode) => {
    sessionStorage.setItem('kivora.selectedPlan', code);

    if (!session) {
      navigate(`/auth/sign-up?plan=${encodeURIComponent(code)}`);
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
    <div className="min-h-[100dvh] bg-[#070A18] text-white">
      <Seo
        path="/pricing"
        title="ราคาและแพ็กเกจ | KIVORA"
        description="เปรียบเทียบแพ็กเกจ KIVORA สำหรับสร้างหนังสือ eBook งานวิจัย สไลด์ มังงะ และคอนเทนต์จากความรู้ด้วย AI"
        jsonLd={[
          breadcrumbJsonLd([
            { name: 'หน้าแรก', path: '/' },
            { name: 'ราคา', path: '/pricing' },
          ]),
          faqJsonLd(faqs),
          webPageJsonLd({
            name: 'ราคาและแพ็กเกจ KIVORA',
            description: 'เปรียบเทียบแพ็กเกจ Free Trial, Starter, Creator และ Unlimited พร้อมโควตาและรูปแบบส่งออก',
            path: '/pricing',
            about: ['KIVORA Pricing', 'AI Subscription', 'AI Publishing Plans'],
          }),
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
      <PublicHeader />

      <main>
        <section className="mx-auto w-full max-w-7xl px-4 py-14 text-center md:py-20">
          <p className="text-xs font-ui font-bold uppercase tracking-[0.18em] text-cyan-300">Pricing</p>
          <h1 className="mt-3 font-display text-3xl font-extrabold leading-tight md:text-5xl">
            เลือกพลังสร้างสรรค์ให้เหมาะกับงานของคุณ
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-slate-300 md:text-base">
            เริ่มจากทดลองฟรี แล้วขยับเป็นแพ็กเกจที่เหมาะกับจำนวนงาน หนังสือ สไลด์ งานวิจัย หรือคอนเทนต์ที่คุณต้องสร้างจริง
          </p>
        </section>

        <section className="mx-auto grid w-full max-w-7xl gap-4 px-4 pb-10 md:grid-cols-2 xl:grid-cols-4">
          {plans.map(plan => {
            const current = account?.planCode === plan.code;
            const popular = plan.badge === 'MOST POPULAR';
            return (
              <article key={plan.code} className={`rounded-2xl p-[1px] ${popular ? 'bg-gradient-ai' : 'bg-white/10'}`}>
                <div className="flex h-full flex-col rounded-2xl bg-[#10172B] p-5">
                  <div className="flex min-h-10 items-start justify-between gap-2">
                    <h2 className="font-display text-base font-bold uppercase">{plan.name}</h2>
                    {plan.badge && (
                      <span className={`rounded-full px-2 py-1 text-[10px] font-ui font-bold ${popular ? 'bg-gradient-ai text-primary-foreground' : 'border border-white/10 text-slate-300'}`}>
                        {plan.badge}
                      </span>
                    )}
                  </div>

                  <p className="mt-4 font-display text-3xl font-extrabold">
                    ฿{plan.price_thb.toLocaleString()}
                    <span className="ml-1 text-xs font-ui font-semibold text-slate-400">
                      {plan.price_thb === 0 ? '' : '/ เดือน'}
                    </span>
                  </p>

                  <ul className="mt-5 flex flex-1 flex-col gap-2">
                    {PLAN_HIGHLIGHTS[plan.code].map(h => (
                      <li key={h} className="flex items-start gap-2 text-xs leading-5 text-slate-300">
                        <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-300" /> {h}
                      </li>
                    ))}
                  </ul>

                  <button
                    type="button"
                    onClick={() => choose(plan.code)}
                    disabled={current || busy === plan.code}
                    className={`mt-5 flex min-h-12 items-center justify-center gap-2 rounded-xl text-sm font-ui font-bold disabled:opacity-60 ${
                      popular ? 'bg-gradient-ai text-primary-foreground' : 'border border-white/10 bg-white/[0.03]'
                    }`}
                  >
                    {busy === plan.code && <Loader2 className="h-4 w-4 animate-spin" />}
                    {current ? 'แผนปัจจุบันของคุณ' : PLAN_CTA[plan.code]}
                  </button>
                </div>
              </article>
            );
          })}
        </section>

        <section className="mx-auto grid w-full max-w-7xl gap-5 px-4 pb-14 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-2xl border border-white/10 bg-[#10172B] p-5">
            <p className="flex items-center gap-2 font-display text-lg font-bold">
              <Sparkles className="h-5 w-5 text-violet-300" />
              โค้ดส่วนลด / Partner / สถาบัน
            </p>
            <input
              value={promo}
              onChange={e => setPromo(e.target.value.toUpperCase())}
              placeholder="กรอกโค้ด"
              className="mt-4 min-h-12 w-full rounded-xl border border-white/10 bg-[#070A18] px-3 text-sm outline-none focus:border-violet-400"
            />
            <p className="mt-2 text-xs leading-6 text-slate-400">
              ระบบจะตรวจสอบโค้ดตอนสร้างใบแจ้งหนี้ หากยังไม่ล็อกอิน ให้สมัครก่อนแล้วกลับมาเลือกแพ็กเกจนี้ได้
            </p>
            <Link to="/showcase" className="mt-4 inline-flex text-sm font-ui font-bold text-cyan-300">
              ดูตัวอย่างผลงานก่อนเลือกแพ็กเกจ
            </Link>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#10172B] p-5">
            <p className="flex items-center gap-2 font-display text-lg font-bold">
              <HelpCircle className="h-5 w-5 text-cyan-300" />
              คำถามที่พบบ่อย
            </p>
            <div className="mt-4 grid gap-3">
              {faqs.map(item => (
                <div key={item.q} className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                  <h3 className="text-sm font-ui font-bold text-slate-100">{item.q}</h3>
                  <p className="mt-2 text-xs leading-6 text-slate-400">{item.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
};

export default Pricing;
