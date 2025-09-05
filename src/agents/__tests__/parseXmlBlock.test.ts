import { describe, expect, it } from 'vitest';
import { parseBlocks } from '../utils/parseXmlBlock';

describe('parseBlocks', () => {
  it('should parse simple XML block', () => {
    const input =
      '<reference>\nSome helpful <content>Get Cody for free</content>\n information\n</reference>\nRemaining text';
    const blocks = parseBlocks(input);

    expect(blocks).toEqual([
      {
        type: 'reference',
        content: 'Some helpful <content>Get Cody for free</content>\n information',
        metadata: { tag: 'reference' },
      },
      {
        type: 'text',
        content: 'Remaining text',
      },
    ]);
  });

  it('should parse non-XML content as text block', () => {
    const input = 'Just some regular text\nwithout XML tags';
    const blocks = parseBlocks(input);

    expect(blocks).toEqual([
      {
        type: 'text',
        content: 'Just some regular text\nwithout XML tags',
      },
    ]);
  });

  it('should parse empty XML tags', () => {
    const input = '<reference>\n</reference>\nMore text';
    const blocks = parseBlocks(input);

    expect(blocks).toEqual([
      {
        type: 'reference',
        content: '',
        metadata: { tag: 'reference' },
      },
      {
        type: 'text',
        content: 'More text',
      },
    ]);
  });

  it('should parse XML tags with multiple lines', () => {
    const input = '<reference>\nLine 1\nLine 2\nLine 3\n</reference>\nOther content';
    const blocks = parseBlocks(input);

    expect(blocks).toEqual([
      {
        type: 'reference',
        content: 'Line 1\nLine 2\nLine 3',
        metadata: { tag: 'reference' },
      },
      {
        type: 'text',
        content: 'Other content',
      },
    ]);
  });

  it('should parse malformed XML as text', () => {
    const input = '<reference>\nSome content\nMore content';
    const blocks = parseBlocks(input);

    expect(blocks).toEqual([
      {
        type: 'text',
        content: '<reference>\nSome content\nMore content',
      },
    ]);
  });

  it('should preserve empty lines in content', () => {
    const input = '<reference>\nFirst line\n\nThird line\n</reference>\nNext';
    const blocks = parseBlocks(input);

    expect(blocks).toEqual([
      {
        type: 'reference',
        content: 'First line\n\nThird line',
        metadata: { tag: 'reference' },
      },
      {
        type: 'text',
        content: 'Next',
      },
    ]);
  });

  it('should parse different tag types', () => {
    const input = '<content>\nSome content here\n</content>\nAfter';
    const blocks = parseBlocks(input);

    expect(blocks).toEqual([
      {
        type: 'content',
        content: 'Some content here',
        metadata: { tag: 'content' },
      },
      {
        type: 'text',
        content: 'After',
      },
    ]);
  });

  it('should parse nested blocks', () => {
    const input = `<reference>
Below are some potentially helpful/relevant pieces of information
<content>
Get Cody for free
Book a demo
</content>
</reference>`;
    const blocks = parseBlocks(input);
    expect(blocks).toEqual([
      {
        type: 'reference',
        content:
          'Below are some potentially helpful/relevant pieces of information\n<content>\nGet Cody for free\nBook a demo\n</content>',
        metadata: { tag: 'reference' },
      },
    ]);
  });

  it('should parse multiple blocks correctly', () => {
    const input = `<reference>
Below are some potentially helpful/relevant pieces of information for figuring out to respond
<content>Example Domain

This domain is for use in illustrative examples in documents. You may use this domain in literature without prior coordination or asking for permission.

More information...</content>
</reference>

333`;

    const result = parseBlocks(input);
    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({
      type: 'reference',
      content:
        'Below are some potentially helpful/relevant pieces of information for figuring out to respond\n<content>Example Domain\n\nThis domain is for use in illustrative examples in documents. You may use this domain in literature without prior coordination or asking for permission.\n\nMore information...</content>',
      metadata: {
        tag: 'reference',
      },
    });
    expect(result[1]).toEqual({
      type: 'text',
      content: '\n333',
    });
  });

  it('should skip inner content tags', () => {
    const input = `<reference>
Below are some potentially 
<content>
Example Domain

This domain is 
</content>
</reference>

333`;

    const result = parseBlocks(input);
    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({
      type: 'reference',
      content: 'Below are some potentially \n<content>\nExample Domain\n\nThis domain is \n</content>',
      metadata: {
        tag: 'reference',
      },
    });
    expect(result[1]).toEqual({
      type: 'text',
      content: '\n333',
    });
  });

  it('should skip inner content tags', () => {
    const input = `You are an user input.

Here's the content you need to summarize:

<webpage_content>
1. 简介
2. 前言：AI4SE 的 2024 趋势
3. 前言：AI4SE 的 2024 总结
4. 第 1 部分：AI4SE 体系设计命名来看，可能与某种特定的评审或分析任务相关。
</webpage_content>

<user_input>
333
</user_input>

Instructions:
1. Carefully `;

    const result = parseBlocks(input);
    expect(result).toHaveLength(3);
  });

  it('should expand webpage_info tag and show individual inner tags', () => {
    const input = `<webpage_info>
<title>Example Domain</title>
<content>Example Domain

This domain is for use in illustrative examples in documents. You may use this domain in literature without prior coordination or asking for permission.

More information...</content>
</webpage_info>

333`;

    const result = parseBlocks(input);
    expect(result).toHaveLength(3);

    // Should expand webpage_info into individual tags
    expect(result[0]).toEqual({
      type: 'title',
      content: 'Example Domain',
      metadata: { tag: 'title' },
    });

    expect(result[1]).toEqual({
      type: 'content',
      content:
        'Example Domain\n\nThis domain is for use in illustrative examples in documents. You may use this domain in literature without prior coordination or asking for permission.\n\nMore information...',
      metadata: { tag: 'content' },
    });

    expect(result[2]).toEqual({
      type: 'text',
      content: '\n333',
    });
  });

  it('should parse content tag that starts with content on same line', () => {
    const input = `<content>Example Domain

This domain is for use in illustrative examples in documents. You may use this domain in literature without prior coordination or asking for permission.

More information...</content>

333`;

    const result = parseBlocks(input);
    expect(result).toHaveLength(2);

    expect(result[0]).toEqual({
      type: 'content',
      content:
        'Example Domain\n\nThis domain is for use in illustrative examples in documents. You may use this domain in literature without prior coordination or asking for permission.\n\nMore information...',
      metadata: { tag: 'content' },
    });

    expect(result[1]).toEqual({
      type: 'text',
      content: '\n333',
    });
  });

  it('should successfully expand simple webpage_info with title (working case)', () => {
    const input = `<webpage_info>
<title>Example Domain</title>
</webpage_info>

33333`;

    const result = parseBlocks(input);
    expect(result).toHaveLength(2);

    // Should expand webpage_info into individual tags
    expect(result[0]).toEqual({
      type: 'title',
      content: 'Example Domain',
      metadata: { tag: 'title' },
    });

    expect(result[1]).toEqual({
      type: 'text',
      content: '\n33333',
    });
  });
});
