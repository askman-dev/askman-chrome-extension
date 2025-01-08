import * as TOML from '@iarna/toml';
import { logger } from './logger';
import { Handlebars } from '../../third-party/kbn-handlebars/src/handlebars';
import chatPresets from '@assets/conf/chat-presets.toml';

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

export interface UserPreferences {
  USER_LANGUAGE: string;
  ASK_BUTTON: boolean;
  ASK_BUTTON_BLOCK_PAGE: string[];
}

export interface SystemPromptContent {
  content: string;
  name: string;
}

export const USER_TOOLS_KEY = 'userTools';
export const USER_MODELS_KEY = 'userModels';
export const USER_CHAT_PRESETS_KEY = 'userChatPresets';
export const USER_PREFERENCES_KEY = 'userPreferences';

export interface UserToolsObject {
  [key: string]: UserToolSetting;
}

export interface UserChatPresetsObject {
  [key: string]: ChatPresetContext;
}

export const StorageManager = {
  save: (key: string, value: string | number | boolean | object) => {
    return chrome.storage.local.set({ [key]: value }).then(() => {
      logger.debug(`Value for ${key} is set to`, value);
    });
  },
  get: (key: string) => {
    return chrome.storage.local.get([key]).then(result => {
      logger.debug(`Value for ${key} is`, result[key]);
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

  saveUserPreferences: (preferences: UserPreferences) => {
    return StorageManager.save(USER_PREFERENCES_KEY, preferences);
  },

  getUserPreferences: async (): Promise<UserPreferences> => {
    try {
      const systemConfigPath = chrome.runtime.getURL('assets/conf/preferences.toml');
      const systemConfigResponse = await fetch(systemConfigPath);
      const systemConfigStr = await systemConfigResponse.text();
      logger.debug('Loaded preferences.toml:', systemConfigStr);
      
      const parsedConfig = TOML.parse(systemConfigStr);
      logger.debug('Parsed config:', parsedConfig);
      
      const defaultPreferences: UserPreferences = {
        USER_LANGUAGE: parsedConfig.USER_LANGUAGE as string,
        ASK_BUTTON: parsedConfig.ASK_BUTTON as boolean,
        ASK_BUTTON_BLOCK_PAGE: parsedConfig.ASK_BUTTON_BLOCK_PAGE as string[]
      };
      logger.debug('Default preferences:', defaultPreferences);

      const preferences = await StorageManager.get(USER_PREFERENCES_KEY);
      logger.debug('Stored preferences:', preferences);
      
      if (preferences) {
        const mergedPreferences = {
          ...defaultPreferences,
          ...(preferences.USER_LANGUAGE !== undefined && { USER_LANGUAGE: preferences.USER_LANGUAGE }),
          ...(preferences.ASK_BUTTON !== undefined && { ASK_BUTTON: preferences.ASK_BUTTON }),
          ...(preferences.ASK_BUTTON_BLOCK_PAGE !== undefined && { ASK_BUTTON_BLOCK_PAGE: preferences.ASK_BUTTON_BLOCK_PAGE })
        };
        logger.debug('Merged preferences:', mergedPreferences);
        return mergedPreferences;
      }
      return defaultPreferences;
    } catch (e) {
      logger.error('Error loading preferences:', e);
      return {
        USER_LANGUAGE: 'en',
        ASK_BUTTON: false,
        ASK_BUTTON_BLOCK_PAGE: []
      };
    }
  },

  getSystemPrompt: async (): Promise<SystemPromptContent> => {
    try {
      const preferences = await StorageManager.getUserPreferences();
      
      const template = Handlebars.compileAST(chatPresets['system-init']['system']);
      
      const systemContent = template({
        USER_LANGUAGE: preferences.USER_LANGUAGE
      });

      return {
        content: systemContent,
        name: 'system'
      };
    } catch (e) {
      logger.error('Error loading system prompt:', e);
      throw e;
    }
  },
};
