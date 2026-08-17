# KIVORA Unlimited + Knowledge Ingest Hotfix

## What this fixes

- Top bar no longer shows `AI Pages 0 / 0` for Unlimited-like accounts.
- Frontend quota guards now treat either `planCode = unlimited` or `planName` containing `Unlimited` as unrestricted.
- Supabase entitlement loading normalizes Unlimited-like subscriptions to unlimited entitlements.
- `admin`, `superadmin`, `supperadmin`, and `subperadmin` are treated as operator roles.
- Knowledge ingestion no longer fails with a user-facing credit error when the Lovable AI gateway returns 402.

## Important distinction

KIVORA Unlimited bypasses KIVORA app quotas. It cannot create paid provider credits inside Lovable's AI gateway. If the provider gateway is out of credits, this version saves the source without AI enrichment and marks it as deferred instead of blocking the user.

## Deploy checklist

- Upload the full source package, not only `src`.
- Deploy Supabase Edge Functions.
- Apply migrations.
- Hard refresh the Lovable preview after deployment.
