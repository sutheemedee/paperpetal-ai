CREATE TABLE public.quota_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  period_start date NOT NULL,
  metric text NOT NULL,
  level text NOT NULL,
  used integer NOT NULL DEFAULT 0,
  limit_value integer NOT NULL DEFAULT 0,
  plan_code text,
  email_status text NOT NULL DEFAULT 'skipped',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (user_id, period_start, metric, level)
);

GRANT SELECT ON public.quota_notifications TO authenticated;
GRANT ALL ON public.quota_notifications TO service_role;

ALTER TABLE public.quota_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own quota notifications read"
ON public.quota_notifications FOR SELECT TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "admin quota notifications read"
ON public.quota_notifications FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));