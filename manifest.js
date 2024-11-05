import fs from 'node:fs';
const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf8'));

/**
 * After changing, please reload the extension at `chrome://extensions`
 * @type {chrome.runtime.ManifestV3}
 */
const manifest = {
  manifest_version: 3,
  default_locale: 'en',
  /**
   * if you want to support multiple languages, you can use the following reference
   * https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Internationalization
   */
  name: '__MSG_extensionName__',
  version: packageJson.version,
  description: '__MSG_extensionDescription__',
  permissions: [
    'tabs',
    'notifications',
    'storage',
    // 'sidePanel',
    'contextMenus',
  ],
  // side_panel: {
  //   default_path: 'src/pages/sidepanel/index.html',
  // },
  options_page: 'src/pages/options/index.html',
  background: {
    service_worker: 'src/pages/background/index.js',
    type: 'module',
  },
  action: {
    default_popup: 'src/pages/popup/index.html',
    default_icon: 'icon-128.png',
  },
  // chrome_url_overrides: {
  //   newtab: 'src/pages/newtab/index.html',
  // },
  icons: {
    128: 'icon-128.png',
    512: 'icon-512.png',
  },
  content_scripts: [
    {
      matches: ['http://*/*', 'https://*/*', '<all_urls>'],
      js: ['src/pages/contentInjected/index.js'],
      // KEY for cache invalidation
      css: ['assets/css/contentStyle<KEY>.chunk.css'],
    },
    {
      matches: ['http://*/*', 'https://*/*', '<all_urls>'],
      js: ['src/pages/contentUI/index.js'],
    },
  ],
  // devtools_page: 'src/pages/devtools/index.html',
  web_accessible_resources: [
    {
      resources: ['assets/js/*.js', 'assets/conf/*.toml', 'assets/css/*.css', 'icon-128.png', 'icon-32.png'],
      matches: ['*://*/*'],
    },
  ],
  content_security_policy: {
    extension_pages: "script-src 'self' 'wasm-unsafe-eval'; object-src 'self';",
  },
  commands: {
    ChatPopupDisplay: {
      suggested_key: {
        default: 'Ctrl+I',
        mac: 'Command+I',
      },
      description: '__MSG_extensionCommandChatPopupDisplay__',
    },
  },
};

export default manifest;
