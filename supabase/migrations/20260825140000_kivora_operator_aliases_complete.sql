-- Keep every operator alias recognized by the server-side quota and RLS checks.
-- The historical "subperadmin" spelling is retained for existing accounts.
alter type public.app_role add value if not exists 'superadmin';
alter type public.app_role add value if not exists 'supperadmin';
alter type public.app_role add value if not exists 'subperadmin';

create or replace function public.has_operator_role(_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles
    where user_id = _user_id
      and role::text in ('admin', 'superadmin', 'supperadmin', 'subperadmin')
  );
$$;

grant execute on function public.has_operator_role(uuid) to authenticated, service_role;

-- Preserve the Unlimited plan as the effective entitlement source for operators.
update public.plans
set entitlements = entitlements
  || '{"projects":null,"aiPages":null,"aiImages":null,"slides":null,"sourcesPerProject":null,"exports":null,"exportsPerDay":null,"fairUse":false}'::jsonb,
  updated_at = now()
where code = 'unlimited';
