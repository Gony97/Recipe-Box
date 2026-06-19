// Talks to Google's Gemini API. The same model reads a screenshot (vision) or
// raw page text and returns a structured recipe as JSON. It keeps the original
// language (Hebrew stays Hebrew) and never translates.

const MODEL = 'gemini-2.5-flash';
const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

const RESPONSE_SCHEMA = {
  type: 'OBJECT',
  properties: {
    title: { type: 'STRING' },
    category: { type: 'STRING' },
    servings: { type: 'STRING' },
    prepTime: { type: 'STRING' },
    cookTime: { type: 'STRING' },
    ingredients: { type: 'ARRAY', items: { type: 'STRING' } },
    steps: { type: 'ARRAY', items: { type: 'STRING' } },
  },
  required: ['title', 'ingredients', 'steps'],
};

function buildPrompt(categories) {
  return [
    'You are extracting a single cooking recipe from the provided content.',
    'Return ONLY the recipe data, no commentary.',
    'Keep the ORIGINAL language of the recipe. Do NOT translate. If the recipe',
    'is in Hebrew, keep Hebrew. If English, keep English.',
    '',
    'Rules:',
    '- "title": the dish name.',
    '- "ingredients": an array, one ingredient line per item, including amounts.',
    '- "steps": an array, one preparation step per item, in order, no numbering prefix.',
    '- "servings", "prepTime", "cookTime": short strings if known, else empty string.',
    `- "category": pick the single best fit from this list: ${categories.join(', ')}.`,
    '  If nothing fits, use "Other".',
    '- If the content is not a recipe, return an empty title and empty arrays.',
  ].join('\n');
}

async function callGemini(apiKey, parts) {
  const res = await fetch(`${ENDPOINT}?key=${encodeURIComponent(apiKey)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts }],
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: RESPONSE_SCHEMA,
        temperature: 0.2,
      },
    }),
  });

  if (!res.ok) {
    let detail = '';
    try {
      const err = await res.json();
      detail = err?.error?.message || '';
    } catch {}
    if (res.status === 400 && /API key/i.test(detail)) {
      throw new Error('Your Gemini API key looks invalid. Check it in Settings.');
    }
    if (res.status === 429) {
      throw new Error('Gemini daily free limit reached. Try again later.');
    }
    throw new Error(`Gemini error (${res.status}). ${detail}`.trim());
  }

  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
  return normalize(parseJson(text));
}

function parseJson(text) {
  let t = (text || '').trim();
  // Strip code fences if the model wrapped the JSON.
  t = t.replace(/^```(?:json)?/i, '').replace(/```$/, '').trim();
  try {
    return JSON.parse(t);
  } catch {
    // Last resort: grab the outermost {...}
    const m = t.match(/\{[\s\S]*\}/);
    if (m) {
      try { return JSON.parse(m[0]); } catch {}
    }
    throw new Error('Could not read the recipe from the response. Try again.');
  }
}

function normalize(obj) {
  const arr = (v) => (Array.isArray(v) ? v.map((x) => String(x).trim()).filter(Boolean) : []);
  return {
    title: (obj.title || '').trim(),
    category: (obj.category || '').trim(),
    servings: (obj.servings || '').trim(),
    prepTime: (obj.prepTime || '').trim(),
    cookTime: (obj.cookTime || '').trim(),
    ingredients: arr(obj.ingredients),
    steps: arr(obj.steps),
  };
}

export async function extractFromImage(apiKey, base64, mimeType, categories) {
  if (!apiKey) throw new Error('Add your Gemini API key in Settings first.');
  const parts = [
    { text: buildPrompt(categories) },
    { inline_data: { mime_type: mimeType || 'image/jpeg', data: base64 } },
  ];
  return callGemini(apiKey, parts);
}

export async function extractFromText(apiKey, text, categories) {
  if (!apiKey) throw new Error('Add your Gemini API key in Settings first.');
  const trimmed = (text || '').slice(0, 25000); // keep requests small
  const parts = [
    { text: buildPrompt(categories) },
    { text: '\n\nContent:\n' + trimmed },
  ];
  return callGemini(apiKey, parts);
}
