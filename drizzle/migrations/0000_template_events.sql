CREATE TABLE public.template_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  template_id text NOT NULL,
  event text NOT NULL CHECK (event IN ('template_view','template_preview','template_use','template_completion','template_export','template_upgrade')),
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT INSERT ON public.template_events TO anon;
GRANT SELECT, INSERT ON public.template_events TO authenticated;
GRANT ALL ON public.template_events TO service_role;

ALTER TABLE public.template_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Guests log anonymous template events"
ON public.template_events FOR INSERT TO anon
WITH CHECK (user_id IS NULL AND length(template_id) <= 120);

CREATE POLICY "Users log their own template events"
ON public.template_events FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid() AND length(template_id) <= 120);

CREATE POLICY "Admins read all template events"
ON public.template_events FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX template_events_created_at_idx ON public.template_events (created_at DESC);
CREATE INDEX template_events_template_idx ON public.template_events (template_id, created_at DESC);