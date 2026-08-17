# KIVORA ZIP Review Notes

This cleaned package is based on `KIVORA_AEO_TYPOGRAPHY_FIXED.zip`.

## Fixes applied

- Fixed a compile-risk reference in `src/pages/CreateWithKivora.tsx` by using `thaiContext` instead of an undefined `bilingual` variable.
- Updated `public/robots.txt` so crawlers can load `/assets/` for page rendering.
- Added public auth route exclusions in `public/robots.txt`.

## Packaging notes

- Do not upload `.env` to GitHub.
- Do not upload `node_modules` to GitHub.
- Install dependencies from `package-lock.json` after cloning or after Lovable/GitHub deployment pulls the source.

## Verification note

The uploaded ZIP did not include usable local binary shims under `node_modules/.bin`, so a full local build could not be completed from that ZIP without reinstalling dependencies.
