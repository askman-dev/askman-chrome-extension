import { AgentContext } from '../types';
import { BaseAgent } from './base';

export class QuoteContext implements AgentContext {
  public selection?: string;
  public pageUrl?: string;
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
    quote.pageUrl = pageUrl;
    quote.selection = document.getSelection()?.toString();
    return Promise.resolve(quote);
  }
  public static getQuoteBySelection(pageUrl: string, selection: string): Promise<QuoteContext> {
    const quote = new QuoteContext();
    quote.pageUrl = pageUrl;
    quote.selection = selection;
    return Promise.resolve(quote);
  }
}