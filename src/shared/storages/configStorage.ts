import { BaseStorage, createStorage, StorageType } from '@src/shared/storages/base';
import { StorageManager } from '@src/utils/StorageManager';

interface Config {
  apiKey: string;
  model: string;
  temperature: number;
  selectedModel?: string;
}

export interface TomlModelConfig {
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
  getCurrentModel: () => Promise<string | null>;
  setCurrentModel: (_model: string) => Promise<void>;
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
    const modelConfig = await StorageManager.getModelConfig();
    return modelConfig;
  },
  getCurrentModel: async () => {
    const config = await storage.get();
    return config.model || null;
  },
  setCurrentModel: async (model: string) => {
    await storage.set(prevConfig => ({ ...prevConfig, model }));
  },
};

export default configStorage;
