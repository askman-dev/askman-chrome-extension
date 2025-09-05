import { createRoot } from 'react-dom/client';
import App from '@pages/content/ui/app';
import refreshOnUpdate from 'virtual:reload-on-update-in-view';
import injectedStyle from './injected.css?inline';
import monokaiStyle from 'highlight.js/styles/monokai.min.css?inline';
import contentStyles from './content-styles.css?inline';

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

/** Inject monokai highlight.js styles into shadow dom */
const monokaiStyleElement = document.createElement('style');
monokaiStyleElement.innerHTML = monokaiStyle;
shadowRoot.appendChild(monokaiStyleElement);

/** Inject content styles with Tailwind CSS into shadow dom */
const contentStyleElement = document.createElement('style');
contentStyleElement.innerHTML = contentStyles;
shadowRoot.appendChild(contentStyleElement);
console.log('Content styles with Tailwind CSS injected');

/** Inject additional inline styles for the popup panel */
function injectAdditionalStyles() {
  const additionalStyleElement = document.createElement('style');
  // Add any additional CSS needed for the popup panel
  additionalStyleElement.textContent = `
    /* Essential Tailwind reset and utilities */
    *, ::before, ::after { box-sizing: border-box; margin: 0; padding: 0; border: 0; }
    
    /* Core styles for the popup panel */
    .antialiased { -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }
    .bg-white { background-color: #ffffff !important; }
    .text-black { color: #000000 !important; }
    .text-gray-600 { color: #4b5563 !important; }
    .text-gray-800 { color: #1f2937 !important; }
    .text-white { color: #ffffff !important; }
    .bg-gray-100 { background-color: #f3f4f6 !important; }
    .bg-gray-300 { background-color: #d1d5db !important; }
    .bg-gray-800 { background-color: #1f2937 !important; }
    .bg-gray-900 { background-color: #111827 !important; }
    .bg-transparent { background-color: transparent !important; }
    .bg-gradient-to-r { background-image: linear-gradient(to right, var(--tw-gradient-stops)); }
    .from-white { --tw-gradient-from: #ffffff; --tw-gradient-to: rgb(255 255 255 / 0); --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to); }
    .via-white { --tw-gradient-to: rgb(255 255 255 / 0); --tw-gradient-stops: var(--tw-gradient-from), #ffffff, var(--tw-gradient-to); }
    .to-white\\/60 { --tw-gradient-to: rgb(255 255 255 / 0.6); }
    
    /* Borders */
    .border-gray-200 { border-color: #e5e7eb !important; }
    .border-gray { border-color: #9ca3af !important; }
    .border-black { border-color: #000000 !important; }
    .border-1 { border-width: 1px !important; }
    .border-solid { border-style: solid !important; }
    .rounded-lg { border-radius: 0.5rem !important; }
    .rounded-md { border-radius: 0.375rem !important; }
    .rounded-full { border-radius: 9999px !important; }
    
    /* Spacing */
    .p-1 { padding: 0.25rem !important; }
    .p-2 { padding: 0.5rem !important; }
    .p-4 { padding: 1rem !important; }
    .px-2 { padding-left: 0.5rem !important; padding-right: 0.5rem !important; }
    .py-1 { padding-top: 0.25rem !important; padding-bottom: 0.25rem !important; }
    .py-2 { padding-top: 0.5rem !important; padding-bottom: 0.5rem !important; }
    .py-0\\.5 { padding-top: 0.125rem !important; padding-bottom: 0.125rem !important; }
    .pb-2 { padding-bottom: 0.5rem !important; }
    .pr-2 { padding-right: 0.5rem !important; }
    .pt-32 { padding-top: 8rem !important; }
    .mb-2 { margin-bottom: 0.5rem !important; }
    .mr-2 { margin-right: 0.5rem !important; }
    .ml-2 { margin-left: 0.5rem !important; }
    .mx-2 { margin-left: 0.5rem !important; margin-right: 0.5rem !important; }
    .my-auto { margin-top: auto !important; margin-bottom: auto !important; }
    .mt-auto { margin-top: auto !important; }
    .mt-1 { margin-top: 0.25rem !important; }
    
    /* Sizing */
    .w-3 { width: 0.75rem !important; }
    .w-4 { width: 1rem !important; }
    .h-3 { height: 0.75rem !important; }
    .h-4 { height: 1rem !important; }
    .h-6 { height: 1.5rem !important; }
    .w-full { width: 100% !important; }
    .w-px { width: 1px !important; }
    .w-\\[473px\\] { width: 473px !important; }
    .w-\\[80\\%\\] { width: 80% !important; }
    .h-\\[80\\%\\] { height: 80% !important; }
    .min-w-80 { min-width: 20rem !important; }
    .max-w-lg { max-width: 32rem !important; }
    .min-h-\\[155px\\] { min-height: 155px !important; }
    .min-h-\\[3em\\] { min-height: 3em !important; }
    .max-h-80 { max-height: 20rem !important; }
    .min-w-\\[300px\\] { min-width: 300px !important; }
    .max-w-\\[150px\\] { max-width: 150px !important; }
    .max-w-\\[400px\\] { max-width: 400px !important; }
    
    /* Flexbox */
    .flex { display: flex !important; }
    .flex-col { flex-direction: column !important; }
    .flex-grow { flex-grow: 1 !important; }
    .flex-wrap { flex-wrap: wrap !important; }
    .inline-flex { display: inline-flex !important; }
    .inline-block { display: inline-block !important; }
    .items-center { align-items: center !important; }
    .items-start { align-items: flex-start !important; }
    .justify-between { justify-content: space-between !important; }
    .justify-start { justify-content: flex-start !important; }
    .gap-2 { gap: 0.5rem !important; }
    .grow { flex-grow: 1 !important; }
    
    /* Position */
    .fixed { position: fixed !important; }
    .absolute { position: absolute !important; }
    .relative { position: relative !important; }
    .top-0 { top: 0 !important; }
    .right-0 { right: 0 !important; }
    .right-\\[10px\\] { right: 10px !important; }
    .top-\\[10\\%\\] { top: 10% !important; }
    .left-0 { left: 0 !important; }
    .left-1\\/2 { left: 50% !important; }
    .-top-8 { top: -2rem !important; }
    .top-full { top: 100% !important; }
    
    /* Display */
    .visible { visibility: visible !important; }
    .invisible { visibility: hidden !important; }
    .group { position: relative; }
    
    /* Cursor */
    .cursor-pointer { cursor: pointer !important; }
    .cursor-not-allowed { cursor: not-allowed !important; }
    .pointer-events-none { pointer-events: none !important; }
    
    /* Effects */
    .drop-shadow-lg { filter: drop-shadow(0 10px 8px rgb(0 0 0 / 0.04)) drop-shadow(0 4px 3px rgb(0 0 0 / 0.1)) !important; }
    .shadow-lg { box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1) !important; }
    .outline-none { outline: 2px solid transparent !important; outline-offset: 2px !important; }
    
    /* Transitions */
    .transition-colors { transition-property: color, background-color, border-color, text-decoration-color, fill, stroke !important; transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1) !important; transition-duration: 150ms !important; }
    .transition-opacity { transition-property: opacity !important; transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1) !important; transition-duration: 150ms !important; }
    .duration-200 { transition-duration: 200ms !important; }
    .duration-300 { transition-duration: 300ms !important; }
    
    /* Hover states */
    .hover\\:bg-gray-300:hover { background-color: #d1d5db !important; }
    .hover\\:bg-black:hover { background-color: #000000 !important; }
    .hover\\:text-white:hover { color: #ffffff !important; }
    .hover\\:text-black:hover { color: #000000 !important; }
    .group:hover .group-hover\\:opacity-100 { opacity: 1 !important; }
    
    /* Opacity */
    .opacity-0 { opacity: 0 !important; }
    .opacity-50 { opacity: 0.5 !important; }
    .opacity-100 { opacity: 1 !important; }
    
    /* Typography */
    .text-xs { font-size: 0.75rem !important; line-height: 1rem !important; }
    .text-sm { font-size: 0.875rem !important; line-height: 1.25rem !important; }
    .text-base { font-size: 1rem !important; line-height: 1.5rem !important; }
    .font-normal { font-weight: 400 !important; }
    .font-medium { font-weight: 500 !important; }
    .text-left { text-align: left !important; }
    .whitespace-nowrap { white-space: nowrap !important; }
    .whitespace-normal { white-space: normal !important; }
    .overflow-hidden { overflow: hidden !important; }
    .text-ellipsis { text-overflow: ellipsis !important; }
    .resize-none { resize: none !important; }
    .tracking-\\[0\\] { letter-spacing: 0 !important; }
    .leading-\\[normal\\] { line-height: normal !important; }
    
    /* Z-index */
    .z-20 { z-index: 20 !important; }
    .z-50 { z-index: 50 !important; }
    
    /* Transform */
    .-translate-x-1\\/2 { transform: translateX(-50%) !important; }
    
    /* Background */
    .bg-cover { background-size: cover !important; }
    .bg-\\[50\\%_50\\%\\] { background-position: 50% 50% !important; }
    
    /* Focus states */
    .focus\\:border-black:focus { border-color: #000000 !important; }
    
    /* Font family */
    .font-system-ui { font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif !important; }
  `;
  shadowRoot.appendChild(additionalStyleElement);
  console.log('Additional styles injected');
}

// Inject additional styles if needed
injectAdditionalStyles();

// Set up observer for action buttons
const observer = new MutationObserver(function (mutationsList) {
  for (const mutation of mutationsList) {
    if (mutation.type === 'childList') {
      for (const node of mutation.addedNodes) {
        if (node instanceof window.Element && node.tagName === 'ASKMAN-CHROME-EXTENSION-CONTENT-ACTION-BUTTON-WRAP') {
          // 为按钮的 Shadow DOM 注入 Tailwind CSS 样式
          const btnContentStyleElement = document.createElement('style');
          btnContentStyleElement.innerHTML = contentStyles;
          node.shadowRoot.appendChild(btnContentStyleElement);

          // 同样为按钮的 Shadow DOM 注入 monokai 样式
          const btnMonokaiStyleElement = document.createElement('style');
          btnMonokaiStyleElement.innerHTML = monokaiStyle;
          node.shadowRoot.appendChild(btnMonokaiStyleElement);
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

// Render the React app
createRoot(rootIntoShadow).render(<App />);
