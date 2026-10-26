# Project rules

- Books longer than `CHAPTER_MODE_THRESHOLD` pages are generated as an outline call followed by one `generate-book` call per chapter (`mode: 'outline' | 'chapter'`); a single AI response cannot hold a long book, so it silently came back short.
- Template analytics are logged to the `template_events` table (guests insert with null user, users with their own id, only admins can read); localStorage counts are a per-browser fallback only, so admin stats must read from the table.
- Admin/operator role checks in edge functions filter roles in code, not with an SQL `in(...)` on `app_role`; values outside the enum make the whole query fail and lock admins out.
