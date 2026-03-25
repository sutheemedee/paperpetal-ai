import html2canvas from 'html2canvas';
import { saveAs } from 'file-saver';

export const exportCoverAsPng = async (elementId: string, filename: string) => {
  const el = document.getElementById(elementId);
  if (!el) return;
  const canvas = await html2canvas(el, { useCORS: true, scale: 2 });
  canvas.toBlob((blob) => {
    if (blob) saveAs(blob, filename);
  });
};
