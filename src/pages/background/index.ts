import { CommandType, TabMessage } from '@root/src/types';
import reloadOnUpdate from 'virtual:reload-on-update-in-background-script';
import 'webextension-polyfill';

reloadOnUpdate('pages/background');

/**
 * Extension reloading is necessary because the browser automatically caches the css.
 * If you do not use the css of the content script, please delete it.
 */
reloadOnUpdate('pages/content/style.scss');

console.log('background loaded');
/**
 * This function is called when the context menu is clicked on a web page.
 * @param {chrome.contextMenus.OnClickData} info - The data associated with the context menu click event.
 * @param {chrome.tabs.Tab} tab - The active tab associated with the context menu click event.
 */
function onContextMenuClicked(info: chrome.contextMenus.OnClickData, tab: chrome.tabs.Tab) {
  const selectionText = info.selectionText;
  const pageUrl = info.pageUrl;
  switch (info.menuItemId) {
    case 'id-context-menu':
      console.log('Context menu clicked!', selectionText, pageUrl);
      //TODO 在 content 中接受消息，并查找 selected element
      chrome.tabs.sendMessage<TabMessage>(tab.id, { cmd: CommandType.ChatPopupDisplay, selectionText, pageUrl });
      break;
  }
}
function onMessageListener(command) {
  console.log('background received message', command);
  switch (command) {
    case 'ChatPopupDisplay':
      chrome.tabs.query({ active: true, lastFocusedWindow: true }, ([tab]) => {
        if (chrome.runtime.lastError) console.error(chrome.runtime.lastError);
        // `tab` will either be a `tabs.Tab` instance or `undefined`.
        if (tab) {
          chrome.tabs
            .sendMessage<TabMessage>(tab.id, { cmd: CommandType.ChatPopupDisplay, pageUrl: tab.url })
            .catch(error => {
              console.error(error);
              // TODO fix 弹不出来
              // chrome.notifications.create(
              //     'basic', {
              //         iconUrl: '/icon-128.png', type: 'basic',
              //         message: '请刷新页面后重试', title: error.message
              //     }
              // )
            });
        }
      });
      break;
  }
}
function initExtension() {
  chrome.contextMenus.create({
    title: 'Askman',
    contexts: ['page', 'selection'],
    id: 'id-context-menu',
  });
  chrome.contextMenus.onClicked.addListener(onContextMenuClicked);
  chrome.commands.onCommand.addListener(onMessageListener);
}
chrome.runtime.onInstalled.addListener(function () {});

// Add this function to check if URL is supported
function isUrlSupported(url: string): boolean {
  if (!url) return false;
  // Chrome URLs and extension pages are not supported
  if (
    url.startsWith('chrome://') ||
    url.startsWith('chrome-extension://') ||
    url.startsWith('https://chrome.google.com') ||
    url.startsWith('https://chromewebstore.google.com')
  ) {
    return false;
  }
  // New tab page is not supported
  if (url === 'chrome://newtab/' || url === 'about:blank') {
    return false;
  }
  return true;
}

// Add this function to handle page action
async function updateActionPopup(tabId: number, url: string) {
  if (!isUrlSupported(url)) {
    // 不支持的页面显示默认popup
    await chrome.action.setPopup({
      tabId,
      popup: 'src/pages/popup/index.html',
    });
  } else {
    // 支持的页面清除popup，这样才能触发onClicked
    await chrome.action.setPopup({
      tabId,
      popup: '',
    });
  }
}

// Listen for tab updates to set the appropriate popup behavior
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'loading' && tab.url) {
    updateActionPopup(tabId, tab.url);
  }
});

// Handle action button clicks for supported pages
chrome.action.onClicked.addListener(async tab => {
  if (!tab.id || !tab.url) return;

  try {
    await chrome.tabs.sendMessage<TabMessage>(tab.id, {
      cmd: CommandType.ChatPopupDisplay,
      pageUrl: tab.url,
    });
  } catch (error) {
    console.error('Failed to send message to content script:', error);
  }
});

initExtension();
