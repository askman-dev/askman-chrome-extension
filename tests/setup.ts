import { beforeAll, vi } from 'vitest';
import '@testing-library/jest-dom';

// 全局测试设置
beforeAll(() => {
  // Mock chrome global object for all tests
  Object.defineProperty(global, 'chrome', {
    value: {
      storage: {
        local: {
          get: vi.fn(),
          set: vi.fn(),
          remove: vi.fn(),
          clear: vi.fn(),
          onChanged: {
            addListener: vi.fn(),
            removeListener: vi.fn(),
            hasListeners: vi.fn(),
          },
        },
        sync: {
          get: vi.fn(),
          set: vi.fn(),
          remove: vi.fn(),
          clear: vi.fn(),
          onChanged: {
            addListener: vi.fn(),
            removeListener: vi.fn(),
            hasListeners: vi.fn(),
          },
        },
        session: {
          get: vi.fn(),
          set: vi.fn(),
          remove: vi.fn(),
          clear: vi.fn(),
          onChanged: {
            addListener: vi.fn(),
            removeListener: vi.fn(),
            hasListeners: vi.fn(),
          },
        },
        managed: {
          get: vi.fn(),
          set: vi.fn(),
          remove: vi.fn(),
          clear: vi.fn(),
          onChanged: {
            addListener: vi.fn(),
            removeListener: vi.fn(),
            hasListeners: vi.fn(),
          },
        },
      },
      runtime: {
        id: 'test-extension-id',
        getManifest: vi.fn(() => ({ version: '1.0.0' })),
        getURL: vi.fn(path => `chrome-extension://fake-id/${path}`),
        onMessage: {
          addListener: vi.fn(),
          removeListener: vi.fn(),
        },
      },
      tabs: {
        query: vi.fn(),
      },
    },
    writable: true,
  });
});
