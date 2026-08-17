-- KIVORA AI provider settings.
-- Secrets are managed through service-role edge functions only; no public RLS policy is added.

create table if not exists public.ai_provider_settings (
  id uuid primary key default gen_random_uuid(),
  provider text not null check (provider in ('gemini', 'openrouter', 'lovable')),
  label text not null default '',
  api_key text not null,
  base_url text,
  chat_model text not null,
  image_model text,
  enabled boolean not null default true,
  priority integer not null default 100,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists ai_provider_settings_enabled_priority_idx
  on public.ai_provider_settings(enabled, priority);

alter table public.ai_provider_settings enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_trigger where tgname = 'ai_provider_settings_updated_at'
  ) then
    create trigger ai_provider_settings_updated_at
    before update on public.ai_provider_settings
    for each row execute function public.update_updated_at_column();
  end if;
end $$;
