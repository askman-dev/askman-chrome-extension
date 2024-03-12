export interface BaseAgent {}

export class ActionButtonHelper {
  static createShadowRoot(): HTMLElement {
    const root = document.createElement('askman-chrome-extension-content-action-button-wrap');
    // root.className = 'askman-chrome-extension-content-action-button-wrap';
    document.body.append(root);

    const rootIntoShadow = document.createElement('div');
    rootIntoShadow.id = 'shadow-root';

    const shadowRoot = root.attachShadow({ mode: 'open' });
    shadowRoot.appendChild(rootIntoShadow);

    /** Inject styles into shadow dom */
    const styleElement = document.createElement('style');
    // TODO support every component has a style file
    // styleElement.innerHTML = injectedStyle;
    shadowRoot.appendChild(styleElement);
    return root;
  }
}
export class AgentManager {
  private baseAgentList: BaseAgent[] = [];
  public constructor() {}

  public addAgent(agent: BaseAgent) {
    this.baseAgentList.push(agent);
  }
}
