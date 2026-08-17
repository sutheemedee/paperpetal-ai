# KIVORA AEO Upgrade Notes

Implemented AEO/semantic search improvements:

- Expanded per-route JSON-LD helpers: WebPage, ItemList, Book/CreativeWork.
- Added BreadcrumbList + semantic WebPage markup to Features, Create Catalog, Templates, Showcase, Pricing.
- Added ItemList markup to creation catalog, templates and showcase.
- Added Book/CreativeWork markup to each public Showcase Reader page.
- Made homepage FAQ content visible and matched it with FAQPage JSON-LD.
- Added FAQ schema to Pricing where FAQ content is visibly rendered.
- Expanded sitemap.xml to all major public routes and public showcase detail pages.
- Hardened robots.txt to keep private application routes out of crawl scope while leaving public marketing/showcase crawlable.
- Added llms.txt with concise KIVORA product facts, canonical public pages and accuracy rules.
- Removed the stale @Lovable Twitter account metadata.
- Improved base meta description and keywords for current KIVORA positioning.

Important deployment follow-up:

1. Replace SITE_URL / sitemap / robots / llms URLs when the final custom domain is connected.
2. Validate JSON-LD with Schema.org validator / Google Rich Results Test where applicable.
3. Submit sitemap in Google Search Console and Bing Webmaster Tools.
4. Keep visible page copy synchronized with structured data. Do not mark up claims that are not visible or true.
5. FAQPage remains useful as semantic structure, but should not be relied on for a Google FAQ rich-result appearance.
