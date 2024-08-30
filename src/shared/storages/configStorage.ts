import { BaseStorage, createStorage, StorageType } from '@src/shared/storages/base';

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
};

export default configStorage;
