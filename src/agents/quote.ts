import { AgentContext } from '../types';
import { BaseAgent } from './base';

export class QuoteContext implements AgentContext {
  public type: 'selection' | 'page' | 'link';
  public selection?: string;
  public pageUrl?: string;
  public pageTitle?: string;
  public linkText?: string;
  public linkUrl?: string;
}
export class QuoteAgent implements BaseAgent {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public static getQuoteByPageUrl(pageUrl: string): Promise<QuoteContext> {
    // TODO：异步更新，可以在对话框中显示 加载中
    return Promise.resolve(new QuoteContext());
  }
  public static getQuoteByDocument(pageUrl: string, document: Document): Promise<QuoteContext> {
    const quote = new QuoteContext();
    quote.type = 'page';
    quote.pageUrl = pageUrl;
    quote.pageTitle = document.title;
    quote.selection = document.getSelection()?.toString();
    console.log('getQuoteByDocument:', quote);
    return Promise.resolve(quote);
  }
  public static getQuoteBySelection(pageUrl: string, selection: string): Promise<QuoteContext> {
    const quote = new QuoteContext();
    quote.type = 'selection';
    quote.pageUrl = pageUrl;
    quote.selection = selection;
    return Promise.resolve(quote);
  }

  /**
   * 格式化引用文本
   * @param quote 引用上下文对象，包含引用类型和相关信息
   * @returns 返回格式化后的引用文本字符串
   */
  public static formatQuote(quote: QuoteContext): string {
    // 初始化一个空数组，用于存储格式化的引用文本行
    let quotes: string[] = [];

    // 根据引用类型添加页面标题和URL
    if (quote.type == 'selection' || quote.type == 'page') {
      quotes.push(`Title: ${quote.pageTitle}`);
      quotes.push(`URL: ${quote.pageUrl}`);
    }

    // 如果是选文引用类型，添加选文内容
    if (quote.type == 'selection') {
      quotes.push(`Selection: ${quote.selection}`);
    }

    // 如果有需要格式化的文本行，添加引用标识并格式化文本
    if (quotes.length) {
      quotes.unshift('[!QUOTE]');
      quotes = quotes.map(q => `> ${q}`);
      return quotes.join('\n') + '\n';
    }

    // 如果引用类型未知，输出警告并返回空字符串
    console.warn('未知的引用类型', quote);
    return '';
  }

  public static parseBlocks(text) {
    console.info('INPUT:', text);
    const lines = text.split('\n');
    const blocks = [];
    let currentBlock = null;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      if (line === '> [!QUOTE]') {
        if (currentBlock) {
          blocks.push(currentBlock);
        }
        currentBlock = { type: 'quote', content: [] };
      } else if (line.startsWith('```')) {
        if (currentBlock) {
          blocks.push(currentBlock);
        }
        currentBlock = { type: 'code', language: line.slice(3).trim(), content: [] };
        i++; // Skip the opening ```
        while (i < lines.length && !lines[i].trim().startsWith('```')) {
          currentBlock.content.push(lines[i]);
          i++;
        }
      } else if (currentBlock && currentBlock.type === 'quote' && line.startsWith('>')) {
        currentBlock.content.push(line.slice(1).trim());
      } else {
        if (currentBlock && currentBlock.type !== 'text') {
          blocks.push(currentBlock);
          currentBlock = null;
        }
        if (!currentBlock) {
          currentBlock = { type: 'text', content: [] };
        }
        if (line !== '') {
          currentBlock.content.push(line);
        }
      }
    }

    if (currentBlock) {
      blocks.push(currentBlock);
    }

    console.info('OUTPUT:', blocks);
    return blocks;
  }
}
