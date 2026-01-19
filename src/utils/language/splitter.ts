import { LANGUAGE_CHARSETS } from './extractor';

export interface TextSegment {
  text: string;
  isTarget: boolean;
}

export function splitTextByLanguage(text: string, language: string | null | undefined): TextSegment[] {
  const langKey = language && LANGUAGE_CHARSETS[language] ? language : 'es';
  const targetCharset = LANGUAGE_CHARSETS[langKey];

  // Regex to identify Chinese characters and punctuation
  // \u4e00-\u9fa5: Common Chinese characters
  // \u3000-\u303f: CJK symbols and punctuation
  // \uff00-\uffef: Fullwidth ASCII variants (often used in Chinese)
  const chineseRegex = /[\u4e00-\u9fa5\u3000-\u303f\uff00-\uffef]/;

  const segments: TextSegment[] = [];
  let currentText = '';
  // Start assuming we are in a non-Chinese block (potential target)
  // We will re-evaluate validity when pushing the segment
  let isBuildingChinese = false;

  for (const char of text) {
    const isCharChinese = chineseRegex.test(char);

    if (currentText === '') {
      isBuildingChinese = isCharChinese;
      currentText = char;
    } else if (isCharChinese === isBuildingChinese) {
      currentText += char;
    } else {
      // Switch detected, push current segment
      segments.push(finalizeSegment(currentText, isBuildingChinese, targetCharset));
      currentText = char;
      isBuildingChinese = isCharChinese;
    }
  }

  if (currentText) {
    segments.push(finalizeSegment(currentText, isBuildingChinese, targetCharset));
  }

  return segments;
}

function finalizeSegment(text: string, isChinese: boolean, targetCharset: RegExp): TextSegment {
  if (isChinese) {
    return { text, isTarget: false };
  }
  
  // For non-Chinese segments, they are only "Target" if they contain
  // at least one character from the target language charset.
  // This prevents pure punctuation (e.g. "()") from being highlighted.
  const containsTargetChar = targetCharset.test(text);
  
  return {
    text,
    isTarget: containsTargetChar
  };
}
