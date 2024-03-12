import { ActionButtonHelper, BaseAgent } from '../base';

export class PageStackoverflowAgent implements BaseAgent {
  public name = 'PageStackoverflowAgent';

  public static isSupport(pageUrl: string): boolean {
    return /https:\/\/stackoverflow\.com\/questions\/\d+?\/.+?/.test(pageUrl);
  }
  public static findActionButtonContainer(doc): HTMLDivElement | null {
    const side = doc.getElementById('sidebar');
    let wrap;
    if (side && side.getElementsByTagName('askman-chrome-extension-content-action-button-wrap').length) {
      wrap = side.getElementsByTagName('askman-chrome-extension-content-action-button-wrap')[0];
    } else {
      wrap = ActionButtonHelper.createShadowRoot()
      side.insertBefore(wrap, side.firstChild);
    }

    if (!side) {
      console.log('找不到 side');
      return;
    }
    console.log('找到 side:', side);

    // editBtn[0].parentNode.insertBefore(button, editBtn[0]);
    return wrap.shadowRoot.getElementById("shadow-root");
  }
}
