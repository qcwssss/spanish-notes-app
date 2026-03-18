import { extractTargetText, LANGUAGE_ALPHABETS } from './extractor';

export type TextSegment = {
  text: string;
  type: 'target' | 'plain';
};

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
  // - Optional ending punctuation (?!.)
  const targetPattern = new RegExp(
    `([¿¡]?[${range}]+(?:['’][${range}]+)*(?:[ ,;.:"“”‘’()]+[${range}]+(?:['’][${range}]+)*)*[?!.]?[\")”’]*[?!.]?)`,
    'g'
  );

  const lines = text.split('\n');
  
  lines.forEach((line, i) => {
    let lastIndex = 0;
    let match;
    
    while ((match = targetPattern.exec(line)) !== null) {
      // Content before the match (Plain)
      if (match.index > lastIndex) {
        segments.push({
          text: line.slice(lastIndex, match.index),
          type: 'plain'
        });
      }
      
      // The match itself (Target?)
      // We double check if it's actually valid target text (not just random letters)
      const potentialTarget = match[0];
      if (extractTargetText(potentialTarget, language).length > 0) {
          segments.push({
            text: potentialTarget,
            type: 'target'
          });
      } else {
          segments.push({
            text: potentialTarget, // Treat as plain if it filters to empty
            type: 'plain'
          });
      }
      
      lastIndex = targetPattern.lastIndex;
    }
    
    // Remaining content
    if (lastIndex < line.length) {
      segments.push({
        text: line.slice(lastIndex),
        type: 'plain'
      });
    }
    
    // Add newline segment if not last line
    if (i < lines.length - 1) {
       segments.push({ text: '\n', type: 'plain' });
    }
  });

  // Post-processing: Merge adjacent 'plain' segments to reduce DOM nodes
  const merged: TextSegment[] = [];
  segments.forEach(seg => {
      if (merged.length > 0 && merged[merged.length - 1].type === 'plain' && seg.type === 'plain') {
          merged[merged.length - 1].text += seg.text;
      } else {
          merged.push(seg);
      }
  });

  return merged;
}
