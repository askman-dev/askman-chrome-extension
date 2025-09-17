# MCP Server Integration Examples

This directory contains examples of how to integrate MCP servers with the Askman Chrome Extension.

## Basic Usage Examples

### 1. GitHub Repository Analysis
```typescript
// Example: Analyze GitHub repository structure
const githubClient = new MCPClient({
  name: "GitHub Integration",
  endpoint: "https://mcp-github.example.com",
  authentication: "bearer",
  api_key: "ghp_your_token",
  capabilities: ["repositories", "files"],
  enabled: true
});

async function analyzeRepository(owner: string, repo: string) {
  const structure = await githubClient.call('get_repository_structure', {
    owner,
    repo
  });
  
  const files = await githubClient.call('list_files', {
    owner,
    repo,
    path: '/'
  });
  
  return { structure, files };
}
```

### 2. Database Query Interface
```typescript
// Example: Query SQLite database
const sqliteClient = new MCPClient({
  name: "SQLite Database",
  endpoint: "https://mcp-sqlite.example.com",
  authentication: "bearer",
  api_key: "your_api_key",
  capabilities: ["read", "query"],
  enabled: true
});

async function queryDatabase(query: string) {
  return await sqliteClient.call('execute_query', {
    query,
    read_only: true
  });
}
```

### 3. Web Search Integration
```typescript
// Example: Perform web search
const searchClient = new MCPClient({
  name: "Web Search",
  endpoint: "https://mcp-search.example.com",
  authentication: "api_key",
  api_key: "your_search_key",
  capabilities: ["search"],
  enabled: true
});

async function searchWeb(query: string, maxResults = 10) {
  return await searchClient.call('search', {
    query,
    max_results: maxResults,
    safe_search: true
  });
}
```

## Integration with Page Assistant

```typescript
// Example: Enhance page assistant with MCP capabilities
export class EnhancedPageChatService extends PageChatService {
  private mcpClients: Map<string, MCPClient> = new Map();

  constructor() {
    super();
    this.initializeMCPClients();
  }

  private async initializeMCPClients() {
    const config = await StorageManager.getMCPConfig();
    
    for (const [serverName, serverConfig] of Object.entries(config)) {
      if (serverConfig.enabled) {
        this.mcpClients.set(serverName, new MCPClient(serverConfig));
      }
    }
  }

  async enhancePromptWithMCPData(prompt: string, context: QuoteContext): Promise<string> {
    let enhancedPrompt = prompt;

    // If we're on GitHub, add repository context
    if (context.pageUrl?.includes('github.com') && this.mcpClients.has('github')) {
      const repoInfo = await this.getGitHubContext(context.pageUrl);
      enhancedPrompt += `\n\nRepository Context:\n${JSON.stringify(repoInfo, null, 2)}`;
    }

    // Add web search results for research queries
    if (prompt.toLowerCase().includes('research') && this.mcpClients.has('websearch')) {
      const searchResults = await this.searchWeb(prompt);
      enhancedPrompt += `\n\nRelevant Search Results:\n${JSON.stringify(searchResults, null, 2)}`;
    }

    return enhancedPrompt;
  }

  private async getGitHubContext(url: string) {
    const githubClient = this.mcpClients.get('github');
    if (!githubClient) return null;

    const urlParts = url.split('/');
    const owner = urlParts[3];
    const repo = urlParts[4];

    return await githubClient.call('get_repository_info', { owner, repo });
  }

  private async searchWeb(query: string) {
    const searchClient = this.mcpClients.get('websearch');
    if (!searchClient) return null;

    return await searchClient.call('search', { 
      query, 
      max_results: 5 
    });
  }
}
```

## Configuration Management

```typescript
// Example: MCP configuration management
export class MCPConfigManager {
  static async loadMCPConfig(): Promise<Record<string, MCPServerConfig>> {
    const configPath = '/assets/conf/mcp-servers.toml';
    const response = await fetch(chrome.runtime.getURL(configPath));
    const configText = await response.text();
    
    return TOML.parse(configText);
  }

  static async saveMCPConfig(config: Record<string, MCPServerConfig>): Promise<void> {
    await StorageManager.save('mcp-servers-config', config);
  }

  static async testServerConnection(serverConfig: MCPServerConfig): Promise<boolean> {
    try {
      const client = new MCPClient(serverConfig);
      const result = await client.call('ping', {});
      return result.success === true;
    } catch (error) {
      console.error('MCP server connection test failed:', error);
      return false;
    }
  }
}
```

## Error Handling

```typescript
// Example: Robust error handling for MCP operations
export class MCPErrorHandler {
  static async safeCall<T>(
    client: MCPClient, 
    method: string, 
    params: any,
    fallback?: T
  ): Promise<T | null> {
    try {
      const result = await client.call(method, params);
      return result.result || result;
    } catch (error) {
      console.warn(`MCP call failed for ${method}:`, error);
      
      if (fallback !== undefined) {
        return fallback;
      }
      
      return null;
    }
  }

  static isServerAvailable(client: MCPClient): Promise<boolean> {
    return this.safeCall(client, 'ping', {}, false).then(result => !!result);
  }
}
```

## Testing MCP Integration

```typescript
// Example: Test suite for MCP integration
describe('MCP Integration', () => {
  let mockClient: MCPClient;

  beforeEach(() => {
    mockClient = new MCPClient({
      name: 'Test Server',
      endpoint: 'https://test.example.com',
      authentication: 'bearer',
      api_key: 'test-key',
      capabilities: ['test'],
      enabled: true
    });
  });

  test('should handle successful API calls', async () => {
    // Mock successful response
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        jsonrpc: '2.0',
        result: { success: true },
        id: 1
      })
    });

    const result = await mockClient.call('test_method', {});
    expect(result.result.success).toBe(true);
  });

  test('should handle API errors gracefully', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      statusText: 'Server Error'
    });

    await expect(mockClient.call('test_method', {}))
      .rejects.toThrow('MCP Server error: Server Error');
  });
});
```

## Best Practices

1. **Always validate server responses** before using data
2. **Implement proper timeout handling** for network requests
3. **Cache responses** when appropriate to reduce server load
4. **Provide fallback behavior** when MCP servers are unavailable
5. **Use environment-specific configurations** for development/production
6. **Monitor server health** and disable failing servers automatically
7. **Respect rate limits** and implement exponential backoff
8. **Sanitize user input** before sending to MCP servers
9. **Log errors appropriately** for debugging without exposing sensitive data
10. **Keep API keys secure** using Chrome extension storage APIs