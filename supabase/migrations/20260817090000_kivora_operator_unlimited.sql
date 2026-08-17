-- KIVORA operator access: admin, superadmin and legacy misspelled subperadmin are unmetered.

alter type public.app_role add value if not exists 'superadmin';
alter type public.app_role add value if not exists 'subperadmin';

create or replace function public.has_operator_role(_user_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1
    from public.user_roles
    where user_id = _user_id
      and role::text in ('admin', 'superadmin', 'subperadmin')
  )
$$;

grant execute on function public.has_operator_role(uuid) to authenticated, service_role;

update public.plans
set entitlements = entitlements
  || '{"projects":null,"aiPages":null,"aiImages":null,"slides":null,"sourcesPerProject":null,"exports":null,"exportsPerDay":null,"fairUse":false}'::jsonb,
  updated_at = now()
where code = 'unlimited';

alter policy "admins read all roles" on public.user_roles
using (public.has_operator_role(auth.uid()));

alter policy "admins manage roles" on public.user_roles
using (public.has_operator_role(auth.uid()))
with check (public.has_operator_role(auth.uid()));

alter policy "admin read profiles" on public.profiles
using (public.has_operator_role(auth.uid()));

alter policy "admin update profiles" on public.profiles
using (public.has_operator_role(auth.uid()))
with check (public.has_operator_role(auth.uid()));

alter policy "admin manage plans" on public.plans
using (public.has_operator_role(auth.uid()))
with check (public.has_operator_role(auth.uid()));

alter policy "admin read subscriptions" on public.subscriptions
using (public.has_operator_role(auth.uid()));

alter policy "admin manage subscriptions" on public.subscriptions
using (public.has_operator_role(auth.uid()))
with check (public.has_operator_role(auth.uid()));

alter policy "admin usage read" on public.usage_counters
using (public.has_operator_role(auth.uid()));

alter policy "admin ledger read" on public.usage_ledger
using (public.has_operator_role(auth.uid()));

alter policy "admin bonus manage" on public.bonus_credits
using (public.has_operator_role(auth.uid()))
with check (public.has_operator_role(auth.uid()));

alter policy "admin exports read" on public.export_records
using (public.has_operator_role(auth.uid()));

alter policy "admin invoices read" on public.invoices
using (public.has_operator_role(auth.uid()));

alter policy "admin manage promos" on public.promos
using (public.has_operator_role(auth.uid()))
with check (public.has_operator_role(auth.uid()));

alter policy "admin read events" on public.analytics_events
using (public.has_operator_role(auth.uid()));

alter policy "admin read audit" on public.admin_audit_log
using (public.has_operator_role(auth.uid()));

alter policy "admin quota notifications read" on public.quota_notifications
using (public.has_operator_role(auth.uid()));
