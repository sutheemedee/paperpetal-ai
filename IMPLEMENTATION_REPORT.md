# PaperPetal AI / KIVORA — รายงานการปรับปรุงระบบ

วันที่ตรวจสอบ: 25 สิงหาคม 2026

## สรุปผล

ปรับปรุง repository `paperpetal-ai` ในพื้นที่ทำงาน `/home/ubuntu/paperpetal-ai` แล้ว โดยเน้น workflow การสร้าง eBook, ภาพประกอบ, การจัดหน้าและ export, การเปิดโปรเจกต์เดิม, และสิทธิ์ operator/admin ทุก alias ผลการตรวจสอบสุดท้ายคือ build, lint, test และ diff check ผ่านทั้งหมด

| รายการตรวจสอบ | ผลลัพธ์ |
|---|---:|
| `npm run build` | ผ่าน |
| `npm run lint` | ผ่าน — 0 errors, 30 warnings เดิมของโครงการ |
| `npm test` | ผ่าน — 6 test files, 28 tests |
| `git diff --check` | ผ่าน |
| หน้าแรก local preview | ผ่าน |
| Showcase และ reader | ผ่าน |
| route `/book` เมื่อไม่ได้ login | redirect ไป sign-in ถูกต้อง |

## สิ่งที่แก้ไขแล้ว

### 1. การสร้างภาพประกอบครบทุกบทและทุกหน้า

ปรับ `useIllustrations` ให้สร้างภาพเปิดบทและภาพประกอบรายหน้าได้ครบทุก target, ข้ามเฉพาะภาพที่มีอยู่และเป็น URL ที่ใช้งานได้จริง, รายงานจำนวนสำเร็จ/ล้มเหลว, และไม่ค้างเมื่อ AI provider ตอบผิดพลาดหรือไม่พร้อมใช้งาน

เพิ่มตัวกรอง `isUsableImageUrl` เพื่อไม่ให้ SVG fallback หรือข้อความ fallback ถูกนับเป็นภาพจริง และทำให้ `hydrateBook` รักษาภาพที่สร้างไว้เมื่อบันทึก/เปิดโปรเจกต์เดิม

ปุ่มสร้างภาพรายบทและรายหน้าผ่าน entitlement guard แล้ว รวมทั้งปุ่ม `สร้างภาพทั้งหมด` จะคิดจำนวนเฉพาะภาพที่ยังขาดจริง จึงลดการหัก quota ซ้ำและไม่แสดงว่าสำเร็จเมื่อบางภาพล้มเหลว

### 2. ปกหน้าและปกหลัง

เพิ่มปุ่มสร้างและสร้างใหม่สำหรับปกหน้า/ปกหลังใน canvas หลัก พร้อม quota guard และข้อความ error ที่ชัดเจน ปิดช่องทางเดิมที่ component ซ่อนอยู่ทำให้ผู้ใช้เห็นภาพแต่ไม่สามารถซ่อมภาพจากหน้าอ่านจริงได้

### 3. PDF / EPUB และการจัดหน้า

ปรับ exporter ให้ส่งต่อธีม ฟอนต์ และ cover style จาก Studio ไปยังไฟล์ส่งออกให้ตรงกับ preview มากขึ้น รอการโหลดภาพก่อน rasterize PDF, ตรวจสอบ response ของภาพก่อนฝังใน EPUB, ฝังภาพระดับบทและระดับหน้า, และสร้าง metadata ของ EPUB ให้ถูกต้องกว่าเดิม

การเปิดโปรเจกต์เดิมจาก Projects เปลี่ยนให้ใช้ `projectId` และ hydrate ภาพจากข้อมูลที่บันทึก จึงไม่เริ่ม Studio เปล่าหรือทำภาพหายหลัง reload

### 4. สิทธิ์ admin/operator แบบไม่จำกัด

ฝั่ง server และ client รองรับ role alias ต่อไปนี้แล้ว:

`admin`, `superadmin`, `supperadmin`, `subperadmin`

เพิ่ม migration ใหม่ที่ `supabase/migrations/20260825140000_kivora_operator_aliases_complete.sql` เพื่อให้ `has_operator_role` ใน PostgreSQL รวม alias ทุกตัวและคง Unlimited entitlement สำหรับ operator การป้องกันไม่ได้อาศัยเพียง client state แต่ตรวจจาก server-side role และ service-role lookup ด้วย

### 5. Code quality และ regression tests

แก้ React Hook ที่ถูกเรียกหลัง early return, แก้ ESM import ของ Tailwind plugin, แก้ empty interface และ `prefer-const` ที่เป็น error จริง เพิ่ม `src/test/ebook-workflow.test.ts` ครอบคลุมการกรอง fallback, การ hydrate ภาพ และลำดับหน้า ebook

## ไฟล์สำคัญที่เปลี่ยน

- `src/hooks/useIllustrations.ts`
- `src/pages/BookStudioV2.tsx`
- `src/pages/Index.tsx`
- `src/components/studio/bookPages.tsx`
- `src/utils/exportPdf.ts`
- `src/utils/exportEpub.ts`
- `src/utils/imageGen.ts`
- `supabase/functions/generate-image/index.ts`
- `supabase/functions/_shared/entitlements.ts`
- `supabase/functions/entitlements/index.ts`
- `supabase/migrations/20260825140000_kivora_operator_aliases_complete.sql`
- `src/test/ebook-workflow.test.ts`

## ส่วนที่ยังไม่สามารถยืนยันเป็น production ได้จาก sandbox

การปรับโค้ดเสร็จและ local verification ผ่านแล้ว แต่ยังมีขั้นตอน deployment/configuration ที่ต้องทำกับ Supabase project จริงก่อนจะอ้างว่า production ทำงาน 100% ได้

1. ต้อง deploy migration ใหม่ไปยัง Supabase production และ deploy edge functions ที่แก้ไข ได้แก่ `generate-image`, `generate-book`, `entitlements`, `billing` และฟังก์ชันที่เกี่ยวข้อง
2. ต้องตั้งค่า AI provider ที่ใช้งานจริงใน Admin Console ให้มี API key, base URL, chat model และ image model ที่ถูกต้อง ภาพจริงจะถูกสร้างได้ต่อเมื่อ provider พร้อมใช้งาน
3. ต้องทดสอบด้วยบัญชีจริงที่มี role alias แต่ละแบบอย่างน้อยหนึ่งบัญชี และทดสอบการสร้างหนังสือ/ภาพ/export หลัง migration ถูก deploy แล้ว
4. ระบบชำระเงินใน `billing` ยังออกแบบเป็น pending invoice จนกว่า payment provider webhook ที่ตรวจ signature จะถูกเชื่อมต่อจริง จึงยังไม่ใช่ checkout production แบบสมบูรณ์
5. bundle หลักยังใหญ่กว่า 500 kB หลัง minify และมี warning จาก dependency/React Router เดิม แม้ไม่ทำให้ build หรือการทำงานล้มเหลว ควรทำ code splitting ต่อในรอบ optimization
6. มี warning ของ Dialog accessibility และ React Hook dependency จากโค้ดเดิมที่ไม่ block build แต่ควรเก็บในรอบ quality hardening ถ้าต้องการ CI แบบ warning-free

> ข้อสรุป: โค้ดฝั่ง repository พร้อมสำหรับการ deploy และมี safeguards ครบขึ้นอย่างมีนัยสำคัญ แต่การยืนยันว่า admin ทุกระดับสร้างได้ไม่จำกัด “บน production จริง” ต้อง deploy migration/edge functions และตั้งค่า provider ใน Supabase ก่อน
