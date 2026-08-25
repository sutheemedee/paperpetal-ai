import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import type { FontOption, VisualTheme } from '@/templates/visualPreview';

const esc = (s: unknown) =>
  String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

const escAttr = (s: unknown) => esc(s).replace(/"/g, '&quot;').replace(/'/g, '&#39;');

const paras = (body: unknown) =>
  String(body || '')
    .split(/\n{1,}/)
    .map(p => p.trim())
    .filter(Boolean)
    .map(p => `<p>${esc(p)}</p>`)
    .join('\n');

const dataUrlToBytes = (url: string): { bytes: Uint8Array; ext: string } | null => {
  const match = /^data:image\/(png|jpeg|jpg|webp);base64,(.*)$/i.exec(url);
  if (!match) return null;
  const binary = atob(match[2]);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return { bytes, ext: match[1].toLowerCase() === 'jpg' ? 'jpeg' : match[1].toLowerCase() };
};

const fetchImageBytes = async (url: string) => {
  if (!url) return null;
  const inline = dataUrlToBytes(url);
  if (inline) return inline;
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const buf = new Uint8Array(await res.arrayBuffer());
    const type = res.headers.get('content-type') || 'image/png';
    return { bytes: buf, ext: type.includes('jpeg') ? 'jpeg' : type.includes('webp') ? 'webp' : 'png' };
  } catch {
    return null;
  }
};

interface EpubOptions {
  coverImageUrl?: string;
  chapterImages?: Record<number, string>;
  theme?: VisualTheme;
  font?: FontOption;
}

const CSS_BASE = `
:root{--accent:#0891b2;--paper:#f7fbff;--ink:#0f172a;--muted:#496178}
body{font-family:var(--font-body);line-height:1.75;margin:1.2em;color:var(--ink);background:var(--paper)}
h1,h2,h3{font-family:var(--font-heading);line-height:1.3;color:var(--ink)}
.eyebrow{letter-spacing:.2em;text-transform:uppercase;font-size:.75em;color:var(--accent);font-weight:700}
img{display:block;max-width:100%;height:auto;border-radius:8px;margin:1em auto}
.cover{max-height:65vh;object-fit:cover}
.center{text-align:center}
.chapter-rule{width:3.5em;height:4px;background:var(--accent);border:0;margin:.9em 0}
.page{margin-top:1.4em;padding-top:1em;border-top:1px solid color-mix(in srgb,var(--accent) 22%,transparent)}
.page-number{display:flex;justify-content:space-between;color:var(--muted);font-size:.78em;margin-top:1.4em}
`;

const themeColors = (theme?: VisualTheme) => {
  const colors: Record<string, { accent: string; paper: string; ink: string; muted: string }> = {
    'ai-technology': { accent: '#0891b2', paper: '#f7fbff', ink: '#0f172a', muted: '#496178' },
    business: { accent: '#b7791f', paper: '#fbfaf6', ink: '#172033', muted: '#5c6370' },
    academic: { accent: '#3b64c4', paper: '#ffffff', ink: '#18243b', muted: '#52627a' },
    kids: { accent: '#e45779', paper: '#fffdf7', ink: '#35251e', muted: '#75655b' },
    luxury: { accent: '#8b5cf6', paper: '#fcfbff', ink: '#191326', muted: '#675d79' },
    minimal: { accent: '#0f9f8d', paper: '#ffffff', ink: '#193236', muted: '#617477' },
    pastel: { accent: '#d94695', paper: '#fffaff', ink: '#34233f', muted: '#75647e' },
    'dark-premium': { accent: '#6d42e8', paper: '#f9f8ff', ink: '#16142b', muted: '#5c5874' },
  };
  return colors[theme?.id || 'ai-technology'] || colors['ai-technology'];
};

export const exportToEpub = async (bookData: any, options: EpubOptions = {}) => {
  const zip = new JSZip();
  zip.file('mimetype', 'application/epub+zip', { compression: 'STORE' });
  zip.file(
    'META-INF/container.xml',
    `<?xml version="1.0" encoding="UTF-8"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
  <rootfiles><rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/></rootfiles>
</container>`,
  );

  const oebps = zip.folder('OEBPS')!;
  const colors = themeColors(options.theme);
  const font = options.font?.stack || '"Noto Sans Thai", sans-serif';
  const css = `${CSS_BASE.replace(':root{', `:root{--font-body:${font};--font-heading:${font};`)}\n:root{--accent:${colors.accent};--paper:${colors.paper};--ink:${colors.ink};--muted:${colors.muted}}`;
  oebps.file('style.css', css);

  const manifest: string[] = [`<item id="css" href="style.css" media-type="text/css"/>`];
  const spine: string[] = [];
  const nav: string[] = [];
  let imageIndex = 0;
  const addImage = async (url: string, prefix: string) => {
    const image = await fetchImageBytes(url);
    if (!image) return null;
    imageIndex += 1;
    const name = `images/${prefix}-${imageIndex}.${image.ext}`;
    const id = `img-${imageIndex}`;
    oebps.file(name, image.bytes);
    manifest.push(`<item id="${id}" href="${name}" media-type="image/${image.ext}"${prefix === 'cover' ? ' properties="cover-image"' : ''}/>`);
    return { name, id };
  };

  const cover = await addImage(options.coverImageUrl || '', 'cover');
  const coverMeta = cover ? `<meta name="cover" content="${cover.id}"/>` : '';

  const addDoc = (id: string, filename: string, title: string, body: string) => {
    oebps.file(
      filename,
      `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="${bookData.language === 'english' ? 'en' : 'th'}"><head>
<meta charset="utf-8"/><title>${esc(title)}</title><link rel="stylesheet" type="text/css" href="style.css"/>
</head><body>${body}</body></html>`,
    );
    manifest.push(`<item id="${id}" href="${filename}" media-type="application/xhtml+xml"/>`);
    spine.push(`<itemref idref="${id}"/>`);
    nav.push(`<li><a href="${filename}">${esc(title)}</a></li>`);
  };

  addDoc(
    'titlepage',
    'titlepage.xhtml',
    bookData.title || 'E-Book',
    `<div class="center">
      ${cover ? `<img class="cover" src="${cover.name}" alt="หน้าปก"/>` : ''}
      <p class="eyebrow">${esc(options.theme?.name || 'KIVORA E-BOOK')}</p>
      <h1>${esc(bookData.title)}</h1>
      <p>${esc(bookData.subtitle || '')}</p>
      <p class="eyebrow">${esc(bookData.author || '')}</p>
    </div>`,
  );

  let idx = 0;
  for (const chapter of bookData.chapters || []) {
    idx += 1;
    const chapterImage = await addImage(options.chapterImages?.[chapter.chapterNumber] || chapter.imageUrl || '', `chapter-${idx}`);
    let chapterImageTag = '';
    if (chapterImage) chapterImageTag = `<img src="${chapterImage.name}" alt="${escAttr(chapter.chapterTitle)}"/>`;

    const pagesHtml: string[] = [];
    for (const page of chapter.pages || []) {
      const pageImage = await addImage(page.imageUrl || '', `ch${idx}-page`);
      const pageImageTag = pageImage ? `<img src="${pageImage.name}" alt="${escAttr(page.heading || 'ภาพประกอบ')}"/>` : '';
      pagesHtml.push(`<section class="page">${page.heading ? `<h3>${esc(page.heading)}</h3>` : ''}${pageImageTag}${paras(page.body)}<div class="page-number"><span>${esc(bookData.title)}</span><span>— ${esc(page.pageNumber)} —</span></div></section>`);
    }

    addDoc(
      `chap${idx}`,
      `chap${idx}.xhtml`,
      `บทที่ ${chapter.chapterNumber}: ${chapter.chapterTitle}`,
      `${chapterImageTag}<p class="eyebrow">บทที่ ${esc(chapter.chapterNumber)}</p><h2>${esc(chapter.chapterTitle)}</h2><hr class="chapter-rule"/>${pagesHtml.join('\n')}`,
    );
  }

  addDoc('conclusion', 'conclusion.xhtml', 'สรุป', `<p class="eyebrow">บทส่งท้าย</p><h2>สรุป</h2>${paras(bookData.conclusion)}`);

  oebps.file(
    'nav.xhtml',
    `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" xml:lang="th"><head>
<meta charset="utf-8"/><title>สารบัญ</title></head><body>
<nav epub:type="toc" id="toc"><h1>สารบัญ</h1><ol>${nav.join('')}</ol></nav>
</body></html>`,
  );
  manifest.push(`<item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/>`);

  const uid = `urn:uuid:${crypto.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`}`;
  const language = bookData.language === 'english' ? 'en' : 'th';
  oebps.file(
    'content.opf',
    `<?xml version="1.0" encoding="UTF-8"?>
<package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="bookid">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
    <dc:identifier id="bookid">${uid}</dc:identifier>
    <dc:title>${esc(bookData.title)}</dc:title>
    <dc:creator>${esc(bookData.author || 'AI E-Book Studio')}</dc:creator>
    <dc:language>${language}</dc:language>
    <dc:description>${esc(bookData.description || bookData.subtitle || '')}</dc:description>
    <meta property="dcterms:modified">${new Date().toISOString().replace(/\.\d+Z$/, 'Z')}</meta>
    ${coverMeta}
  </metadata>
  <manifest>${manifest.join('')}</manifest>
  <spine>${spine.join('')}</spine>
</package>`,
  );

  const blob = await zip.generateAsync({ type: 'blob', mimeType: 'application/epub+zip' });
  saveAs(blob, `${bookData.title || 'ebook'}.epub`);
};
