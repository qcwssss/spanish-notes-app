import { useMemo } from 'react';

export interface ParsedLine {
  type: 'heading' | 'table' | 'text-block' | 'text';
  content: string | ParsedTable | ParsedTextBlock;
  raw: string;
}

export interface ParsedTable {
  headers: string[];
  rows: string[][];
}

export interface ParsedTextBlock {
  spanish: string;
  chinese: string;
}

const REGEX_HEADING_NUMBER = /^##\s*[①-⑩0-9.]+\s*/;
const REGEX_HEADING_MARKER = /^##\s*/;
const REGEX_CHINESE_CHAR = /[\u4e00-\u9fa5]/;

export const useAudioParser = (markdown: string) => {
  const parsedContent = useMemo(() => {
    const lines = markdown.split('\n');
    const result: ParsedLine[] = [];
    let i = 0;

    while (i < lines.length) {
      const line = lines[i].trim();
      if (!line) {
        i++;
        continue;
      }

      // 1. Heading (##)
      if (line.startsWith('##')) {
        const cleanText = line
          .replace(REGEX_HEADING_NUMBER, '') // Remove numbers
          .replace(REGEX_HEADING_MARKER, '') // Remove remaining ##
          .trim();
        
        result.push({
          type: 'heading',
          content: cleanText,
          raw: line
        });
        i++;
      }
      // 2. Table (|...|)
      else if (line.startsWith('|')) {
        const headers = line.split('|').filter(c => c.trim()).map(c => c.trim());
        const rows: string[][] = [];
        
        i++; // Move to next line (separator or row)
        
        while (i < lines.length && lines[i].trim().startsWith('|')) {
          const rowLine = lines[i].trim();
          
          // Skip separator line (e.g. |---|---|)
          if (rowLine.includes('---')) {
            i++;
            continue;
          }

          const cells = rowLine
            .split('|')
            .map(c => c.trim())
            .filter((c, idx, arr) => idx !== 0 && idx !== arr.length - 1); // Remove first and last empty splits
            
          rows.push(cells);
          i++;
        }

        result.push({
          type: 'table',
          content: { headers, rows },
          raw: 'Table'
        });
      }
      // 3. Text Block (Spanish line + Chinese line)
      else {
        const hasChinese = REGEX_CHINESE_CHAR.test(line);
        // If current line is NOT Chinese, and next line IS Chinese
        if (!hasChinese && i + 1 < lines.length && REGEX_CHINESE_CHAR.test(lines[i + 1])) {
          result.push({
            type: 'text-block',
            content: {
              spanish: line,
              chinese: lines[i + 1]
            },
            raw: line + '\n' + lines[i + 1]
          });
          i += 2;
        } else {
          // 4. Regular Text
          result.push({
            type: 'text',
            content: line,
            raw: line
          });
          i++;
        }
      }
    }

    return result;
  }, [markdown]);

  return parsedContent;
};
