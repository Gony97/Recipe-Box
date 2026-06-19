// Visual identity for Recipe Box: soft & modern, colorful pastels.
// A playful but refined multi-color pastel set, gentle shadows, generous
// rounding, and a rounded typeface for headings.

import { Platform } from 'react-native';

export const colors = {
  bg: '#FAF7FC',          // soft lilac-white paper
  card: '#FFFFFF',
  ink: '#403A52',         // deep soft plum (not pure black)
  inkSoft: '#968FAA',     // muted lavender-gray
  line: '#EFEAF5',        // whisper-soft divider

  tint: '#EFEAFA',        // pale lilac surface

  accent: '#9B8CD9',      // periwinkle (primary)
  accentDeep: '#6F5FB8',  // text + solid buttons (white reads on this)
  blush: '#EBA6C0',       // soft rose (secondary)
  blushDeep: '#C76F92',
  mint: '#86CBB6',
  mintDeep: '#3E9E84',
  gold: '#E9C27E',
  goldDeep: '#C89A45',

  danger: '#E58AA0',
  white: '#FFFFFF',

  // Backward-compatible aliases.
  coral: '#9B8CD9',
  coralDark: '#6F5FB8',
  teal: '#86CBB6',
  tealDark: '#3E9E84',
  yellow: '#E9C27E',
  butter: '#EFEAFA',
};

export const fonts = {
  heading: Platform.select({ ios: 'Avenir Next', android: 'sans-serif-medium', default: 'System' }),
  body: Platform.select({ ios: 'Avenir Next', android: 'sans-serif', default: 'System' }),
};

// Each category: a soft pastel fill, a deeper shade for text/icon on that fill,
// and an icon. All tones share the same muted, airy pastel character.
export const categoryStyle = {
  Breakfast: { color: '#FBD9A6', deep: '#B5803A', icon: 'sunny-outline' },
  Lunch:     { color: '#A7DCC9', deep: '#3E9E84', icon: 'restaurant-outline' },
  Dinner:    { color: '#B3B5E6', deep: '#5C5FB0', icon: 'moon-outline' },
  Salads:    { color: '#C2E0A0', deep: '#6F9A3C', icon: 'leaf-outline' },
  Soups:     { color: '#F6C5A8', deep: '#C0723F', icon: 'cafe-outline' },
  Cookies:   { color: '#E6CAA6', deep: '#A8803F', icon: 'ellipse-outline' },
  Cakes:     { color: '#F4C2D8', deep: '#C76F92', icon: 'gift-outline' },
  Desserts:  { color: '#DEBEEA', deep: '#9A5FB8', icon: 'ice-cream-outline' },
  Bread:     { color: '#E8CDBE', deep: '#A87C5F', icon: 'pizza-outline' },
  Drinks:    { color: '#A9D8EC', deep: '#3E8FB8', icon: 'wine-outline' },
  Other:     { color: '#D6D2E0', deep: '#7A748F', icon: 'apps-outline' },
};

const palette = [
  { color: '#C8BEF0', deep: '#6F5FB8' },
  { color: '#A7DCC9', deep: '#3E9E84' },
  { color: '#F4C2D8', deep: '#C76F92' },
  { color: '#FBD9A6', deep: '#B5803A' },
  { color: '#A9D8EC', deep: '#3E8FB8' },
  { color: '#C2E0A0', deep: '#6F9A3C' },
  { color: '#DEBEEA', deep: '#9A5FB8' },
  { color: '#F6C5A8', deep: '#C0723F' },
];

export function styleForCategory(name) {
  if (categoryStyle[name]) return categoryStyle[name];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  const p = palette[hash % palette.length];
  return { ...p, icon: 'pricetag-outline' };
}

export const radius = { sm: 14, md: 18, lg: 26, pill: 999 };
export const space = { xs: 6, sm: 10, md: 16, lg: 22, xl: 30 };

export const shadow = {
  shadowColor: '#6F5FB8',
  shadowOpacity: 0.10,
  shadowRadius: 18,
  shadowOffset: { width: 0, height: 8 },
  elevation: 2,
};
