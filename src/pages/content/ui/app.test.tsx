import { afterAll, beforeAll, describe, expect, test, vi } from 'vitest';
import { render } from '@testing-library/react';
// import { Chrome } from '@types/chrome';

// Mock storage data
const mockStorageData = {
  'config-storage-key': {
    someConfig: 'value',
  },
};

// Mock preferences data
const mockPreferencesToml = `
USER_LANGUAGE = "en"
ASK_BUTTON = true
ASK_BUTTON_BLOCK_PAGE = ["google.com", "facebook.com"]
SHORTCUT_DISABLED_PAGES = ["youtube.com"]
`;

beforeAll(() => {
  // Mock fetch
  global.fetch = vi.fn(url => {
    console.log('[TEST] fetch called with:', url);

    // Return mock content based on URL
    if (url.includes('preferences.toml')) {
      return Promise.resolve({
        ok: true,
        text: () => Promise.resolve(mockPreferencesToml),
      });
    }

    return Promise.resolve({
      ok: true,
      text: () => Promise.resolve(''),
    });
  }) as unknown as typeof fetch;

  // 创建完整的 chrome API mock
  global.chrome = {
    runtime: {
      onMessage: {
        addListener: vi.fn(),
        removeListener: vi.fn(),
      },
      getURL: vi.fn(path => {
        console.log('[TEST] getURL called with:', path);
        return `chrome-extension://fake-id/${path}`;
      }),
    },
    storage: {
      local: {
        get: vi.fn((keys, callback) => {
          if (callback) {
            callback(mockStorageData);
          }
          return Promise.resolve(mockStorageData);
        }),
        set: vi.fn((items, callback) => {
          if (callback) callback();
          return Promise.resolve();
        }),
        onChanged: {
          addListener: vi.fn(),
          removeListener: vi.fn(),
          hasListeners: vi.fn(),
        },
      },
      sync: {
        get: vi.fn((keys, callback) => {
          if (callback) {
            callback(mockStorageData);
          }
          return Promise.resolve(mockStorageData);
        }),
        set: vi.fn((items, callback) => {
          if (callback) callback();
          return Promise.resolve();
        }),
        onChanged: {
          addListener: vi.fn(),
          removeListener: vi.fn(),
          hasListeners: vi.fn(),
        },
      },
    },
  } as unknown as typeof chrome;

  // 打印检查
  // console.log('Chrome storage mock setup:', {
  //   local: global.chrome.storage.local,
  //   sync: global.chrome.storage.sync
  // });
});

afterAll(() => {
  delete global.chrome;
});

// vi.mock('@assets/conf/chat-presets.toml', () => ({
//   default: {
//     presets: []
//   }
// }));

describe('App component', () => {
  test('renders without crashing', async () => {
    const { default: App } = await import('./app');
    const { container } = render(<App />);
    expect(container).toBeTruthy();
  });
});
