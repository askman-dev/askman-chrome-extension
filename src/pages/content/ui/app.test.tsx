import { afterAll, beforeAll, describe, expect, test, vi } from 'vitest';
import { render } from '@testing-library/react';
// import { Chrome } from '@types/chrome';

// Mock storage data
const mockStorageData = {
  'config-storage-key': {
    someConfig: 'value',
  },
};

beforeAll(() => {
  // 创建完整的 chrome API mock
  global.chrome = {
    runtime: {
      onMessage: {
        addListener: vi.fn(),
        removeListener: vi.fn(),
      },
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
