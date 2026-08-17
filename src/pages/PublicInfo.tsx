import { Link, useLocation } from 'react-router-dom';
import { ArrowRight, FileText, HelpCircle, Mail, ShieldCheck } from 'lucide-react';
import PublicHeader from '@/components/marketing/PublicHeader';
import PublicFooter from '@/components/marketing/PublicFooter';
import Seo from '@/components/Seo';

const CONTENT = {
  '/about': {
    label: 'ABOUT',
    title: 'KIVORA คือพื้นที่ทำงานสำหรับเปลี่ยนความรู้ให้เป็นผลงาน',
    body: 'เราออกแบบ KIVORA ให้ช่วยตั้งแต่รวบรวมแหล่งข้อมูล เข้าใจเนื้อหา วางโครงสร้าง สร้างงาน และเตรียมไฟล์สำหรับเผยแพร่',
    icon: ShieldCheck,
  },
  '/contact': {
    label: 'CONTACT',
    title: 'ติดต่อทีม KIVORA',
    body: 'สำหรับคำถามเรื่องบัญชี แพ็กเกจ ความร่วมมือ หรือการใช้งานในองค์กร สามารถติดต่อทีมงานเพื่อรับคำแนะนำเพิ่มเติม',
    icon: Mail,
  },
  '/help': {
    label: 'HELP',
    title: 'ศูนย์ช่วยเหลือ KIVORA',
    body: 'ดูแนวทางเริ่มต้นจากตัวอย่างผลงาน เลือกเทมเพลตที่เหมาะสม และสร้างงานแรกของคุณแบบเป็นขั้นตอน',
    icon: HelpCircle,
  },
  '/privacy': {
    label: 'PRIVACY',
    title: 'นโยบายความเป็นส่วนตัว',
    body: 'ข้อมูลในโปรเจกต์และบัญชีผู้ใช้ควรถูกจัดการอย่างปลอดภัย โปร่งใส และใช้เฉพาะเพื่อให้บริการตามที่ผู้ใช้เลือก',
    icon: FileText,
  },
  '/terms': {
    label: 'TERMS',
    title: 'เงื่อนไขการใช้งาน',
    body: 'ผู้ใช้ควรตรวจสอบสิทธิ์ของแหล่งข้อมูลที่นำเข้า และรับผิดชอบการตรวจทานความถูกต้องก่อนเผยแพร่ผลงานจริง',
    icon: FileText,
  },
  '/ai-policy': {
    label: 'AI POLICY',
    title: 'แนวทางการใช้ AI อย่างรับผิดชอบ',
    body: 'KIVORA ช่วยสร้างโครงร่างและเนื้อหาได้เร็วขึ้น แต่ผู้ใช้ควรตรวจสอบข้อเท็จจริง ลิขสิทธิ์ และบริบทเฉพาะทางก่อนนำไปใช้งาน',
    icon: ShieldCheck,
  },
};

const PublicInfo = () => {
  const { pathname } = useLocation();
  const content = CONTENT[pathname as keyof typeof CONTENT] ?? CONTENT['/help'];
  const Icon = content.icon;

  return (
    <div className="min-h-[100dvh] bg-[#070A18] text-white">
      <Seo title={`${content.title} | KIVORA`} description={content.body} path={pathname} />
      <PublicHeader />
      <main className="mx-auto max-w-5xl px-4 py-12 md:py-16">
        <div className="rounded-2xl border border-white/10 bg-[#10172B] p-6 md:p-8">
          <Icon className="h-8 w-8 text-cyan-300" />
          <p className="mt-5 text-xs font-ui font-bold uppercase tracking-[0.16em] text-violet-300">{content.label}</p>
          <h1 className="thai-heading-safe mt-3 max-w-3xl font-display text-3xl font-extrabold md:text-5xl">{content.title}</h1>
          <p className="thai-safe mt-4 max-w-2xl text-base text-slate-300">{content.body}</p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Link to="/showcase" className="flex min-h-12 items-center justify-center gap-2 rounded-xl bg-gradient-ai px-5 text-sm font-ui font-bold text-primary-foreground">
              ดูตัวอย่างผลงาน <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/templates" className="flex min-h-12 items-center justify-center rounded-xl border border-white/10 px-5 text-sm font-ui font-bold">
              ดูเทมเพลต
            </Link>
          </div>
        </div>
      </main>
      <PublicFooter />
    </div>
  );
};

export default PublicInfo;
