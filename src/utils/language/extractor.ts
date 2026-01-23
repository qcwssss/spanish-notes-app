export const LANGUAGE_ALPHABETS: Record<string, string> = {
  es: 'A-Za-zÁÉÍÓÚÜÑáéíóúüñ¿¡',
  fr: 'A-Za-zÀÂÇÉÈÊËÎÏÔÙÛÜŸŒÆàâçéèêëîïôùûüÿœæ',
  de: 'A-Za-zÄÖÜßäöü',
  en: 'A-Za-z',
  pt: 'A-Za-zÁÀÂÃÇÉÊÍÓÔÕÚáàâãçéêíóôõú',
  it: 'A-Za-zÀÈÉÌÍÒÓÙàèéìíòóù',
  nl: 'A-Za-zÉËÏÖÜéëïöü',
};

// Common punctuation allowed in TTS target text
const PUNCTUATION = ",.;:?!()";

const LANGUAGE_CHARSETS: Record<string, RegExp> = Object.entries(LANGUAGE_ALPHABETS).reduce((acc, [lang, chars]) => {
  acc[lang] = new RegExp(`[${chars}${PUNCTUATION}]`);
  return acc;
}, {} as Record<string, RegExp>);

const DEFAULT_LANGUAGE = 'es';

export function extractTargetText(text: string, language: string | null | undefined) {
  const key = language && LANGUAGE_CHARSETS[language] ? language : DEFAULT_LANGUAGE;
  const allowed = LANGUAGE_CHARSETS[key];

  const withoutParentheses = text.replace(/[（(][^）)]*[）)]/g, '');

  const cleaned = Array.from(withoutParentheses)
    .map((char) => (allowed.test(char) || /\s/.test(char) || /[\u0027\u2018\u2019]/.test(char) ? char : ' '))
    .join('')
    .replace(/\s+/g, ' ')
    .trim();

  return cleaned;
}
