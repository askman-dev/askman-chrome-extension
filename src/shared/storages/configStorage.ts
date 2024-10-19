import { BaseStorage, createStorage, StorageType } from '@src/shared/storages/base';
import * as TOML from '@iarna/toml';
import { StorageManager } from '@src/utils/StorageManager';

interface Config {
  apiKey: string;
  model: string;
  temperature: number;
}

const defaultConfig: Config = {
  apiKey: '',
  model: 'gpt-3.5-turbo',
  temperature: 0.7,
};

type ConfigStorage = BaseStorage<Config> & {
  setApiKey: (apiKey: string) => Promise<void>;
  setModel: (model: string) => Promise<void>;
  setTemperature: (temperature: number) => Promise<void>;
  getModelConfig: () => Promise<{ provider: string; config: any }[]>;
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
    const mergedConfigObj = { ...systemConfigObj, ...userConfigObj };
    return Object.entries(mergedConfigObj).map(([provider, model]) => ({
      provider,
      config: model,
    }));
  },
};

export default configStorage;
