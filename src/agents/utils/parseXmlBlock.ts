interface Block {
  type: string;
  content: string;
  metadata?: {
    tag?: string;
    [key: string]: string | undefined;
  };
}

/**
 * Parse text into a series of blocks, including XML blocks and plain text blocks.
 * This function follows specific parsing rules to ensure consistent and predictable results.
 *
 * Parsing Rules:
 * 1. XML Tag Requirements:
 *    - Each XML tag must appear on its own line
 *    - Opening tag: <tag>
 *    - Closing tag: </tag>
 *    Example:
 *    ```
 *    <reference>
 *    content here
 *    </reference>
 *    ```
 *
 * 2. Supported Tags:
 *    - webpage_info: For webpage information blocks
 *    - title: For title blocks
 *    - url: For URL blocks
 *    - reference: For reference blocks
 *    - content: For content blocks
 *
 * 3. Content Handling:
 *    - Preserves empty lines within content
 *    - Preserves nested tag text as plain text
 *    - Non-XML content is parsed as text blocks
 *    - Content from nested tags is included in the parent block's content
 *
 * 4. Error Handling:
 *    - Malformed XML (missing closing tags) is treated as plain text
 *    - Only processes outermost tags, nested tags are preserved as text
 *
 * @example Parse a simple XML block
 * ```typescript
 * const input = '<reference>\nSome content\n</reference>';
 * const blocks = parseBlocks(input);
 * // Returns:
 * // [{
 * //   type: 'reference',
 * //   content: 'Some content',
 * //   metadata: { tag: 'reference' }
 * // }]
 * ```
 *
 * @example Handle nested tags
 * ```typescript
 * const input = '<reference>\nText with <content>nested content</content>\n</reference>';
 * const blocks = parseBlocks(input);
 * // Returns:
 * // [{
 * //   type: 'reference',
 * //   content: 'Text with <content>nested content</content>',
 * //   metadata: { tag: 'reference' }
 * // }]
 * ```
 *
 * @example Process malformed XML
 * ```typescript
 * const input = '<reference>\nUnclosed content';
 * const blocks = parseBlocks(input);
 * // Returns:
 * // [{
 * //   type: 'text',
 * //   content: '<reference>\nUnclosed content'
 * // }]
 * ```
 *
 * @param text - The input text to parse
 * @returns An array of Block objects representing the parsed content
 */
export function parseBlocks(text: string): Block[] {
  const blocks: Block[] = [];
  const lines = text.split('\n');
  let currentBlock: Block | null = null;
  let textBlock: Block | null = null;
  let depth = 0;
  const allLines: string[] = []; // Store all lines for handling malformed XML cases
  let currentTag = ''; // 记录当前处理的标签名

  lines.forEach(line => {
    allLines.push(line);
    const startTagMatch = line.match(/^<(?<tag>webpage_info|webpage_content|title|url|reference|content)>/);
    const endTagMatch = line.match(/^<\/(?<tag>webpage_info|webpage_content|title|url|reference|content)>$/);

    if (startTagMatch && depth === 0) {
      if (textBlock) {
        blocks.push(textBlock);
        textBlock = null;
      }
      currentBlock = {
        type: startTagMatch.groups.tag,
        content: '',
        metadata: { tag: startTagMatch.groups.tag },
      };
      currentTag = startTagMatch.groups.tag; // 记录当前标签名
      depth = 1;
    } else if (endTagMatch && depth === 1 && endTagMatch.groups.tag === currentTag) {
      // 只有当结束标签与当前处理的标签名匹配时，才减少深度
      depth = 0;
      if (currentBlock) {
        blocks.push(currentBlock);
        currentBlock = null;
      }
    } else if (currentBlock && depth > 0) {
      currentBlock.content += (currentBlock.content ? '\n' : '') + line;
    } else {
      if (!textBlock) {
        textBlock = {
          type: 'text',
          content: line,
        };
      } else {
        textBlock.content += '\n' + line;
      }
    }
  });

  // 如果 depth > 0，说明 XML 不完整，将所有内容作为文本处理
  if (depth > 0) {
    return [
      {
        type: 'text',
        content: allLines.join('\n'),
      },
    ];
  }

  if (textBlock) {
    blocks.push(textBlock);
  }

  return blocks;
}
