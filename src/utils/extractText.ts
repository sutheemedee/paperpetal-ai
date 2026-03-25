import mammoth from 'mammoth';

export const extractTextFromFile = async (file: File): Promise<string> => {
  const ext = file.name.split('.').pop()?.toLowerCase();

  if (ext === 'txt') {
    return await file.text();
  }

  if (ext === 'docx') {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value.slice(0, 4000);
  }

  if (ext === 'pdf') {
    // Basic PDF text extraction - reads as text
    const text = await file.text();
    return text.slice(0, 4000);
  }

  return '';
};
