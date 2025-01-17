import { AgentContext } from '../types';
import { BaseAgent } from './base';

export class QuoteContext implements AgentContext {
  public type: 'page.selection' | 'page.title' | 'page.url' | 'page.content' | 'page' | 'chat.input';
  public usageType?: 'template_var' | 'mention' | null; // 标记变量使用类型：模板变量、用户引用，或未使用
  public key?: string; // 用于在模板中引用的实际变量名
  public name?: string;
  public selection?: string;
  public pageUrl?: string;
  public pageTitle?: string;
  public pageContent?: string;
  public linkText?: string;
  public linkUrl?: string;
  public text?: string;
  public browserLanguage?: string;
}
export class QuoteAgent implements BaseAgent {
  public static getQuoteByPageUrl(_pageUrl: string): Promise<QuoteContext> {
    // TODO：异步更新，可以在对话框中显示 加载中
    return Promise.resolve(new QuoteContext());
  }
  public static getQuoteByDocument(pageUrl: string, document: Document): Promise<QuoteContext> {
    const quote = new QuoteContext();
    quote.type = 'page';
    quote.pageUrl = pageUrl;
    quote.pageTitle = document.title;
    quote.pageContent = document.body.innerText;
    quote.selection = document.getSelection()?.toString().trim();
    quote.browserLanguage = navigator?.language;
    // console.log('getQuoteByDocument:', quote);
    return Promise.resolve(quote);
  }
  public static getQuoteBySelection(pageUrl: string, selection: string): Promise<QuoteContext> {
    const quote = new QuoteContext();
    quote.type = 'page.selection';
    quote.pageUrl = pageUrl;
    quote.selection = selection;
    quote.browserLanguage = navigator.language;
    return Promise.resolve(quote);
  }

  /**
   * 格式化引用文本
   * @param quote 引用上下文对象，包含引用类型和相关信息
   * @returns 返回格式化后的引用文本字符串
   */
  public static formatQuotes(quotes: string[]): string {
    // 如果有需要格式化的文本行，添加引用标识并格式化文本
    if (quotes.length) {
      quotes.unshift('[!QUOTE]');
      // 如果有多行，需要同时加上 '> ' 前缀
      quotes = quotes.map(q => {
        let lines = q.split('\n');
        lines = lines.map(l => `> ${l}`);
        return lines.join('\n');
      });
      return quotes.join('\n') + '\n';
    }

    // 如果引用类型未知，输出警告并返回空字符串
    console.warn('Unknown quote type:', quotes);
    return '';
  }

  public static promptQuote(quote: QuoteContext): string {
    const quotes: string[] = [];

    if ((quote.type === 'page.selection' || quote.type === 'page') && quote.selection) {
      quotes.push(`<selection>${quote.selection}</selection>`);
    }

    if ((quote.type === 'page.title' || quote.type === 'page') && quote.pageTitle) {
      quotes.push(`<title>${quote.pageTitle}</title>`);
    }

    if ((quote.type === 'page.url' || quote.type === 'page') && quote.pageUrl) {
      quotes.push(`<url>${quote.pageUrl}</url>`);
    }

    if ((quote.type === 'page.content' || quote.type === 'page') && quote.pageContent) {
      quotes.push(`<content>${quote.pageContent}</content>`);
    }

    return quotes.join('\n');
  }

  public static parseBlocks(text) {
    // console.info('INPUT:', text);
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

    // console.info('OUTPUT:', blocks);
    return blocks;
  }
}
