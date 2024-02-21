import { createRoot } from 'react-dom/client';
import App from '@pages/content/ui/app';
import refreshOnUpdate from 'virtual:reload-on-update-in-view';
import injectedStyle from './injected.css?inline';
import { attachTwindStyle } from '@root/src/shared/style/twind';

refreshOnUpdate('pages/content');

const root = document.createElement('div');
root.id = 'askman-chrome-extension-content-view-root';
root.style.zIndex = '2147483646';
root.style.position = 'absolute';
root.style.right = '0';
root.style.top = '0';

document.body.append(root);

const rootIntoShadow = document.createElement('div');
rootIntoShadow.id = 'shadow-root';

const shadowRoot = root.attachShadow({ mode: 'open' });
shadowRoot.appendChild(rootIntoShadow);

/** Inject styles into shadow dom */
const styleElement = document.createElement('style');
styleElement.innerHTML = injectedStyle;
shadowRoot.appendChild(styleElement);

attachTwindStyle(rootIntoShadow, shadowRoot);

/**
 * https://github.com/askman-dev/askman-chrome-extension/pull/174
 *
 * In the firefox environment, the adoptedStyleSheets bug may prevent contentStyle from being applied properly.
 * Please refer to the PR link above and go back to the contentStyle.css implementation, or raise a PR if you have a better way to improve it.
 */

createRoot(rootIntoShadow).render(<App />);
