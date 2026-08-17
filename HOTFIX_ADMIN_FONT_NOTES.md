# KIVORA Admin / Font Hotfix Notes

## Why the credit warning still appeared

The UI can only bypass quota checks when the account is recognized as an operator. Earlier builds recognized:

- admin
- superadmin
- subperadmin

This hotfix also recognizes:

- supperadmin

Deploy both `src` and `supabase/functions`, and apply the new migration in `supabase/migrations/20260817123000_kivora_supperadmin_alias.sql`.

## Why font choices looked the same

The font picker existed, but the CSS only imported part of the font library. This hotfix imports all picker fonts:

- Noto Sans Thai
- Noto Serif Thai
- Sarabun
- Prompt
- Kanit
- Mitr
- IBM Plex Sans Thai

After deploy, hard refresh the browser once so the new font stylesheet is loaded.
