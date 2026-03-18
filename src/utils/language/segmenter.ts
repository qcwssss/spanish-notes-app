import { extractTargetText, LANGUAGE_ALPHABETS } from './extractor';

export type TextSegment = {
  text: string;
  type: 'target' | 'plain';
};

const WRAPPER_BRIDGE = /^[\s:"“”'‘’()\[\]{}-]+$/;
const CLOSING_WRAPPER = /^[\s"”'’)\]}]+$/;

function isWrapperBridge(text: string): boolean {
  return WRAPPER_BRIDGE.test(text);
}

function isClosingWrapper(text: string): boolean {
  return CLOSING_WRAPPER.test(text);
}

export function segmentText(text: string, language: string | null = 'es'): TextSegment[] {
  if (!text) return [];

  const segments: TextSegment[] = [];

  // Dynamic Regex Construction
  // 1. Get alphabet for target language (default to Spanish if not found)
  const langKey = language && LANGUAGE_ALPHABETS[language] ? language : 'es';
  const range = LANGUAGE_ALPHABETS[langKey];

  // 2. Construct Regex dynamically
  // Structure:
  // - Optional leading inverted punctuation (¿¡) - hardcoded common ones as they are safe
  // - Words (Alphabet chars)
  // - Apostrophes within words
  // - Space/Comma/Semicolon/Period separators between words
  // - Optional ending punctuation such as ?, !, or .
  const targetPattern = new RegExp(`([¿¡]?[${range}]+(?:['’][${range}]+)*(?:[ ,;.]+[${range}]+(?:['’][${range}]+)*)*[?!.]?)`, 'g');

  const lines = text.split('\n');

  lines.forEach((line, i) => {
    let lastIndex = 0;
    let match;

    while ((match = targetPattern.exec(line)) !== null) {
      if (match.index > lastIndex) {
        segments.push({
          text: line.slice(lastIndex, match.index),
          type: 'plain'
        });
      }

      const potentialTarget = match[0];
      if (extractTargetText(potentialTarget, language).length > 0) {
        segments.push({
          text: potentialTarget,
          type: 'target'
        });
      } else {
        segments.push({
          text: potentialTarget,
          type: 'plain'
        });
      }

      lastIndex = targetPattern.lastIndex;
    }

    if (lastIndex < line.length) {
      segments.push({
        text: line.slice(lastIndex),
        type: 'plain'
      });
    }

    if (i < lines.length - 1) {
      segments.push({ text: '\n', type: 'plain' });
    }
  });

  const mergedPlain: TextSegment[] = [];
  segments.forEach((segment) => {
    if (
      mergedPlain.length > 0 &&
      mergedPlain[mergedPlain.length - 1].type === 'plain' &&
      segment.type === 'plain'
    ) {
      mergedPlain[mergedPlain.length - 1].text += segment.text;
    } else {
      mergedPlain.push(segment);
    }
  });

  const collapsed: TextSegment[] = [];
  let index = 0;

  while (index < mergedPlain.length) {
    const current = mergedPlain[index];
    let combinedText = '';
    let cursor = index;

    if (current.type === 'plain') {
      const next = mergedPlain[index + 1];

      if (!next || next.type !== 'target' || !isWrapperBridge(current.text)) {
        collapsed.push(current);
        index += 1;
        continue;
      }

      combinedText = current.text + next.text;
      cursor += 1;
    } else {
      combinedText = current.text;
    }

    while (
      cursor + 2 < mergedPlain.length &&
      mergedPlain[cursor + 1].type === 'plain' &&
      mergedPlain[cursor + 2].type === 'target' &&
      isWrapperBridge(mergedPlain[cursor + 1].text)
    ) {
      combinedText += mergedPlain[cursor + 1].text + mergedPlain[cursor + 2].text;
      cursor += 2;
    }

    while (
      cursor + 1 < mergedPlain.length &&
      mergedPlain[cursor + 1].type === 'plain' &&
      isClosingWrapper(mergedPlain[cursor + 1].text)
    ) {
      combinedText += mergedPlain[cursor + 1].text;
      cursor += 1;
    }

    collapsed.push({ text: combinedText, type: 'target' });
    index = cursor + 1;
  }

  return collapsed;
}
