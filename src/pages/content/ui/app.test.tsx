import { beforeAll, describe, expect, test, vi } from 'vitest';
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

  // Configure Chrome API mock behavior for this test
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (chrome.storage.local.get as any).mockImplementation(
    (keys: unknown, callback?: (_data: typeof mockStorageData) => void) => {
      if (callback) {
        callback(mockStorageData);
      }
      return Promise.resolve(mockStorageData);
    },
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (chrome.storage.sync.get as any).mockImplementation(
    (keys: unknown, callback?: (_data: typeof mockStorageData) => void) => {
      if (callback) {
        callback(mockStorageData);
      }
      return Promise.resolve(mockStorageData);
    },
  );

  (chrome.storage.session.get as any).mockImplementation(
    (keys: unknown, callback?: (_data: typeof mockStorageData) => void) => {
      if (callback) {
        callback(mockStorageData);
      }
      return Promise.resolve(mockStorageData);
    },
  );

  (chrome.tabs.query as any).mockImplementation((queryInfo, callback) => {
    if (callback) {
      callback([{ id: 1, url: 'https://example.com' }]);
    }
    return Promise.resolve([{ id: 1, url: 'https://example.com' }]);
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (chrome.runtime.getURL as any).mockImplementation((path: string) => {
    console.log('[TEST] getURL called with:', path);
    return `chrome-extension://fake-id/${path}`;
  });
});

// No cleanup needed - chrome mock is global

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
