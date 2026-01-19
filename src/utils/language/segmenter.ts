import { extractTargetText } from './extractor';

export type TextSegment = {
  text: string;
  type: 'target' | 'plain';
};

export function segmentText(text: string, language: string | null = 'es'): TextSegment[] {
  if (!text) return [];

  // 1. Split by common delimiters that separate languages (like parenthesis for translation)
  // But keep the delimiters to categorize them
  // Regex: 
  // ([A-Za-zÁÉÍÓÚÜÑáéíóúüñ¿¡]+(?:[ ,;.]+[A-Za-zÁÉÍÓÚÜÑáéíóúüñ¿¡]+)*[.?!]?) 
  // -> Matches Spanish sentences/phrases
  
  // Simplified approach: Split by non-target blocks
  // If we have "El perro (The dog)", we want ["El perro", " (The dog)"]
  
  const segments: TextSegment[] = [];
  let current = '';
  let isTarget = false;

  // We scan char by char to determine boundaries. 
  // This is a basic implementation. For complex mixed text, we might need a better parser.
  // Assumption: Target text is Spanish chars. Non-target is CJK or English inside parens.
  
  // Heuristic:
  // If a block is > 50% target chars, it's target.
  // Actually, let's use the regex from extractor.
  
  // Splitting by newline first ensures we handle lines correctly
  const lines = text.split('\n');
  
  lines.forEach((line, i) => {
    // For each line, try to extract continuous Spanish segments
    
    // Regex explanation:
    // ([¿¡]?[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]+(?:['’][A-Za-zÁÉÍÓÚÜÑáéíóúüñ]+)*(?:[ ,;.]+[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]+(?:['’][A-Za-zÁÉÍÓÚÜÑáéíóúüñ]+)*)*[?!.]?)
    // Tries to grab a full sentence including punctuation.
    
    const targetPattern = /([¿¡]?[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]+(?:['’][A-Za-zÁÉÍÓÚÜÑáéíóúüñ]+)*(?:[ ,;.]+[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]+(?:['’][A-Za-zÁÉÍÓÚÜÑáéíóúüñ]+)*)*[?!.]?)/g;
    
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
