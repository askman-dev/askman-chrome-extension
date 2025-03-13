import { AgentContext } from '../types';
import { BaseAgent } from './base';
import { parseBlocks as parseXmlBlocks } from './utils/parseXmlBlock';

interface Block {
  type: string;
  content: string;
  metadata?: {
    tag?: string;
    [key: string]: string | undefined;
  };
}

interface ParseResult {
  block: Block;
  remainingText: string;
}

/**
 * 解析引用块
 * @param text 要解析的文本
 * @returns 解析结果，包含解析出的块和剩余文本；如果不是引用块则返回 null
 */
function parseQuoteBlock(text: string): ParseResult | null {
  const lines = text.split('\n');
  const quoteLines: string[] = [];
  let remainingLines: string[] = [];
  let isInQuote = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.startsWith('> [!QUOTE]')) {
      isInQuote = true;
      continue;
    }

    if (isInQuote) {
      if (line.startsWith('> ')) {
        quoteLines.push(line.slice(2)); // 去掉 '> '
      } else {
        remainingLines = lines.slice(i);
        break;
      }
    } else {
      return null; // 不是引用块
    }
  }

  if (!isInQuote || quoteLines.length === 0) {
    return null;
  }

  return {
    block: {
      type: 'quote',
      content: quoteLines.join('\n'),
    },
    remainingText: remainingLines.join('\n'),
  };
}

/**
 * 解析代码块
 * @param text 要解析的文本
 * @returns 解析结果，包含解析出的块和剩余文本；如果不是代码块则返回 null
 */
function parseCodeBlock(text: string): ParseResult | null {
  const lines = text.split('\n');
  const codeLines: string[] = [];
  let remainingLines: string[] = [];
  let isInCode = false;
  let language = '';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.startsWith('```')) {
      if (!isInCode) {
        isInCode = true;
        language = line.slice(3).trim();
      } else {
        remainingLines = lines.slice(i + 1);
        break;
      }
      continue;
    }

    if (isInCode) {
      codeLines.push(line);
    } else {
      return null; // 不是代码块
    }
  }

  if (!isInCode || codeLines.length === 0) {
    return null;
  }

  return {
    block: {
      type: 'code',
      content: codeLines.join('\n'),
      metadata: { language },
    },
    remainingText: remainingLines.join('\n'),
  };
}

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

  /**
   * 解析文本为一系列块，包括引用块、代码块、XML 块和普通文本块
   * @param text 要解析的文本
   * @returns 解析结果，包含解析出的所有块
   */
  public static parseBlocks(text: string): Block[] {
    const blocks: Block[] = [];
    let remainingText = text;

    while (remainingText) {
      // 1. 尝试解析引用块
      const quoteResult = parseQuoteBlock(remainingText);
      if (quoteResult) {
        blocks.push(quoteResult.block);
        remainingText = quoteResult.remainingText;
        continue;
      }

      // 2. 尝试解析代码块
      const codeResult = parseCodeBlock(remainingText);
      if (codeResult) {
        blocks.push(codeResult.block);
        remainingText = codeResult.remainingText;
        continue;
      }

      // 3. 尝试解析 XML 块
      const xmlBlocks = parseXmlBlocks(remainingText);
      if (xmlBlocks.length > 0) {
        blocks.push(...xmlBlocks);
        break;
      }

      // 4. 如果都不是特殊块，作为文本块处理
      if (remainingText.trim()) {
        blocks.push({
          type: 'text',
          content: remainingText.trim(),
        });
      }
      break;
    }

    return blocks;
  }
}
