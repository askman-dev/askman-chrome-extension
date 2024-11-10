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
root.style.backgroundColor = 'transparent';
root.style.border = 'none';

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

// 会在某些网站插入唤起按钮，对按钮启用 twind 支持
const observer = new MutationObserver(function (mutationsList) {
  for (const mutation of mutationsList) {
    if (mutation.type === 'childList') {
      for (const node of mutation.addedNodes) {
        if (node instanceof window.Element && node.tagName === 'ASKMAN-CHROME-EXTENSION-CONTENT-ACTION-BUTTON-WRAP') {
          attachTwindStyle(node.shadowRoot.getElementById('shadow-root'), node.shadowRoot);
        }
      }
    }
  }
});
observer.observe(document, { childList: true, subtree: true });

/**
 * https://github.com/askman-dev/askman-chrome-extension/pull/174
 *
 * In the firefox environment, the adoptedStyleSheets bug may prevent contentStyle from being applied properly.
 * Please refer to the PR link above and go back to the contentStyle.css implementation, or raise a PR if you have a better way to improve it.
 */

createRoot(rootIntoShadow).render(<App />);
