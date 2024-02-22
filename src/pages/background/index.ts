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
    title: 'Ask That Man',
    contexts: ['page', 'selection'],
    id: 'id-context-menu',
  });
  chrome.contextMenus.onClicked.addListener(onContextMenuClicked);
  chrome.commands.onCommand.addListener(onMessageListener);
}
chrome.runtime.onInstalled.addListener(function () {});
initExtension();
