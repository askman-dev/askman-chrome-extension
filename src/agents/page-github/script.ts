import { ActionButtonHelper, BaseAgent } from '../base';
import { QuoteContext } from '../quote';

export class PageGithubAgent implements BaseAgent {
  public name = 'PageGithubAgent';

  public static async getReadmeByDocument(pageUrl: string, selection: string): Promise<QuoteContext> {
    const quote = new QuoteContext();
    quote.type = 'page.selection';
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
    let wrap;
    if (editBtn[0].parentElement.getElementsByTagName('askman-chrome-extension-content-action-button-wrap').length) {
      wrap = editBtn[0].parentElement.getElementsByTagName('askman-chrome-extension-content-action-button-wrap')[0];
    } else {
      wrap = ActionButtonHelper.createShadowRoot();
      editBtn[0].parentElement.insertBefore(wrap, editBtn[0]);
    }
    console.log('找到 readme 按钮:', editBtn);

    return wrap.shadowRoot.getElementById('shadow-root');
  }
}
