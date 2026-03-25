import { StyleProfile } from './generateBook';

export const analyzeWritingStyle = async (sampleText: string, apiKey: string): Promise<StyleProfile | null> => {
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
        max_tokens: 1000,
        messages: [{
          role: 'user',
          content: `Analyze this writing sample and return a JSON style profile.

Sample text:
"""
${sampleText.slice(0, 4000)}
"""

Return ONLY valid JSON (no markdown, no backticks):
{
  "tone": "formal|casual|academic|friendly|storytelling|journalistic",
  "complexity": "simple|intermediate|advanced",
  "language": "thai|english|mixed",
  "sentenceStyle": "short|medium|long|mixed",
  "characteristics": ["list", "of", "3-5", "style traits"],
  "vocabularyLevel": "basic|intermediate|technical|literary",
  "writingPersona": "2-sentence description of the author voice",
  "styleInstructions": "Detailed instructions for an AI to mimic this exact style when writing new content."
}`
        }]
      })
    });

    const data = await response.json();
    const text = data.content[0].text;
    return JSON.parse(text.replace(/```json|```/g, '').trim());
  } catch (err) {
    console.error('Style analysis error:', err);
    return null;
  }
};
