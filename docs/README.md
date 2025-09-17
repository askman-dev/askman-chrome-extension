# MCP Server Integration Guide

This guide provides information about integrating MCP (Model Context Protocol) servers with HTTP protocol support into the Askman Chrome Extension.

## Overview

MCP servers that support HTTP transport can extend the capabilities of AI applications by providing access to external data sources and tools. This document catalogs available servers and provides integration guidance.

## Quick Start

1. **Review Available Servers**: See [MCP Servers Catalog](./mcp-servers.md) for a comprehensive list
2. **Configure Servers**: Edit `src/assets/conf/mcp-servers.toml` to add your server configurations
3. **Enable Integration**: Update application code to utilize MCP server capabilities
4. **Test Connection**: Verify server connectivity and authentication

## Configuration Examples

### SQLite Database Access
```toml
[sqlite]
name = "SQLite Database Server"
transport = "http"
endpoint = "https://your-domain.com/mcp/sqlite"
authentication = "bearer"
api_key = "your-api-key"
enabled = true
```

### GitHub Integration
```toml
[github]
name = "GitHub Integration"
transport = "http"
endpoint = "https://your-domain.com/mcp/github"
authentication = "bearer"
api_key = "ghp_your_github_token"
enabled = true
```

### Web Search
```toml
[websearch]
name = "Web Search"
transport = "http"
endpoint = "https://your-domain.com/mcp/search"
authentication = "api_key"
api_key = "your-search-api-key"
enabled = true
```

## Implementation Notes

### For Chrome Extension Integration

1. **CORS Requirements**: MCP servers must include appropriate CORS headers
2. **HTTPS Only**: All server endpoints must use HTTPS
3. **Token Authentication**: Use bearer tokens rather than session cookies
4. **Content Security Policy**: Ensure server URLs are allowed in manifest.json

### Example Integration Code

```typescript
interface MCPServerConfig {
  name: string;
  endpoint: string;
  authentication: 'bearer' | 'api_key' | 'oauth2';
  api_key?: string;
  capabilities: string[];
  enabled: boolean;
}

class MCPClient {
  private config: MCPServerConfig;

  constructor(config: MCPServerConfig) {
    this.config = config;
  }

  async call(method: string, params: any): Promise<any> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.config.authentication === 'bearer' && this.config.api_key) {
      headers['Authorization'] = `Bearer ${this.config.api_key}`;
    } else if (this.config.authentication === 'api_key' && this.config.api_key) {
      headers['X-API-Key'] = this.config.api_key;
    }

    const response = await fetch(this.config.endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        jsonrpc: '2.0',
        method,
        params,
        id: Date.now(),
      }),
    });

    if (!response.ok) {
      throw new Error(`MCP Server error: ${response.statusText}`);
    }

    return response.json();
  }

  async getCapabilities(): Promise<string[]> {
    return this.config.capabilities;
  }
}
```

## Security Considerations

1. **API Key Management**: Store API keys securely using Chrome extension storage
2. **Permission Validation**: Verify server capabilities before making requests
3. **Rate Limiting**: Implement client-side rate limiting to respect server limits
4. **Error Handling**: Graceful degradation when servers are unavailable

## Testing Your Integration

```typescript
// Example test for MCP server connectivity
async function testMCPServer(config: MCPServerConfig): Promise<boolean> {
  try {
    const client = new MCPClient(config);
    const response = await client.call('ping', {});
    return response.result === 'pong';
  } catch (error) {
    console.error('MCP Server test failed:', error);
    return false;
  }
}
```

## Deployment Considerations

### Server-Side Requirements

1. **HTTP Transport Layer**: Implement MCP over HTTP/HTTPS
2. **CORS Headers**: Enable cross-origin requests from Chrome extensions
3. **Authentication**: Support token-based authentication
4. **Rate Limiting**: Implement appropriate rate limiting
5. **Error Handling**: Return proper HTTP status codes and error messages

### Example Server Response Format

```json
{
  "jsonrpc": "2.0",
  "result": {
    "capabilities": {
      "resources": {},
      "tools": {
        "database_query": {
          "description": "Execute database queries",
          "inputSchema": {
            "type": "object",
            "properties": {
              "query": { "type": "string" },
              "database": { "type": "string" }
            }
          }
        }
      },
      "prompts": {}
    }
  },
  "id": 1
}
```

## Contributing

To contribute new MCP server integrations:

1. Add server documentation to `docs/mcp-servers.md`
2. Add configuration template to `src/assets/conf/mcp-servers.toml`
3. Create integration tests
4. Update this README with examples
5. Submit a pull request

## Support

For issues with MCP server integration:

1. Check server-specific documentation
2. Verify CORS and authentication configuration
3. Test with browser developer tools
4. Report issues in the project GitHub repository

## Resources

- [MCP Specification](https://spec.modelcontextprotocol.io/)
- [MCP Servers Repository](https://github.com/modelcontextprotocol/servers)
- [Askman Extension Documentation](../README.md)
- [Chrome Extension Development Guide](https://developer.chrome.com/docs/extensions/)