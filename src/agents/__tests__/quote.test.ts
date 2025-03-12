import { describe, expect, test } from 'vitest';
import { QuoteAgent } from '../quote';

describe('QuoteAgent.parseBlocks', () => {
  test('should parse quote block correctly', () => {
    const input = `> [!QUOTE]
> This is a quote line 1
> This is a quote line 2
Some text after quote`;

    const result = QuoteAgent.parseBlocks(input);

    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({
      type: 'quote',
      content: 'This is a quote line 1\nThis is a quote line 2',
    });
    expect(result[1]).toEqual({
      type: 'text',
      content: 'Some text after quote',
    });
  });

  test('should parse code block correctly', () => {
    const input = '```typescript\nconst x = 1;\nconst y = 2;\n```\nText after code';

    const result = QuoteAgent.parseBlocks(input);

    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({
      type: 'code',
      content: 'const x = 1;\nconst y = 2;',
      metadata: {
        language: 'typescript',
      },
    });
    expect(result[1]).toEqual({
      type: 'text',
      content: 'Text after code',
    });
  });

  test('should parse XML block correctly', () => {
    const input = `<reference>
Line 1 of reference
Line 2 of reference
</reference>
Some text after reference`;

    const result = QuoteAgent.parseBlocks(input);

    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({
      type: 'reference',
      content: 'Line 1 of reference\nLine 2 of reference',
      metadata: {
        tag: 'reference',
      },
    });
    expect(result[1]).toEqual({
      type: 'text',
      content: 'Some text after reference',
    });
  });
});
