# KIVORA Super Admin Setup

Do not commit real production passwords into migrations. Create the account in Supabase Auth, then grant the role.

## 1. Create Auth User

In Supabase Dashboard:

1. Go to Authentication > Users.
2. Add user:
   - Email: `superadmin@paperpetal.ai`
   - Password: use the password supplied by the owner.
   - Auto confirm email: enabled.

## 2. Grant Super Admin Role

Run this SQL in Supabase SQL Editor after the auth user exists:

```sql
insert into public.user_roles (user_id, role)
select id, 'superadmin'::public.app_role
from auth.users
where email = 'superadmin@paperpetal.ai'
on conflict (user_id, role) do nothing;

update public.subscriptions
set plan_code = 'unlimited',
    status = 'active',
    cancel_at_period_end = false
where user_id = (
  select id from auth.users where email = 'superadmin@paperpetal.ai'
);
```

If no subscription row exists yet, sign in once with the account, then run the SQL again.

## 3. Add Gemini API Provider

After signing in as Super Admin:

1. Open `/admin`.
2. In **AI API Providers**, click **เพิ่มใหม่**.
3. Provider: `Gemini`
4. API Key: paste the Gemini API key.
5. Chat Model: `gemini-2.5-flash`
6. Priority: `10`
7. Enabled: checked.

Optional fallback:

- OpenRouter provider, model `google/gemini-2.0-flash-exp:free`, priority `20`.
- Lovable provider, model `google/gemini-3-flash-preview`, priority `30`.
