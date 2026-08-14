-- ===== ROLES =====
create type public.app_role as enum ('admin','user');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

create policy "users read own roles" on public.user_roles for select to authenticated using (user_id = auth.uid());
create policy "admins read all roles" on public.user_roles for select to authenticated using (public.has_role(auth.uid(),'admin'));
create policy "admins manage roles" on public.user_roles for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

-- ===== SHARED TIMESTAMP TRIGGER =====
create or replace function public.update_updated_at_column()
returns trigger language plpgsql set search_path = public as $$
begin new.updated_at = now(); return new; end; $$;

-- ===== PROFILES =====
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  onboarding_goal text,
  onboarded boolean not null default false,
  suspended boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update on public.profiles to authenticated;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;
create policy "own profile read" on public.profiles for select to authenticated using (id = auth.uid());
create policy "own profile update" on public.profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());
create policy "own profile insert" on public.profiles for insert to authenticated with check (id = auth.uid());
create policy "admin read profiles" on public.profiles for select to authenticated using (public.has_role(auth.uid(),'admin'));
create policy "admin update profiles" on public.profiles for update to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));
create trigger profiles_updated_at before update on public.profiles for each row execute function public.update_updated_at_column();

-- ===== PLANS (admin configurable entitlements) =====
create table public.plans (
  code text primary key,
  name text not null,
  price_thb integer not null default 0,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  badge text,
  entitlements jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select on public.plans to anon, authenticated;
grant all on public.plans to service_role;
alter table public.plans enable row level security;
create policy "plans public read" on public.plans for select to anon, authenticated using (true);
create policy "admin manage plans" on public.plans for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));
create trigger plans_updated_at before update on public.plans for each row execute function public.update_updated_at_column();

insert into public.plans (code, name, price_thb, sort_order, badge, entitlements) values
('free','Free Trial',0,1,null,'{"projects":3,"aiPages":30,"aiImages":10,"slides":10,"sourcesPerProject":3,"exports":null,"exportsPerDay":1,"pdf":true,"docx":"preview","epub":false,"pptx":false,"watermark":true,"ultraRealistic":false,"advancedSources":false,"youtube":false,"manga":false,"characterDNA":false,"knowledgeMap":false,"priorityQueue":false}'::jsonb),
('starter','Starter',399,2,null,'{"projects":10,"aiPages":300,"aiImages":100,"slides":100,"sourcesPerProject":10,"exports":20,"exportsPerDay":null,"pdf":true,"docx":true,"epub":true,"pptx":false,"watermark":false,"ultraRealistic":false,"advancedSources":false,"youtube":false,"manga":false,"characterDNA":false,"knowledgeMap":false,"priorityQueue":false}'::jsonb),
('creator','Creator',799,3,'MOST POPULAR','{"projects":30,"aiPages":1000,"aiImages":400,"slides":400,"sourcesPerProject":30,"exports":100,"exportsPerDay":null,"pdf":true,"docx":true,"epub":true,"pptx":true,"watermark":false,"ultraRealistic":true,"advancedSources":true,"youtube":true,"manga":true,"characterDNA":true,"knowledgeMap":true,"priorityQueue":true}'::jsonb),
('unlimited','Unlimited',1490,4,'PRO','{"projects":null,"aiPages":3000,"aiImages":1200,"slides":1200,"sourcesPerProject":100,"exports":null,"exportsPerDay":null,"pdf":true,"docx":true,"epub":true,"pptx":true,"watermark":false,"ultraRealistic":true,"advancedSources":true,"youtube":true,"manga":true,"characterDNA":true,"knowledgeMap":true,"priorityQueue":true,"fairUse":true}'::jsonb);

-- ===== SUBSCRIPTIONS =====
create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  plan_code text not null default 'free' references public.plans(code),
  status text not null default 'trialing',
  provider text,
  provider_subscription_id text,
  current_period_start timestamptz not null default date_trunc('month', now()),
  current_period_end timestamptz not null default (date_trunc('month', now()) + interval '1 month'),
  cancel_at_period_end boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select on public.subscriptions to authenticated;
grant all on public.subscriptions to service_role;
alter table public.subscriptions enable row level security;
create policy "own subscription read" on public.subscriptions for select to authenticated using (user_id = auth.uid());
create policy "admin read subscriptions" on public.subscriptions for select to authenticated using (public.has_role(auth.uid(),'admin'));
create policy "admin manage subscriptions" on public.subscriptions for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));
create trigger subscriptions_updated_at before update on public.subscriptions for each row execute function public.update_updated_at_column();

-- ===== USAGE COUNTERS =====
create table public.usage_counters (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  period_start date not null,
  metric text not null,
  used integer not null default 0,
  updated_at timestamptz not null default now(),
  unique (user_id, period_start, metric)
);
grant select on public.usage_counters to authenticated;
grant all on public.usage_counters to service_role;
alter table public.usage_counters enable row level security;
create policy "own usage read" on public.usage_counters for select to authenticated using (user_id = auth.uid());
create policy "admin usage read" on public.usage_counters for select to authenticated using (public.has_role(auth.uid(),'admin'));

-- ===== USAGE LEDGER =====
create table public.usage_ledger (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  operation text not null,
  metric text,
  project_id uuid,
  quantity integer not null default 1,
  model text,
  status text not null default 'success',
  plan_code text,
  cost_estimate numeric,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index usage_ledger_user_created_idx on public.usage_ledger (user_id, created_at desc);
grant select on public.usage_ledger to authenticated;
grant all on public.usage_ledger to service_role;
alter table public.usage_ledger enable row level security;
create policy "own ledger read" on public.usage_ledger for select to authenticated using (user_id = auth.uid());
create policy "admin ledger read" on public.usage_ledger for select to authenticated using (public.has_role(auth.uid(),'admin'));

-- ===== BONUS CREDITS =====
create table public.bonus_credits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  metric text not null,
  amount integer not null,
  reason text,
  expires_at timestamptz,
  created_at timestamptz not null default now()
);
grant select on public.bonus_credits to authenticated;
grant all on public.bonus_credits to service_role;
alter table public.bonus_credits enable row level security;
create policy "own bonus read" on public.bonus_credits for select to authenticated using (user_id = auth.uid());
create policy "admin bonus manage" on public.bonus_credits for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

-- ===== EXPORT RECORDS =====
create table public.export_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  project_id uuid,
  format text not null,
  status text not null default 'success',
  created_at timestamptz not null default now()
);
create index export_records_user_created_idx on public.export_records (user_id, created_at desc);
grant select on public.export_records to authenticated;
grant all on public.export_records to service_role;
alter table public.export_records enable row level security;
create policy "own exports read" on public.export_records for select to authenticated using (user_id = auth.uid());
create policy "admin exports read" on public.export_records for select to authenticated using (public.has_role(auth.uid(),'admin'));

-- ===== PROJECTS (user isolated) =====
create table public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null default 'โปรเจกต์ใหม่',
  kind text not null default 'book',
  cover_url text,
  data jsonb not null default '{}'::jsonb,
  archived boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index projects_user_updated_idx on public.projects (user_id, updated_at desc);
grant select, insert, update, delete on public.projects to authenticated;
grant all on public.projects to service_role;
alter table public.projects enable row level security;
create policy "own projects" on public.projects for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create trigger projects_updated_at before update on public.projects for each row execute function public.update_updated_at_column();

-- ===== KNOWLEDGE SOURCES (user isolated) =====
create table public.sources (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  project_id uuid references public.projects(id) on delete cascade,
  source_type text not null,
  title text not null default 'Untitled',
  url text,
  folder text default 'Research',
  tags text[] not null default '{}',
  enabled boolean not null default true,
  role text default 'supporting',
  category text,
  raw_text text,
  knowledge jsonb not null default '{}'::jsonb,
  warnings jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);
create index sources_user_created_idx on public.sources (user_id, created_at desc);
grant select, insert, update, delete on public.sources to authenticated;
grant all on public.sources to service_role;
alter table public.sources enable row level security;
create policy "own sources" on public.sources for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ===== PAYMENTS / INVOICES =====
create table public.invoices (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  plan_code text,
  amount_thb integer not null default 0,
  status text not null default 'pending',
  provider text,
  provider_reference text,
  period_start timestamptz,
  period_end timestamptz,
  created_at timestamptz not null default now()
);
grant select on public.invoices to authenticated;
grant all on public.invoices to service_role;
alter table public.invoices enable row level security;
create policy "own invoices read" on public.invoices for select to authenticated using (user_id = auth.uid());
create policy "admin invoices read" on public.invoices for select to authenticated using (public.has_role(auth.uid(),'admin'));

-- ===== PROMOS =====
create table public.promos (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  kind text not null,
  value numeric not null default 0,
  metric text,
  plan_scope text,
  max_redemptions integer,
  redemptions integer not null default 0,
  active boolean not null default true,
  expires_at timestamptz,
  created_at timestamptz not null default now()
);
grant select on public.promos to authenticated;
grant all on public.promos to service_role;
alter table public.promos enable row level security;
create policy "admin manage promos" on public.promos for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

-- ===== ANALYTICS EVENTS =====
create table public.analytics_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  event text not null,
  props jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index analytics_events_created_idx on public.analytics_events (created_at desc);
grant insert on public.analytics_events to authenticated;
grant all on public.analytics_events to service_role;
alter table public.analytics_events enable row level security;
create policy "insert own events" on public.analytics_events for insert to authenticated with check (user_id = auth.uid());
create policy "admin read events" on public.analytics_events for select to authenticated using (public.has_role(auth.uid(),'admin'));

-- ===== ADMIN AUDIT LOG =====
create table public.admin_audit_log (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid not null references auth.users(id) on delete cascade,
  action text not null,
  target_user_id uuid,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
grant select on public.admin_audit_log to authenticated;
grant all on public.admin_audit_log to service_role;
alter table public.admin_audit_log enable row level security;
create policy "admin read audit" on public.admin_audit_log for select to authenticated using (public.has_role(auth.uid(),'admin'));

-- ===== NEW USER BOOTSTRAP =====
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', new.raw_user_meta_data->>'full_name', split_part(new.email,'@',1)), new.raw_user_meta_data->>'avatar_url')
  on conflict (id) do nothing;

  insert into public.user_roles (user_id, role) values (new.id, 'user') on conflict do nothing;

  insert into public.subscriptions (user_id, plan_code, status, current_period_start, current_period_end)
  values (new.id, 'free', 'trialing', date_trunc('month', now()), date_trunc('month', now()) + interval '1 month')
  on conflict (user_id) do nothing;
  return new;
end; $$;

create trigger on_auth_user_created after insert on auth.users
for each row execute function public.handle_new_user();