import { useEffect } from 'react';

export const SITE_URL = 'https://paperpetal-ai.lovable.app';
export const SITE_NAME = 'KIVORA';

interface SeoProps {
  title: string;
  description: string;
  path: string;
  noindex?: boolean;
  /** Extra JSON-LD blocks (FAQPage, BreadcrumbList, Product, ...) */
  jsonLd?: Record<string, unknown>[];
}

const setMeta = (attr: 'name' | 'property', key: string, content: string) => {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
};

const setLink = (rel: string, href: string) => {
  let el = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', rel);
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
};

const JSONLD_ATTR = 'data-seo-jsonld';

/** Per-route head metadata + structured data (SEO / AEO). */
const Seo = ({ title, description, path, noindex, jsonLd }: SeoProps) => {
  const url = `${SITE_URL}${path}`;
  const structured = JSON.stringify(jsonLd || []);

  useEffect(() => {
    document.title = title;
    document.documentElement.lang = 'th';
    setMeta('name', 'description', description);
    setMeta('name', 'robots', noindex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large');
    setLink('canonical', url);

    setMeta('property', 'og:site_name', SITE_NAME);
    setMeta('property', 'og:title', title);
    setMeta('property', 'og:description', description);
    setMeta('property', 'og:url', url);
    setMeta('property', 'og:type', 'website');
    setMeta('property', 'og:locale', 'th_TH');
    setMeta('name', 'twitter:card', 'summary_large_image');
    setMeta('name', 'twitter:title', title);
    setMeta('name', 'twitter:description', description);

    document.head.querySelectorAll(`script[${JSONLD_ATTR}]`).forEach(n => n.remove());
    (JSON.parse(structured) as Record<string, unknown>[]).forEach(block => {
      const s = document.createElement('script');
      s.type = 'application/ld+json';
      s.setAttribute(JSONLD_ATTR, 'true');
      s.textContent = JSON.stringify(block);
      document.head.appendChild(s);
    });
  }, [title, description, url, noindex, structured]);

  return null;
};

export default Seo;

/** Answer-engine friendly Q&A schema. */
export const faqJsonLd = (faqs: { q: string; a: string }[]) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map(f => ({
    '@type': 'Question',
    name: f.q,
    acceptedAnswer: { '@type': 'Answer', text: f.a },
  })),
});

export const breadcrumbJsonLd = (items: { name: string; path: string }[]) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((it, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    name: it.name,
    item: `${SITE_URL}${it.path}`,
  })),
});


/** Generic WebPage schema for answer-engine / semantic understanding. */
export const webPageJsonLd = ({
  name,
  description,
  path,
  about = [],
}: {
  name: string;
  description: string;
  path: string;
  about?: string[];
}) => ({
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name,
  description,
  url: `${SITE_URL}${path}`,
  inLanguage: 'th-TH',
  isPartOf: { '@type': 'WebSite', name: SITE_NAME, url: SITE_URL },
  about: about.map(name => ({ '@type': 'Thing', name })),
});

/** Collection/list schema used by creation catalog, templates and showcase. */
export const itemListJsonLd = (items: { name: string; path: string; description?: string }[]) => ({
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  itemListElement: items.map((item, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    url: `${SITE_URL}${item.path}`,
    name: item.name,
    ...(item.description ? { description: item.description } : {}),
  })),
});

/** Public demo publication schema. Use Book for fixed/reflowable books and CreativeWork otherwise. */
export const publicationJsonLd = ({
  title,
  description,
  path,
  language,
  format,
  pages,
  category,
}: {
  title: string;
  description: string;
  path: string;
  language: string;
  format: string;
  pages?: number;
  category: string;
}) => ({
  '@context': 'https://schema.org',
  '@type': category === 'presentation' ? 'CreativeWork' : 'Book',
  name: title,
  description,
  url: `${SITE_URL}${path}`,
  inLanguage: language.includes('ไทย') ? 'th' : language.includes('English') ? 'en' : 'th',
  ...(category === 'presentation' ? {} : {
    bookFormat: 'https://schema.org/EBook',
    ...(pages ? { numberOfPages: pages } : {}),
  }),
  additionalType: format,
  isPartOf: { '@type': 'CollectionPage', name: 'KIVORA Showcase', url: `${SITE_URL}/showcase` },
  creator: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
});
