export interface StyleProfile {
  tone: string;
  complexity: string;
  language: string;
  sentenceStyle: string;
  characteristics: string[];
  vocabularyLevel: string;
  writingPersona: string;
  styleInstructions: string;
}

const buildSystemPrompt = (styleProfile: StyleProfile | null): string => {
  if (styleProfile) {
    return `You are a professional book author.
CRITICAL: You must write in this exact style:
${styleProfile.styleInstructions}

Tone: ${styleProfile.tone}
Vocabulary level: ${styleProfile.vocabularyLevel}
Sentence style: ${styleProfile.sentenceStyle}
Writing persona: ${styleProfile.writingPersona}

Every page, every sentence must match this style precisely.`;
  }
  return `You are a professional book author and content strategist.`;
};

export const generateBook = async (
  title: string,
  pageCount: number,
  language: string,
  styleProfile: StyleProfile | null,
  apiKey: string
): Promise<any> => {
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 8000,
        system: buildSystemPrompt(styleProfile),
        messages: [{
          role: 'user',
          content: `Create a complete e-book on the topic: "${title}".
Language: ${language === 'thai' ? 'Thai (ภาษาไทย)' : 'English'}
The book should have enough content to fill approximately ${pageCount} pages.

Return ONLY valid JSON (no markdown, no backticks):
{
  "title": string,
  "subtitle": string,
  "author": string,
  "description": string,
  "chapters": [
    {
      "chapterNumber": number,
      "chapterTitle": string,
      "chapterImagePrompt": "detailed English prompt for an AI image that represents this chapter visually",
      "pages": [
        {
          "pageNumber": number,
          "heading": string,
          "body": "long paragraph content for this page (at least 150 words)"
        }
      ]
    }
  ],
  "conclusion": string,
  "backCoverText": string,
  "coverImagePrompt": "detailed English prompt for the book cover illustration — no text, symbolic, editorial style"
}`
        }]
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('API Error:', response.status, errText);
      throw new Error(`API Error: ${response.status}`);
    }

    const data = await response.json();
    const text = data.content.map((i: any) => i.text || '').join('');
    try {
      return JSON.parse(text.replace(/```json|```/g, '').trim());
    } catch (err) {
      console.error('Parse error:', err);
      return null;
    }
  } catch (err) {
    console.error('Generate book error:', err);
    throw err;
  }
};
