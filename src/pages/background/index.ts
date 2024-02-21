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
function initExtension() {
  chrome.contextMenus.create({
    title: 'Ask That Man',
    contexts: ['page', 'selection'],
    id: 'id-context-menu',
  });
  chrome.contextMenus.onClicked.addListener(onContextMenuClicked);
}
chrome.runtime.onInstalled.addListener(function () {});
initExtension();
