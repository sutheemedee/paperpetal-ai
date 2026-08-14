INSERT INTO public.usage_counters (user_id, period_start, metric, used)
VALUES
 ('97dfe1ef-5a77-4c1a-b5b4-0c41d26f6a7b','2026-08-01','aiPages',28),
 ('97dfe1ef-5a77-4c1a-b5b4-0c41d26f6a7b','2026-08-01','aiImages',10)
ON CONFLICT (user_id, period_start, metric) DO UPDATE SET used = EXCLUDED.used;