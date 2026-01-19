export const LANGUAGE_CHARSETS: Record<string, RegExp> = {
  es: /[A-Za-zÁÉÍÓÚÜÑáéíóúüñ¿¡]/,
  fr: /[A-Za-zÀÂÇÉÈÊËÎÏÔÙÛÜŸŒÆàâçéèêëîïôùûüÿœæ]/,
  de: /[A-Za-zÄÖÜßäöü]/,
  en: /[A-Za-z]/,
  pt: /[A-Za-zÁÀÂÃÇÉÊÍÓÔÕÚáàâãçéêíóôõú]/,
  it: /[A-Za-zÀÈÉÌÍÒÓÙàèéìíòóù]/,
  nl: /[A-Za-zÉËÏÖÜéëïöü]/,
};

const DEFAULT_LANGUAGE = 'es';

export function extractTargetText(text: string, language: string | null | undefined) {
  const key = language && LANGUAGE_CHARSETS[language] ? language : DEFAULT_LANGUAGE;
  const allowed = LANGUAGE_CHARSETS[key];

  const cleaned = Array.from(text)
    .map((char) => (allowed.test(char) || /\s/.test(char) || char === "'" || char === "’" ? char : ' '))
    .join('')
    .replace(/\s+/g, ' ')
    .trim();

  return cleaned;
}
