import * as TOML from '@iarna/toml';
import { logger } from './logger';
import { Handlebars } from '../../third-party/kbn-handlebars/src/handlebars';
import chatPresets from '@assets/conf/chat-presets.toml';
import { ShortcutInterface } from '../types';
import { TemplateDelegate } from '../../third-party/kbn-handlebars';
import { TomlModelConfig } from '@src/shared/storages/configStorage';

export interface UserShortcutSetting {
  name: string;
  hbs: string;
}

// @deprecated Use UserShortcutSetting instead
export interface UserToolSetting extends UserShortcutSetting {}

export interface ModelInterface {
  id: string;
  name: string;
}

export interface ChatPresetContext {
  human?: string;
  ai?: string;
  system?: string;
}

export interface UserPreferences {
  USER_LANGUAGE: string;
  ASK_BUTTON: boolean;
  ASK_BUTTON_BLOCK_PAGE: string[];
  SHORTCUT_DISABLED_PAGES: string[]; // 在这些页面上禁用快捷键以避免冲突
}

export interface SystemPromptContent {
  content: string;
  name: string;
}

export interface SystemPresetInterface extends ShortcutInterface {
  name: string;
  hbs: string;
  template: TemplateDelegate;
}

export const USER_SHORTCUTS_KEY = 'userShortcuts';
export const USER_TOOLS_KEY = 'userTools'; // @deprecated Use USER_SHORTCUTS_KEY
export const USER_MODELS_KEY = 'userModels';
export const USER_CHAT_PRESETS_KEY = 'userChatPresets';
export const USER_PREFERENCES_KEY = 'userPreferences';
export const CURRENT_SYSTEM_PRESET_KEY = 'currentSystemPreset';

export interface UserShortcutsObject {
  [key: string]: UserShortcutSetting;
}

// @deprecated Use UserShortcutsObject instead
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
      // logger.debug(`Value for ${key} is`, result[key]);
      return result[key];
    });
  },

  saveUserShortcuts: (shortcuts: UserShortcutsObject) => {
    return StorageManager.save(USER_SHORTCUTS_KEY, shortcuts);
  },

  // @deprecated Use saveUserShortcuts instead
  saveUserTools: (tools: UserToolsObject) => {
    return StorageManager.save(USER_TOOLS_KEY, tools);
  },

  getUserShortcuts: (): Promise<UserShortcutsObject> => {
    return StorageManager.get(USER_SHORTCUTS_KEY).then(shortcuts => {
      if (shortcuts) {
        return shortcuts;
      }
      return {};
    });
  },

  // @deprecated Use getUserShortcuts instead
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
      // logger.debug('Loaded preferences.toml:', systemConfigStr);

      const parsedConfig = TOML.parse(systemConfigStr);
      // logger.debug('Parsed config:', parsedConfig);

      const defaultPreferences: UserPreferences = {
        USER_LANGUAGE: parsedConfig.USER_LANGUAGE as string,
        ASK_BUTTON: parsedConfig.ASK_BUTTON as boolean,
        ASK_BUTTON_BLOCK_PAGE: parsedConfig.ASK_BUTTON_BLOCK_PAGE as string[],
        SHORTCUT_DISABLED_PAGES: parsedConfig.SHORTCUT_DISABLED_PAGES as string[],
      };
      // logger.debug('Default preferences:', defaultPreferences);

      const preferences = await StorageManager.get(USER_PREFERENCES_KEY);
      // logger.debug('Stored preferences:', preferences);

      if (preferences) {
        const mergedPreferences = {
          ...defaultPreferences,
          ...(preferences.USER_LANGUAGE !== undefined && { USER_LANGUAGE: preferences.USER_LANGUAGE }),
          ...(preferences.ASK_BUTTON !== undefined && { ASK_BUTTON: preferences.ASK_BUTTON }),
          ...(preferences.ASK_BUTTON_BLOCK_PAGE !== undefined && {
            ASK_BUTTON_BLOCK_PAGE: preferences.ASK_BUTTON_BLOCK_PAGE,
          }),
          ...(preferences.SHORTCUT_DISABLED_PAGES !== undefined && {
            SHORTCUT_DISABLED_PAGES: preferences.SHORTCUT_DISABLED_PAGES,
          }),
        };
        // logger.debug('Merged preferences:', mergedPreferences);
        return mergedPreferences;
      }
      return defaultPreferences;
    } catch (e) {
      logger.error('Error loading preferences:', e);
      return {
        USER_LANGUAGE: 'en',
        ASK_BUTTON: false,
        ASK_BUTTON_BLOCK_PAGE: [],
        SHORTCUT_DISABLED_PAGES: [],
      };
    }
  },

  getSystemPrompt: async (): Promise<SystemPromptContent> => {
    try {
      const preferences = await StorageManager.getUserPreferences();
      const userChatPresets = await StorageManager.getUserChatPresets();
      const currentPreset = await StorageManager.getCurrentSystemPreset();

      // Merge system and user configs, with user config taking precedence
      const mergedConfig = {
        ...chatPresets,
        ...userChatPresets,
      };

      // 如果有选中的预设且存在，则使用选中的预设
      if (currentPreset && mergedConfig[currentPreset]?.system) {
        const template = Handlebars.compileAST(mergedConfig[currentPreset].system);
        const systemContent = template({
          USER_LANGUAGE: preferences.USER_LANGUAGE,
        });

        return {
          content: systemContent,
          name: currentPreset,
        };
      }

      // 如果没有选中的预设或预设不存在，使用默认的 system-init
      const template = Handlebars.compileAST(mergedConfig['system-init'].system);
      const systemContent = template({
        USER_LANGUAGE: preferences.USER_LANGUAGE,
      });

      return {
        content: systemContent,
        name: 'system-init',
      };
    } catch (e) {
      logger.error('Error loading system prompt:', e);
      throw e;
    }
  },

  getSystemPresets: async (): Promise<SystemPresetInterface[]> => {
    try {
      const userChatPresets = await StorageManager.getUserChatPresets();

      // Merge system and user configs, with user config taking precedence
      const mergedConfig = {
        ...chatPresets,
        ...userChatPresets,
      };

      const systemPresets: SystemPresetInterface[] = [];
      for (const k in mergedConfig) {
        if (k.startsWith('system-')) {
          const preset = mergedConfig[k] as ChatPresetContext;
          if (preset.system) {
            systemPresets.push({
              id: k,
              name: k,
              hbs: preset.system,
              template: Handlebars.compileAST(preset.system),
            });
          }
        }
      }
      return systemPresets;
    } catch (e) {
      logger.error('Error loading system presets:', e);
      return [];
    }
  },

  getCurrentSystemPreset: async (): Promise<string | null> => {
    return StorageManager.get(CURRENT_SYSTEM_PRESET_KEY);
  },

  setCurrentSystemPreset: async (presetName: string): Promise<void> => {
    return StorageManager.save(CURRENT_SYSTEM_PRESET_KEY, presetName);
  },

  // 获取当前快捷指令
  getCurrentShortcut: async () => {
    // First try new key, then fallback to old key for migration
    const current = await StorageManager.get('current-shortcut');
    if (current) {
      return current;
    }
    // Migration: check old key and migrate if exists
    const oldCurrent = await StorageManager.get('current-tool');
    if (oldCurrent) {
      await StorageManager.save('current-shortcut', oldCurrent);
      return oldCurrent;
    }
    return null;
  },

  // 设置当前快捷指令
  setCurrentShortcut: async (shortcutName: string) => {
    await StorageManager.save('current-shortcut', shortcutName);
  },

  // @deprecated Use getCurrentShortcut instead
  getCurrentTool: async () => {
    return await StorageManager.get('current-tool');
  },

  // @deprecated Use setCurrentShortcut instead
  setCurrentTool: async (toolName: string) => {
    await StorageManager.save('current-tool', toolName);
  },

  // 获取模型配置
  getModelConfig: async () => {
    const systemConfigPath = '/assets/conf/models.toml';
    const systemConfigResponse = await fetch(chrome.runtime.getURL(systemConfigPath));
    const systemConfigStr = await systemConfigResponse.text();
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
};
