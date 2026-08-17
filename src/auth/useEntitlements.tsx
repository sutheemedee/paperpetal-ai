import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthProvider';
import { isUnlimitedPlanLike, METRIC_LABEL, PlanEntitlements, UsageMetric, usageRatio, usageTone } from '@/lib/plans';
import UpgradeModal, { UpgradeReason } from '@/components/account/UpgradeModal';
import QuotaAlertWatcher from '@/components/account/QuotaAlertWatcher';

interface ConsumeInput {
  metric: UsageMetric;
  quantity?: number;
  operation: string;
  projectId?: string | null;
  model?: string | null;
  format?: string;
  metadata?: Record<string, unknown>;
}

interface Ctx {
  /** Server-verified quota consumption. Returns false when blocked (modal shown). */
  consume: (input: ConsumeInput) => Promise<boolean>;
  /** Non-consuming pre-check, e.g. before starting a long generation. */
  check: (metric: UsageMetric, quantity?: number) => Promise<boolean>;
  /** Feature gate from the plan entitlements. */
  can: (feature: keyof PlanEntitlements) => boolean;
  requireFeature: (feature: keyof PlanEntitlements, label: string) => boolean;
  usage: (metric: UsageMetric) => { used: number; limit: number | null; ratio: number; tone: string; label: string; unlimited: boolean };
  /** True for admin / unlimited operator accounts — no credit caps at all. */
  unrestricted: boolean;
  track: (event: string, props?: Record<string, unknown>) => void;
  openUpgrade: (reason: UpgradeReason) => void;
}

const EntitlementsContext = createContext<Ctx | null>(null);

export const EntitlementsProvider = ({ children }: { children: React.ReactNode }) => {
  const { account, setAccount, user, isAdmin } = useAuth();
  const [reason, setReason] = useState<UpgradeReason | null>(null);
  /** Operator accounts (admin role or unlimited plan) ignore every credit/quota rule. */
  const unrestricted = isAdmin || isUnlimitedPlanLike(account);

  const call = useCallback(async (body: Record<string, unknown>) => {
    const { data, error } = await supabase.functions.invoke('entitlements', { body });
    if (error) throw error;
    return data;
  }, []);

  const openUpgrade = useCallback((r: UpgradeReason) => setReason(r), []);

  const handleBlocked = useCallback(
    (data: any, metric: UsageMetric) => {
      if (data.reason === 'daily_export_limit') {
        openUpgrade({
          kind: 'daily_export',
          title: 'คุณใช้สิทธิ์ดาวน์โหลดของวันนี้ครบแล้ว',
          detail: `ดาวน์โหลดวันนี้: ${data.exportsToday} / ${data.perDay} · ดาวน์โหลดครั้งถัดไปได้พรุ่งนี้`,
          planCode: data.planCode,
        });
      } else if (data.reason === 'rate_limited') {
        openUpgrade({
          kind: 'rate_limited',
          title: 'ระบบกำลังตรวจสอบการใช้งานที่สูงผิดปกติ',
          detail: 'งานของคุณปลอดภัย กรุณาลองอีกครั้งในอีกสักครู่',
          planCode: data.planCode,
        });
      } else {
        openUpgrade({
          kind: 'quota',
          title: `คุณใช้ ${METRIC_LABEL[metric]} ครบตามแผนแล้ว`,
          detail: `ปัจจุบัน: ${data.used} / ${data.limit} ${METRIC_LABEL[metric]} — โปรเจกต์ของคุณยังปลอดภัยและแก้ไขต่อได้`,
          planCode: data.planCode,
        });
      }
    },
    [openUpgrade],
  );

  const consume = useCallback(
    async (input: ConsumeInput) => {
      if (unrestricted) {
        // Log usage in the background but never block operator accounts.
        call({ action: 'consume', ...input, quantity: input.quantity ?? 1 }).catch(() => {});
        return true;
      }
      if (!user) {
        openUpgrade({ kind: 'auth', title: 'เข้าสู่ระบบเพื่อใช้ AI', detail: 'สร้างบัญชีฟรีเพื่อเริ่มใช้งาน KIVORA' });
        return false;
      }
      try {
        const data = await call({ action: 'consume', ...input, quantity: input.quantity ?? 1 });
        if (data?.account) setAccount({ ...(account as any), ...data.account });
        if (!data?.allowed) {
          handleBlocked(data, input.metric);
          return false;
        }
        return true;
      } catch {
        return false;
      }
    },
    [user, call, account, setAccount, handleBlocked, openUpgrade, unrestricted],
  );

  const check = useCallback(
    async (metric: UsageMetric, quantity = 1) => {
      if (unrestricted) return true;
      if (!user) {
        openUpgrade({ kind: 'auth', title: 'เข้าสู่ระบบเพื่อใช้ AI', detail: 'สร้างบัญชีฟรีเพื่อเริ่มใช้งาน KIVORA' });
        return false;
      }
      try {
        const data = await call({ action: 'check', metric, quantity });
        if (data?.account) setAccount({ ...(account as any), ...data.account });
        if (!data?.allowed) {
          handleBlocked(data, metric);
          return false;
        }
        return true;
      } catch {
        return false;
      }
    },
    [user, call, account, setAccount, handleBlocked, openUpgrade, unrestricted],
  );

  const can = useCallback(
    (feature: keyof PlanEntitlements) => unrestricted || account?.entitlements?.[feature] === true,
    [account, unrestricted],
  );

  const requireFeature = useCallback(
    (feature: keyof PlanEntitlements, label: string) => {
      if (can(feature)) return true;
      openUpgrade({
        kind: 'feature',
        title: `${label} ใช้ได้ในแผนที่สูงขึ้น`,
        detail: `อัปเกรดเพื่อปลดล็อก ${label} พร้อมสิทธิ์ AI เพิ่มขึ้น`,
        planCode: account?.planCode,
      });
      return false;
    },
    [can, openUpgrade, account],
  );

  const usage = useCallback(
    (metric: UsageMetric) => {
      const used = account?.counters?.[metric] ?? 0;
      if (unrestricted) {
        return { used, limit: null, ratio: 0, tone: 'ok', label: METRIC_LABEL[metric], unlimited: true };
      }
      const base = (account?.entitlements as any)?.[metric] ?? null;
      const bonus = account?.bonus?.[metric] ?? 0;
      const limit = base === null || base === undefined ? null : Number(base) + bonus;
      const ratio = usageRatio(used, limit);
      return { used, limit, ratio, tone: usageTone(ratio), label: METRIC_LABEL[metric], unlimited: false };
    },
    [account, unrestricted],
  );

  const track = useCallback(
    (event: string, props?: Record<string, unknown>) => {
      if (!user) return;
      call({ action: 'track', event, props: props ?? {} }).catch(() => {});
    },
    [user, call],
  );

  const value = useMemo<Ctx>(
    () => ({ consume, check, can, requireFeature, usage, track, openUpgrade, unrestricted: !!unrestricted }),
    [consume, check, can, requireFeature, usage, track, openUpgrade, unrestricted],
  );

  return (
    <EntitlementsContext.Provider value={value}>
      {children}
      <QuotaAlertWatcher />
      <UpgradeModal reason={reason} onClose={() => setReason(null)} />
    </EntitlementsContext.Provider>
  );
};

export const useEntitlements = () => {
  const ctx = useContext(EntitlementsContext);
  if (!ctx) throw new Error('useEntitlements must be used inside EntitlementsProvider');
  return ctx;
};
