import { useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/auth/AuthProvider';
import { alertMessage, alertTitle, collectQuotaAlerts, isNewAlert, markAlertSeen } from '@/lib/quotaAlerts';

/**
 * Watches usage counters and fires an in-app toast (plus one email per
 * metric/level/billing-period) as soon as a quota threshold is crossed.
 */
const QuotaAlertWatcher = () => {
  const { account, user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const emailing = useRef(false);

  useEffect(() => {
    if (!user || !account) return;
    if (isAdmin || account.planCode === 'unlimited') return; // operator accounts: unlimited (∞)
    const period = account.periodStart;
    const fresh = collectQuotaAlerts(account).filter(a => isNewAlert(user.id, period, a));
    if (fresh.length === 0) return;

    for (const a of fresh) {
      markAlertSeen(user.id, period, a);
      const show = a.level === 'warn' ? toast.warning : toast.error;
      show(alertTitle(a), {
        description: alertMessage(a),
        duration: a.level === 'warn' ? 8000 : 12000,
        action: { label: 'อัปเกรด', onClick: () => navigate('/pricing') },
      });
    }

    if (emailing.current) return;
    emailing.current = true;
    supabase.functions
      .invoke('quota-alert', {
        body: {
          alerts: fresh.map(a => ({ metric: a.metric, level: a.level, used: a.used, limit: a.limit, percent: a.percent })),
          periodStart: period,
          periodEnd: account.periodEnd,
          planCode: account.planCode,
          planName: account.planName,
        },
      })
      .catch(() => {})
      .finally(() => {
        emailing.current = false;
      });
  }, [account, user, navigate, isAdmin]);

  return null;
};

export default QuotaAlertWatcher;
