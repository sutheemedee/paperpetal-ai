-- KIVORA operator alias support.
-- Some admin setup notes used "supperadmin"; keep it as a valid alias so quota
-- guards do not treat those accounts as normal metered users.

alter type public.app_role add value if not exists 'supperadmin';

create or replace function public.has_role(_user_id uuid, _role public.app_role)
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
      and (
        role = _role
        or (_role::text = 'superadmin' and role::text = 'supperadmin')
        or (_role::text = 'supperadmin' and role::text = 'superadmin')
      )
  );
$$;
