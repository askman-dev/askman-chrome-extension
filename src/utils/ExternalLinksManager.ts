import toml from '@iarna/toml';

export interface ExternalLinks {
  docs: {
    home: string;
    issues: string;
    discussions: string;
  };
  social: {
    wechat_id: string;
    wechat_qr: string;
  };
}

class ExternalLinksManager {
  private static instance: ExternalLinksManager;
  private links: ExternalLinks | null = null;

  private constructor() {}

  static getInstance(): ExternalLinksManager {
    if (!ExternalLinksManager.instance) {
      ExternalLinksManager.instance = new ExternalLinksManager();
    }
    return ExternalLinksManager.instance;
  }

  private validateLinks(data: unknown): data is ExternalLinks {
    if (typeof data !== 'object' || data === null) return false;

    const links = data as Record<string, unknown>;

    return (
      'docs' in links &&
      typeof links.docs === 'object' &&
      links.docs !== null &&
      'home' in links.docs &&
      'issues' in links.docs &&
      'discussions' in links.docs &&
      'social' in links &&
      typeof links.social === 'object' &&
      links.social !== null &&
      'wechat_id' in links.social &&
      'wechat_qr' in links.social
    );
  }

  async loadLinks(): Promise<ExternalLinks> {
    if (this.links) return this.links;

    try {
      const response = await fetch('/assets/conf/external-links.toml');
      const text = await response.text();
      const parsed = toml.parse(text);

      if (this.validateLinks(parsed)) {
        this.links = parsed;
        return this.links;
      }

      throw new Error('Invalid external links configuration format');
    } catch (error) {
      console.error('Failed to load external links:', error);
      throw error;
    }
  }
}

export default ExternalLinksManager.getInstance();
