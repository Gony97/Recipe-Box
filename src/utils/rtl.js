// The app is bilingual (Hebrew + English), so rather than flipping the whole
// UI we detect direction per piece of text and align it correctly.

const HEBREW = /[\u0590-\u05FF]/;

export function isHebrew(text) {
  return typeof text === 'string' && HEBREW.test(text);
}

// Returns style props to align a Text/TextInput by its content's language.
export function dirStyle(text) {
  return isHebrew(text)
    ? { textAlign: 'right', writingDirection: 'rtl' }
    : { textAlign: 'left', writingDirection: 'ltr' };
}
