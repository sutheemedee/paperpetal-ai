import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { FALLBACK_PLANS, PlanCode, PlanEntitlements, UsageMetric } from '@/lib/plans';

const OPERATOR_ROLES = new Set(['admin', 'superadmin', 'subperadmin']);

export interface AccountState {
  planCode: PlanCode;
  planName: string;
  status: string;
  entitlements: PlanEntitlements;
  periodStart: string;
  periodEnd: string;
  cancelAtPeriodEnd: boolean;
  counters: Partial<Record<UsageMetric, number>>;
  bonus: Partial<Record<UsageMetric, number>>;
  exportsToday: number;
  projectCount: number;
}

interface Profile {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  onboarded: boolean;
  onboarding_goal: string | null;
  suspended: boolean;
}

interface Ctx {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  account: AccountState | null;
  isAdmin: boolean;
  loading: boolean;
  refresh: () => Promise<void>;
  setAccount: (a: AccountState) => void;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<Ctx | null>(null);

const fallbackAccount = (): AccountState => {
  const start = new Date();
  start.setDate(1);
  const end = new Date(start);
  end.setMonth(end.getMonth() + 1);
  return {
    planCode: 'free',
    planName: 'Free Trial',
    status: 'trialing',
    entitlements: FALLBACK_PLANS[0].entitlements,
    periodStart: start.toISOString(),
    periodEnd: end.toISOString(),
    cancelAtPeriodEnd: false,
    counters: {},
    bonus: {},
    exportsToday: 0,
    projectCount: 0,
  };
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [account, setAccount] = useState<AccountState | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadAccount = useCallback(async (uid: string) => {
    const [{ data: prof }, { data: roles }] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', uid).maybeSingle(),
      supabase.from('user_roles').select('role').eq('user_id', uid),
    ]);
    setProfile((prof as Profile) ?? null);
    setIsAdmin(!!roles?.some(r => OPERATOR_ROLES.has(String(r.role))));

    const { data, error } = await supabase.functions.invoke('entitlements', { body: { action: 'state' } });
    if (!error && data?.account) {
      setAccount({ ...fallbackAccount(), ...data.account });
    } else {
      setAccount(fallbackAccount());
    }
  }, []);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
      if (!next?.user) {
        setProfile(null);
        setAccount(null);
        setIsAdmin(false);
        setLoading(false);
      }
    });

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      if (!data.session) setLoading(false);
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session?.user) return;
    let cancelled = false;
    setLoading(true);
    loadAccount(session.user.id).finally(() => {
      if (!cancelled) setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [session?.user?.id, loadAccount]);

  const refresh = useCallback(async () => {
    if (session?.user) await loadAccount(session.user.id);
  }, [session?.user?.id, loadAccount]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  const value = useMemo<Ctx>(
    () => ({
      session,
      user: session?.user ?? null,
      profile,
      account,
      isAdmin,
      loading,
      refresh,
      setAccount,
      signOut,
    }),
    [session, profile, account, isAdmin, loading, refresh, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
