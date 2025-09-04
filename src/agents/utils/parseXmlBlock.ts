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

    // Check for single-line tags: <tag>content</tag>
    const singleLineMatch = line.match(
      /^<(webpage_info|webpage_content|title|url|reference|content|selection)>(.*?)<\/\1>$/,
    );

    if (singleLineMatch && depth === 0) {
      if (textBlock) {
        blocks.push(textBlock);
        textBlock = null;
      }

      const tag = singleLineMatch[1]; // First capture group
      const content = singleLineMatch[2]; // Second capture group

      // Special handling for webpage_info: parse its content and expand inner tags
      if (tag === 'webpage_info' && content) {
        const innerBlocks = parseBlocks(content);
        blocks.push(...innerBlocks);
      } else {
        blocks.push({
          type: tag,
          content: content,
          metadata: { tag: tag },
        });
      }
      return;
    }

    // Multi-line tag logic with support for content on same line as opening tag
    const startTagMatch = line.match(/^<(webpage_info|webpage_content|title|url|reference|content|selection)>(.*)$/);
    const endTagMatch = line.match(/^<\/(webpage_info|webpage_content|title|url|reference|content|selection)>$/);
    const endTagInLineMatch = line.match(/<\/(webpage_info|webpage_content|title|url|reference|content|selection)>$/);

    if (startTagMatch && depth === 0) {
      if (textBlock) {
        blocks.push(textBlock);
        textBlock = null;
      }

      const tag = startTagMatch[1]; // First capture group
      const firstLineContent = startTagMatch[2]; // Second capture group

      currentBlock = {
        type: tag,
        content: firstLineContent, // Content from first line (can be empty)
        metadata: { tag: tag },
      };
      currentTag = tag;
      depth = 1;
    } else if (endTagMatch && depth === 1 && endTagMatch[1] === currentTag) {
      // 只有当结束标签与当前处理的标签名匹配时，才减少深度
      depth = 0;
      if (currentBlock) {
        // Special handling for webpage_info: parse its content and expand inner tags
        if (currentBlock.type === 'webpage_info' && currentBlock.content) {
          const innerBlocks = parseBlocks(currentBlock.content);
          blocks.push(...innerBlocks);
        } else {
          blocks.push(currentBlock);
        }
        currentBlock = null;
      }
    } else if (endTagInLineMatch && depth === 1 && endTagInLineMatch[1] === currentTag) {
      // Handle end tag that appears at the end of content line
      const contentBeforeTag = line.substring(0, line.lastIndexOf(`</${endTagInLineMatch[1]}>`));
      if (currentBlock) {
        currentBlock.content += (currentBlock.content ? '\n' : '') + contentBeforeTag;
        // Special handling for webpage_info: parse its content and expand inner tags
        if (currentBlock.type === 'webpage_info' && currentBlock.content) {
          const innerBlocks = parseBlocks(currentBlock.content);
          blocks.push(...innerBlocks);
        } else {
          blocks.push(currentBlock);
        }
        currentBlock = null;
      }
      depth = 0;
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
