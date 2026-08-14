import JSZip from 'jszip';
import { saveAs } from 'file-saver';

const esc = (s: string) =>
  String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

const paras = (body: string) =>
  String(body || '')
    .split(/\n{1,}/)
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
}

const CSS = `body{font-family:serif;line-height:1.75;margin:1.2em}
h1,h2,h3{font-family:serif;line-height:1.3}
.eyebrow{letter-spacing:.2em;text-transform:uppercase;font-size:.75em;opacity:.6}
img{max-width:100%;height:auto;border-radius:6px}
.center{text-align:center}`;

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
  oebps.file('style.css', CSS);

  const manifest: string[] = [`<item id="css" href="style.css" media-type="text/css"/>`];
  const spine: string[] = [];
  const nav: string[] = [];

  // Cover image
  let coverMeta = '';
  const cover = await fetchImageBytes(options.coverImageUrl || '');
  if (cover) {
    oebps.file(`images/cover.${cover.ext}`, cover.bytes);
    manifest.push(`<item id="cover-image" href="images/cover.${cover.ext}" media-type="image/${cover.ext}" properties="cover-image"/>`);
    coverMeta = `<meta name="cover" content="cover-image"/>`;
  }

  const addDoc = (id: string, filename: string, title: string, body: string) => {
    oebps.file(
      filename,
      `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="th"><head>
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
      ${cover ? `<img src="images/cover.${cover.ext}" alt="cover"/>` : ''}
      <h1>${esc(bookData.title)}</h1>
      <p>${esc(bookData.subtitle || '')}</p>
      <p class="eyebrow">${esc(bookData.author || '')}</p>
    </div>`,
  );

  let idx = 0;
  for (const chapter of bookData.chapters || []) {
    idx++;
    const img = await fetchImageBytes(options.chapterImages?.[chapter.chapterNumber] || '');
    let imgTag = '';
    if (img) {
      const name = `images/ch${idx}.${img.ext}`;
      oebps.file(name, img.bytes);
      manifest.push(`<item id="img-ch${idx}" href="${name}" media-type="image/${img.ext}"/>`);
      imgTag = `<img src="${name}" alt="${esc(chapter.chapterTitle)}"/>`;
    }

    const pagesHtml: string[] = [];
    for (const page of chapter.pages || []) {
      let pageImg = '';
      const pi = await fetchImageBytes(page.imageUrl || '');
      if (pi) {
        const name = `images/ch${idx}-p${page.pageNumber}.${pi.ext}`;
        oebps.file(name, pi.bytes);
        manifest.push(`<item id="img-ch${idx}p${page.pageNumber}" href="${name}" media-type="image/${pi.ext}"/>`);
        pageImg = `<img src="${name}" alt="${esc(page.heading || 'illustration')}"/>`;
      }
      pagesHtml.push(`${page.heading ? `<h3>${esc(page.heading)}</h3>` : ''}${pageImg}${paras(page.body)}`);
    }

    addDoc(
      `chap${idx}`,
      `chap${idx}.xhtml`,
      `บทที่ ${chapter.chapterNumber}: ${chapter.chapterTitle}`,
      `${imgTag}<p class="eyebrow">บทที่ ${chapter.chapterNumber}</p><h2>${esc(chapter.chapterTitle)}</h2>${pagesHtml.join('\n')}`,
    );
  }

  addDoc('conclusion', 'conclusion.xhtml', 'สรุป', `<h2>สรุป</h2>${paras(bookData.conclusion)}`);

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

  const uid = `urn:uuid:${crypto.randomUUID()}`;
  oebps.file(
    'content.opf',
    `<?xml version="1.0" encoding="UTF-8"?>
<package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="bookid">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
    <dc:identifier id="bookid">${uid}</dc:identifier>
    <dc:title>${esc(bookData.title)}</dc:title>
    <dc:creator>${esc(bookData.author || 'AI E-Book Studio')}</dc:creator>
    <dc:language>th</dc:language>
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
