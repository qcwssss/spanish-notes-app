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
      { text: 'Hola (Hello)', type: 'target' }
    ]);
  });

  it('keeps parenthesized text at the start in the same segment', () => {
    const input = '(Hola)';
    const result = segmentText(input, 'es');
    expect(result).toEqual([
      { text: '(Hola)', type: 'target' }
    ]);
  });

  it('keeps quoted text in the same segment', () => {
    const input = 'Ella dijo: "Hola amigo."';
    const result = segmentText(input, 'es');
    expect(result).toEqual([
      { text: 'Ella dijo: "Hola amigo."', type: 'target' }
    ]);
  });

  it('keeps curly quoted text in the same segment', () => {
    const input = 'Ella dijo: “Hola amigo.”';
    const result = segmentText(input, 'es');
    expect(result).toEqual([
      { text: 'Ella dijo: “Hola amigo.”', type: 'target' }
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

    expect(result[0].text).toBe('Hola amigos, hoy es lunes. (Hello friends, today is Monday.)');
    expect(result[0].type).toBe('target');
    expect(result).toHaveLength(1);
  });
});
