import { CommandType, TabMessage } from '@root/src/types';
import { BaseStorage, createStorage, StorageType } from '@src/shared/storages/base';

type Theme = 'light' | 'dark';

type ThemeStorage = BaseStorage<Theme> & {
  toggle: () => Promise<void>;
};

const storage = createStorage<Theme>('theme-storage-key', 'light', {
  storageType: StorageType.Local,
  liveUpdate: true,
});
storage.set(() => {
  return 'light';
});

const exampleThemeStorage: ThemeStorage = {
  ...storage,
  // TODO: extends your own methods
  toggle: async () => {
    chrome.tabs.query({ active: true, lastFocusedWindow: true }, ([tab]) => {
      if (chrome.runtime.lastError) console.error(chrome.runtime.lastError);
      // `tab` will either be a `tabs.Tab` instance or `undefined`.
      if (tab) {
        chrome.tabs
          .sendMessage<TabMessage>(tab.id, { cmd: CommandType.ChatPopupDisplay, pageUrl: tab.url })
          .catch(error => {
            console.error(error);
            // TODO fix 弹不出来
            chrome.notifications.create('basic', {
              iconUrl: '/icon-128.png',
              type: 'basic',
              message: '请先打开一个网页。不支持新标签页、选项页面等。',
              title: error.message,
            });
          });
      }
    });
  },
};

export default exampleThemeStorage;
