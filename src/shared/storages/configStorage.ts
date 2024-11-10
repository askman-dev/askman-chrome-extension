import { BaseStorage, createStorage, StorageType } from '@src/shared/storages/base';
import * as TOML from '@iarna/toml';
import { StorageManager } from '@src/utils/StorageManager';

interface Config {
  apiKey: string;
  model: string;
  temperature: number;
  selectedModel?: string;
}
interface TomlModelConfig {
  provider: string;
  config: {
    temperature?: number;
    topP?: number;
    frequencyPenalty?: number;
    presencePenalty?: number;
    api_key?: string;
    base_url?: string;
    models: Array<{
      name: string;
      id?: string;
      max_tokens: number;
    }>;
  };
}

const defaultConfig: Config = {
  apiKey: '',
  model: 'free', // 'openai/gpt-4o'
  temperature: 0.2,
};

type ConfigStorage = BaseStorage<Config> & {
  setApiKey: (_apiKey: string) => Promise<void>;
  setModel: (_model: string) => Promise<void>;
  setTemperature: (_temperature: number) => Promise<void>;
  getModelConfig: () => Promise<TomlModelConfig[]>;
  getSelectedModel: () => Promise<string>;
};

const storage = createStorage<Config>('config-storage-key', defaultConfig, {
  storageType: StorageType.Local,
  liveUpdate: true,
});

const configStorage: ConfigStorage = {
  ...storage,
  setApiKey: async (apiKey: string) => {
    await storage.set(prevConfig => ({ ...prevConfig, apiKey }));
  },
  setModel: async (model: string) => {
    await storage.set(prevConfig => ({ ...prevConfig, model }));
  },
  setTemperature: async (temperature: number) => {
    await storage.set(prevConfig => ({ ...prevConfig, temperature }));
  },
  getModelConfig: async () => {
    const systemConfigPath = '/assets/conf/models.toml';
    const systemConfigResponse = await fetch(chrome.runtime.getURL(systemConfigPath));
    const systemConfigStr = await systemConfigResponse.text();
    // const userConfigObj = TOML.parse(userConfigStr);
    const userConfigObj = await StorageManager.getUserModels();
    const systemConfigObj = TOML.parse(systemConfigStr);
    const mergedConfigObj = {
      ...systemConfigObj,
      ...(Array.isArray(userConfigObj) ? {} : userConfigObj), // 如果 userConfigObj 是数组，则不合并
    } as Record<string, TomlModelConfig['config']>;
    return Object.entries(mergedConfigObj).map(([provider, config]) => ({
      provider,
      config,
    })) as TomlModelConfig[];
  },
  getSelectedModel: async () => {
    const config = await storage.get();
    return config.model || 'free'; // 默认值为 'free'
  },
};

export default configStorage;
