import { describe, it, expect } from 'vitest';
import { segmentText } from '@/utils/language/segmenter';

describe('segmentText', () => {
  it('splits simple Spanish sentence', () => {
    const input = 'Hola mundo';
    const result = segmentText(input, 'es');
    expect(result).toEqual([
      { text: 'Hola mundo', type: 'target' }
    ]);
  });

  it('splits Spanish with parenthesis explanation', () => {
    const input = 'Hola (Hello)';
    const result = segmentText(input, 'es');
    expect(result).toEqual([
      { text: 'Hola', type: 'target' },
      { text: ' (', type: 'plain' },
      { text: 'Hello', type: 'target' },
      { text: ')', type: 'plain' }
    ]);
  });
  
  it('handles user example with table content', () => {
    // "El sábado... | 西班牙语"
    const input = 'El sábado por la mañana me despierto. | 西班牙语';
    const result = segmentText(input, 'es');
    
    // Expect: "El sábado... ." (Target) + " | 西班牙语" (Plain)
    // The regex matches full sentences.
    
    expect(result[0].type).toBe('target');
    expect(result[0].text).toContain('El sábado');
    
    // Find the Chinese part
    const chinesePart = result.find(s => s.text.includes('西班牙语'));
    expect(chinesePart?.type).toBe('plain');
  });

  it('handles mixed content in one line', () => {
     const input = 'Hola amigos, hoy es lunes. (Hello friends, today is Monday.)';
     const result = segmentText(input, 'es');
     
     // Since English words share the same charset (Latin) as Spanish, 
     // the simple regex extractor will identify them as "targets".
     // This is acceptable as long as they are distinct segments and not merging with Chinese.
     
     // Original: "Hola amigos, hoy es lunes. (Hello friends, today is Monday.)"
     
     // "Hola amigos, hoy es lunes." -> Target
     expect(result[0].text).toBe('Hola amigos, hoy es lunes.');
     expect(result[0].type).toBe('target');
     
     // " (" -> Plain
     expect(result[1].text).toBe(' (');
     expect(result[1].type).toBe('plain');
     
     // "Hello friends, today is Monday." -> Target (Greedy match of Latin chars)
     expect(result[2].text).toBe('Hello friends, today is Monday.');
     expect(result[2].type).toBe('target');
     
     // ")" -> Plain
     expect(result[3].text).toBe(')');
     expect(result[3].type).toBe('plain');
  });
});
