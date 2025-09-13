import { tool } from 'ai';
import { z } from 'zod';
import { CommandType } from '@src/types';

/**
 * Tool to get page text content
 */
export const getPageTextTool = tool({
  description: 'Get all text content from the current page',
  inputSchema: z.void(),
  execute: async () => {
    console.log('🚨🚨🚨 [Tool Execute] getPageText sending message to content script');
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab) {
      throw new Error('No active tab found');
    }
    const response = await chrome.tabs.sendMessage(tab.id, { cmd: CommandType.GetPageText });
    if (response && response.success) {
      console.log('🚨🚨🚨 [Tool Execute] getPageText received response from content script');
      return response.data.text;
    } else {
      throw new Error(response?.error || 'Failed to get page text from content script');
    }
  },
});

/**
 * Tool to get all links from the current page
 */
export const getPageLinksTool = tool({
  description: 'Get all links from the current page',
  inputSchema: z.void(),
  execute: async () => {
    console.log('🚨🚨🚨 [Tool Execute] getPageLinks sending message to content script');
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab) {
      throw new Error('No active tab found');
    }
    const response = await chrome.tabs.sendMessage(tab.id, { cmd: CommandType.GetPageLinks });
    if (response && response.success) {
      console.log('🚨🚨🚨 [Tool Execute] getPageLinks received response from content script');
      return response.data.links;
    } else {
      throw new Error(response?.error || 'Failed to get page links from content script');
    }
  },
});

/**
 * Tool to scroll the page by specified offset
 */
export const scrollPageTool = tool({
  description: 'Scroll the page by specified x and y offset in pixels',
  inputSchema: z.object({
    x: z.number().describe('Horizontal scroll offset in pixels'),
    y: z.number().describe('Vertical scroll offset in pixels'),
  }),
  execute: async ({ x, y }) => {
    console.log('🚨🚨🚨 [Tool Execute] scrollPage sending message to content script');
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab) {
      throw new Error('No active tab found');
    }
    const response = await chrome.tabs.sendMessage(tab.id, { cmd: CommandType.ScrollPage, data: { x, y } });
    if (response && response.success) {
      console.log('🚨🚨🚨 [Tool Execute] scrollPage received response from content script');
      return response.data.scrolled;
    } else {
      throw new Error(response?.error || 'Failed to scroll page from content script');
    }
  },
});

// Log tool creation
console.log('[Tool Creation] Creating pageTools object with tools:', {
  getPageText: {
    hasExecute: typeof getPageTextTool.execute === 'function',
    type: typeof getPageTextTool,
    keys: Object.keys(getPageTextTool || {})
  },
  getPageLinks: {
    hasExecute: typeof getPageLinksTool.execute === 'function',
    type: typeof getPageLinksTool,
    keys: Object.keys(getPageLinksTool || {})
  },
  scrollPage: {
    hasExecute: typeof scrollPageTool.execute === 'function',
    type: typeof scrollPageTool,
    keys: Object.keys(scrollPageTool || {})
  }
});

export const pageTools = {
  getPageText: getPageTextTool,
  getPageLinks: getPageLinksTool,
  scrollPage: scrollPageTool,
};

// Log after export
console.log('[Tool Export] pageTools exported:', pageTools);

// DEBUG: Tool execution environment check 
console.log('[Tool Debug] Environment info:', {
  hasDocument: typeof document !== 'undefined',
  hasWindow: typeof window !== 'undefined', 
  userAgent: typeof navigator !== 'undefined' ? navigator.userAgent.substring(0, 50) : 'NO_NAVIGATOR',
  isContentScript: typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id
});