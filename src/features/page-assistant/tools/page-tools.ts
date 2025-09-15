import { tool } from 'ai';
import { z } from 'zod';

/**
 * Tool to get page text content - Direct execution in content script
 */
export const getPageTextTool = tool({
  description: 'Get all text content from the current page',
  inputSchema: z.object({
    _noop: z.boolean().optional().describe('Internal placeholder - leave empty'),
  }),
  execute: async () => {
    console.log('🚨🚨🚨 [Tool Execute] getPageText DIRECTLY in content script');
    console.log('🚨🚨🚨 [Tool Execute] Environment check:', {
      hasDocument: typeof document !== 'undefined',
      hasBody: typeof document?.body !== 'undefined',
      location: typeof window !== 'undefined' ? window.location.href : 'NO WINDOW',
      context: typeof chrome !== 'undefined' ? 'CHROME_EXTENSION' : 'UNKNOWN',
    });

    try {
      // Direct DOM access in content script
      const text = document.body.innerText || document.body.textContent || '';
      const trimmedText = text.trim();
      console.log('🚨🚨🚨 [Tool Execute] getPageText RETURNING:', {
        success: true,
        textLength: trimmedText.length,
        preview: trimmedText.substring(0, 100),
      });
      return trimmedText;
    } catch (error) {
      console.error('🚨🚨🚨 [Tool Execute] getPageText FAILED:', error);
      throw new Error(`Failed to get page text: ${error.message}`);
    }
  },
});

/**
 * Tool to get all links from the current page - Direct execution in content script
 */
export const getPageLinksTool = tool({
  description: 'Get all links from the current page',
  inputSchema: z.object({
    _noop: z.boolean().optional().describe('Internal placeholder - leave empty'),
  }),
  execute: async () => {
    console.log('🚨🚨🚨 [Tool Execute] getPageLinks DIRECTLY in content script');
    try {
      // Direct DOM access in content script
      const links = Array.from(document.querySelectorAll('a[href]'))
        .map(link => {
          const anchor = link as HTMLAnchorElement;
          return {
            text: anchor.textContent?.trim() || '',
            href: anchor.href,
            title: anchor.title || '',
          };
        })
        .filter(link => link.text || link.title); // Only include links with text or title

      console.log('🚨🚨🚨 [Tool Execute] getPageLinks RETURNING:', {
        success: true,
        linkCount: links.length,
        firstLinks: links.slice(0, 3),
      });
      return links;
    } catch (error) {
      console.error('🚨🚨🚨 [Tool Execute] getPageLinks FAILED:', error);
      throw new Error(`Failed to get page links: ${error.message}`);
    }
  },
});

/**
 * Tool to scroll the page by specified offset - Direct execution in content script
 */
export const scrollPageTool = tool({
  description: 'Scroll the page by specified x and y offset in pixels',
  inputSchema: z.object({
    x: z.number().describe('Horizontal scroll offset in pixels'),
    y: z.number().describe('Vertical scroll offset in pixels'),
  }),
  execute: async ({ x, y }) => {
    console.log('🚨🚨🚨 [Tool Execute] scrollPage DIRECTLY in content script with params:', { x, y });
    try {
      // Direct scroll in content script
      const beforeScroll = { x: window.scrollX, y: window.scrollY };
      window.scrollBy(x, y);
      const afterScroll = { x: window.scrollX, y: window.scrollY };
      const message = `Scrolled page by ${x}px horizontally and ${y}px vertically`;
      console.log('🚨🚨🚨 [Tool Execute] scrollPage RETURNING:', {
        success: true,
        message,
        beforeScroll,
        afterScroll,
      });
      return message;
    } catch (error) {
      console.error('🚨🚨🚨 [Tool Execute] scrollPage FAILED:', error);
      throw new Error(`Failed to scroll page: ${error.message}`);
    }
  },
});

export const pageTools = {
  getPageText: getPageTextTool,
  getPageLinks: getPageLinksTool,
  scrollPage: scrollPageTool,
};

console.log('[Tools] 🛠️ Content script tools initialized:', Object.keys(pageTools));
