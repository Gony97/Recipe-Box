// Imports a recipe from a blog URL. First choice: the structured
// schema.org/Recipe data (JSON-LD) that most recipe sites embed -- it is clean,
// free, and language-agnostic. If that is missing, we hand the page text to the
// caller to run through Gemini instead.

const UA =
  'Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Mobile Safari/537.36';

export async function fetchPage(url) {
  const res = await fetch(url, { headers: { 'User-Agent': UA, Accept: 'text/html' } });
  if (!res.ok) throw new Error(`Could not load the page (${res.status}).`);
  return res.text();
}

// Returns a structured recipe from JSON-LD, or null if none found.
export function recipeFromJsonLd(html) {
  const blocks = [...html.matchAll(
    /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi
  )].map((m) => m[1]);

  for (const block of blocks) {
    let data;
    try {
      data = JSON.parse(block.trim());
    } catch {
      continue;
    }
    const recipe = findRecipe(data);
    if (recipe) return mapRecipe(recipe);
  }
  return null;
}

function findRecipe(node) {
  if (!node || typeof node !== 'object') return null;
  if (Array.isArray(node)) {
    for (const item of node) {
      const r = findRecipe(item);
      if (r) return r;
    }
    return null;
  }
  if (Array.isArray(node['@graph'])) {
    const r = findRecipe(node['@graph']);
    if (r) return r;
  }
  const type = node['@type'];
  const isRecipe = Array.isArray(type)
    ? type.includes('Recipe')
    : type === 'Recipe';
  return isRecipe ? node : null;
}

function mapRecipe(r) {
  return {
    title: text(r.name),
    ingredients: asArray(r.recipeIngredient).map(text).filter(Boolean),
    steps: instructionsToSteps(r.recipeInstructions),
    servings: yieldToText(r.recipeYield),
    prepTime: isoToText(r.prepTime),
    cookTime: isoToText(r.cookTime) || isoToText(r.totalTime),
    category: '',
  };
}

function asArray(v) {
  if (v == null) return [];
  return Array.isArray(v) ? v : [v];
}

function text(v) {
  if (v == null) return '';
  if (typeof v === 'string') return v.trim();
  if (typeof v === 'object' && v.text) return String(v.text).trim();
  return String(v).trim();
}

function instructionsToSteps(instr) {
  const out = [];
  const walk = (node) => {
    for (const item of asArray(node)) {
      if (item == null) continue;
      if (typeof item === 'string') {
        const s = item.trim();
        if (s) out.push(s);
      } else if (item['@type'] === 'HowToSection' || item.itemListElement) {
        walk(item.itemListElement);
      } else if (item.text) {
        const s = String(item.text).trim();
        if (s) out.push(s);
      }
    }
  };
  walk(instr);
  return out;
}

function yieldToText(v) {
  if (v == null) return '';
  if (Array.isArray(v)) v = v[0];
  return String(v).trim();
}

// ISO 8601 duration (e.g. PT1H30M) to a friendly string.
function isoToText(v) {
  if (!v || typeof v !== 'string') return '';
  const m = v.match(/^PT(?:(\d+)H)?(?:(\d+)M)?$/);
  if (!m) return '';
  const h = m[1] ? parseInt(m[1], 10) : 0;
  const min = m[2] ? parseInt(m[2], 10) : 0;
  const parts = [];
  if (h) parts.push(`${h} h`);
  if (min) parts.push(`${min} min`);
  return parts.join(' ');
}

// Crude text extraction for the Gemini fallback path.
export function htmlToText(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<\/(p|div|li|h[1-6]|br)>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&#39;|&rsquo;|&lsquo;/gi, "'")
    .replace(/&quot;|&ldquo;|&rdquo;/gi, '"')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}
