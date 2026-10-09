// Thin Gemini wrapper. Returns null when no API key is configured or the call fails,
// so callers can fall back to rule-based / built-in content.

const MODEL = process.env.GEMINI_MODEL || 'gemini-2.0-flash';

export const hasGemini = () => Boolean(process.env.GEMINI_API_KEY);

export async function callGemini(prompt, { json = false } = {}) {
  if (!hasGemini()) return null;
  try {
    const model = process.env.GEMINI_MODEL || MODEL;
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: json ? { responseMimeType: 'application/json', temperature: 0.7 } : { temperature: 0.7 },
        }),
      }
    );
    if (!res.ok) {
      console.warn(`Gemini request failed with status ${res.status}`);
      return null;
    }
    const data = await res.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || null;
  } catch (err) {
    console.warn('Gemini call failed:', err.message);
    return null;
  }
}

export function parseJsonLoose(text) {
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    const cleaned = text.replace(/```json|```/g, '').trim();
    try {
      return JSON.parse(cleaned);
    } catch {
      const start = cleaned.search(/[[{]/);
      const end = Math.max(cleaned.lastIndexOf(']'), cleaned.lastIndexOf('}'));
      if (start >= 0 && end > start) {
        try {
          return JSON.parse(cleaned.slice(start, end + 1));
        } catch {
          return null;
        }
      }
      return null;
    }
  }
}
