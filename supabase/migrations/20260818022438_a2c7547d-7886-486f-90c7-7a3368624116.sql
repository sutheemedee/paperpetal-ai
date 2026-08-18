create table if not exists public.ai_provider_settings (
  id uuid primary key default gen_random_uuid(),
  provider text not null check (provider in ('gemini', 'openai', 'openrouter', 'lovable')),
  capability text not null default 'text' check (capability in ('text', 'image', 'both')),
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

grant all on public.ai_provider_settings to service_role;

alter table public.ai_provider_settings enable row level security;

create index if not exists ai_provider_settings_enabled_priority_idx
  on public.ai_provider_settings(enabled, priority);
create index if not exists ai_provider_settings_capability_idx
  on public.ai_provider_settings(capability, enabled, priority);

create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql set search_path = public;

do $$
begin
  if not exists (select 1 from pg_trigger where tgname = 'ai_provider_settings_updated_at') then
    create trigger ai_provider_settings_updated_at
    before update on public.ai_provider_settings
    for each row execute function public.update_updated_at_column();
  end if;
end $$;