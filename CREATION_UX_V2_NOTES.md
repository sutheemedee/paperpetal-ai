# KIVORA Creation UX v2 Notes

## What changed

- Added visual template previews through `src/templates/visualPreview.ts`.
- Rebuilt `TemplateCard` so each template shows a real cover/slide mockup instead of a generic gradient.
- Rebuilt `TemplatePreview` with a 4-page readable preview: cover/opening, structure, sample content, and output page.
- Added `BookStudioV2` and routed `/book` to it.
- `BookStudioV2` reads the saved template draft from `/create`, so the flow is now:
  `Template -> Project Setup -> Book Studio`.
- Added an AI Design Director panel with:
  - Book color themes
  - Cover design styles
  - Font library
  - Auto design selection
  - Unlimited status clarification
- Generation now sends selected theme, cover style, and font direction into the style profile.

## Unlimited behavior

The frontend still uses `useEntitlements().unrestricted` and the Supabase entitlement function already bypasses quotas for:

- admin
- superadmin
- subperadmin
- unlimited plan

If a user still sees a 402 credit warning after this version is deployed, check that the deployed Supabase Edge Functions are the same version as the source and that the user's role/subscription is synced correctly.

## Verification note

This extracted ZIP did not include usable local TypeScript/Vite binaries, so a full local build was not run in this workspace. The source was statically checked for the changed imports, routes, component props, and export format signatures.
