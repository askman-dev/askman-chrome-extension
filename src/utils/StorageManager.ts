export interface UserToolSetting {
  name: string;
  hbs: string;
}

export interface ModelInterface {
  id: string;
  name: string;
}

export interface ChatPresetContext {
  human?: string;
  ai?: string;
}

export const USER_TOOLS_KEY = 'userTools';
export const USER_MODELS_KEY = 'userModels';
export const USER_CHAT_PRESETS_KEY = 'userChatPresets';

export interface UserToolsObject {
  [key: string]: UserToolSetting;
}

export interface UserChatPresetsObject {
  [key: string]: ChatPresetContext;
}

export const StorageManager = {
  save: (key: string, value: string | number | boolean | object) => {
    // eslint-disable-line @typescript-eslint/no-explicit-any
    return chrome.storage.local.set({ [key]: value }).then(() => {
      console.log(`Value for ${key} is set to ${value}`);
    });
  },
  get: (key: string) => {
    return chrome.storage.local.get([key]).then(result => {
      console.log(`Value for ${key} is`, result[key]);
      return result[key];
    });
  },

  saveUserTools: (tools: UserToolsObject) => {
    return StorageManager.save(USER_TOOLS_KEY, tools);
  },

  getUserTools: (): Promise<UserToolsObject> => {
    return StorageManager.get(USER_TOOLS_KEY).then(tools => {
      if (tools) {
        return tools;
      }
      return {};
    });
  },

  saveUserModels: (models: ModelInterface[]) => {
    return StorageManager.save(USER_MODELS_KEY, models);
  },

  getUserModels: (): Promise<ModelInterface[]> => {
    return StorageManager.get(USER_MODELS_KEY).then(models => {
      if (models) {
        return models;
      }
      return [];
    });
  },

  saveUserChatPresets: (presets: UserChatPresetsObject) => {
    return StorageManager.save(USER_CHAT_PRESETS_KEY, presets);
  },

  getUserChatPresets: (): Promise<UserChatPresetsObject> => {
    return StorageManager.get(USER_CHAT_PRESETS_KEY).then(presets => {
      if (presets) {
        return presets;
      }
      return {};
    });
  },
};
