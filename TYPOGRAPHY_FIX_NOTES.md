# KIVORA Typography & Layout Fix

- Thai-first heading font is now enforced globally (Noto Sans Thai).
- `thai-heading-safe` now uses a safer 1.34 line-height and vertical breathing room.
- Public AI Director headline was resized and given an intentional line break to prevent collision.
- Interactive controls use safer line-height and minimum-width rules.
- Public type utilities were added for consistent future pages.
- Existing AEO/SEO changes are preserved.

Recommended after upload to GitHub: run `npm ci && npm run build`, then visually QA at 1366x768, 1440x900, 1920x1080, 390x844.
