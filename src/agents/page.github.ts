import { BaseAgent } from './base';
import { QuoteContext } from './quote';

export class PageGithubAgent implements BaseAgent {
  public name = 'PageGithubAgent';

  public static async getReadmeByDocument(pageUrl: string, selection: string): Promise<QuoteContext> {
    const quote = new QuoteContext();
    quote.type = 'selection';
    quote.pageUrl = pageUrl;
    quote.selection = selection;
    return Promise.resolve(quote);
  }

  public static isSupport(pageUrl: string): boolean {
    return /https:\/\/github\.com\/.+?\/.+?/.test(pageUrl);
  }
  public static findActionButtonContainer(doc): HTMLDivElement | null {
    const editBtn = Array.prototype.filter.call(doc.getElementsByTagName('button'), e => {
      return e.getAttribute('aria-label') == 'Edit file' || e.getAttribute('aria-label') == 'Edit README';
    });

    if (!editBtn || editBtn.length === 0) {
      console.log('找不到 readme 按钮');
      return;
    }
    console.log('找到 readme 按钮:', editBtn);

    // editBtn[0].parentNode.insertBefore(button, editBtn[0]);
    return editBtn[0].parentElement;
  }
}
