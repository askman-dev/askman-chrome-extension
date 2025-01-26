import { StorageManager } from './StorageManager';

export class BlockConfig {
  private static instance: BlockConfig;
  private patterns: string[] = [];

  private constructor() {}

  public static getInstance(): BlockConfig {
    if (!BlockConfig.instance) {
      BlockConfig.instance = new BlockConfig();
    }
    return BlockConfig.instance;
  }

  public async initialize(): Promise<void> {
    try {
      const preferences = await StorageManager.getUserPreferences();
      // 从用户配置中读取禁用快捷键的页面列表
      this.patterns = preferences.SHORTCUT_DISABLED_PAGES;
    } catch (error) {
      console.error('Failed to initialize BlockConfig:', error);
      // 使用默认模式
      this.patterns = [
        'feishu.cn', // 默认在飞书页面禁用快捷键
      ];
    }
  }

  public isShortcutDisabled(url: string): boolean {
    if (!url) return false;
    const currentDomain = new window.URL(url).hostname;

    return this.patterns.some(pattern => {
      // 检查完整 URL 匹配
      if (pattern.startsWith('http') && url.startsWith(pattern)) {
        return true;
      }
      // 检查域名匹配
      if (!pattern.includes('/') && currentDomain.includes(pattern)) {
        return true;
      }
      // 检查通配符模式
      if (pattern.includes('*')) {
        const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
        return regex.test(url);
      }
      return false;
    });
  }

  public async savePatterns(patterns: string[]): Promise<void> {
    this.patterns = patterns;
    const preferences = await StorageManager.getUserPreferences();
    await StorageManager.saveUserPreferences({
      ...preferences,
      SHORTCUT_DISABLED_PAGES: patterns,
    });
  }

  public getPatterns(): string[] {
    return this.patterns;
  }
}
