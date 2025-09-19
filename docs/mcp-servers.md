# MCP Servers with HTTP Protocol Support

This document catalogs Model Context Protocol (MCP) servers that support HTTP protocol communication, making them suitable for integration with web-based applications like the Askman Chrome Extension.

## What is MCP?

Model Context Protocol (MCP) is an open standard developed by Anthropic that enables AI applications to securely connect to external data sources and tools. MCP servers expose resources, tools, and prompts that AI models can use to enhance their capabilities.

## HTTP Transport Support

While MCP supports multiple transport mechanisms (stdio, SSE), servers that support HTTP transport are particularly valuable for web-based integrations as they can be easily accessed from browser environments like Chrome extensions.

## Catalog of HTTP-Compatible MCP Servers

### Official Anthropic Servers

#### 1. **MCP Server SQLite**
- **Repository**: [modelcontextprotocol/servers](https://github.com/modelcontextprotocol/servers/tree/main/src/sqlite)
- **Protocol Support**: HTTP, stdio
- **Description**: Provides read-only access to SQLite databases
- **Capabilities**:
  - Read database schema
  - Execute SELECT queries
  - List tables and views
- **HTTP Endpoint**: Can be wrapped with HTTP transport
- **Use Cases**: Database analysis, data exploration, reporting

#### 2. **MCP Server Filesystem**
- **Repository**: [modelcontextprotocol/servers](https://github.com/modelcontextprotocol/servers/tree/main/src/filesystem)
- **Protocol Support**: HTTP, stdio
- **Description**: Provides secure file system access
- **Capabilities**:
  - Read file contents
  - List directory structures
  - Search files
- **Security**: Configurable access controls
- **Use Cases**: Code analysis, document processing, file management

#### 3. **MCP Server Git**
- **Repository**: [modelcontextprotocol/servers](https://github.com/modelcontextprotocol/servers/tree/main/src/git)
- **Protocol Support**: HTTP, stdio
- **Description**: Git repository interaction capabilities
- **Capabilities**:
  - Repository status
  - Commit history
  - Diff analysis
  - Branch information
- **Use Cases**: Code review, repository analysis, development workflow

### Community Servers

#### 4. **MCP Server PostgreSQL**
- **Repository**: [modelcontextprotocol/servers](https://github.com/modelcontextprotocol/servers/tree/main/src/postgres)
- **Protocol Support**: HTTP, stdio
- **Description**: PostgreSQL database integration
- **Capabilities**:
  - Database schema exploration
  - Query execution
  - Table analysis
- **Configuration**: Connection string based
- **Use Cases**: Database administration, data analysis

#### 5. **MCP Server GitHub**
- **Repository**: [modelcontextprotocol/servers](https://github.com/modelcontextprotocol/servers/tree/main/src/github)
- **Protocol Support**: HTTP, stdio
- **Description**: GitHub API integration
- **Capabilities**:
  - Repository browsing
  - Issue management
  - Pull request analysis
  - File content access
- **Authentication**: Token-based
- **Use Cases**: Development workflow, code review, project management

#### 6. **MCP Server Google Drive**
- **Repository**: [modelcontextprotocol/servers](https://github.com/modelcontextprotocol/servers/tree/main/src/gdrive)
- **Protocol Support**: HTTP, stdio
- **Description**: Google Drive file access
- **Capabilities**:
  - File listing
  - Content reading
  - Search functionality
- **Authentication**: OAuth2
- **Use Cases**: Document processing, content analysis

#### 7. **MCP Server Slack**
- **Repository**: [modelcontextprotocol/servers](https://github.com/modelcontextprotocol/servers/tree/main/src/slack)
- **Protocol Support**: HTTP, stdio
- **Description**: Slack workspace integration
- **Capabilities**:
  - Channel browsing
  - Message history
  - User information
- **Authentication**: Bot token
- **Use Cases**: Team communication analysis, workflow automation

### Specialized HTTP Servers

#### 8. **MCP Server Web Search**
- **Repository**: [Various community implementations]
- **Protocol Support**: HTTP (primary)
- **Description**: Web search capabilities
- **Capabilities**:
  - Search engine queries
  - Result aggregation
  - Web scraping (where permitted)
- **Providers**: Google, Bing, DuckDuckGo
- **Use Cases**: Research, fact-checking, content discovery

#### 9. **MCP Server REST API**
- **Repository**: [Generic REST wrapper implementations]
- **Protocol Support**: HTTP (native)
- **Description**: Generic REST API access
- **Capabilities**:
  - HTTP method support (GET, POST, PUT, DELETE)
  - Header customization
  - Authentication handling
- **Configuration**: OpenAPI/Swagger based
- **Use Cases**: Third-party service integration

#### 10. **MCP Server Weather**
- **Repository**: [Community weather server implementations]
- **Protocol Support**: HTTP
- **Description**: Weather data access
- **Capabilities**:
  - Current conditions
  - Forecasts
  - Historical data
- **Providers**: OpenWeatherMap, AccuWeather
- **Use Cases**: Weather-aware applications, travel planning

## Integration Considerations for Chrome Extensions

### Security Requirements
- **CORS**: Servers must support CORS headers for browser access
- **HTTPS**: Secure transport required for Chrome extension compatibility
- **Authentication**: Token-based auth preferred over cookies

### Performance Considerations
- **Caching**: Implement appropriate caching strategies
- **Rate Limiting**: Respect server rate limits
- **Timeout Handling**: Implement proper timeout mechanisms

### Configuration Format
```toml
[mcp-servers.sqlite]
name = "SQLite Database Server"
transport = "http"
endpoint = "https://your-mcp-server.example.com/sqlite"
authentication = "bearer"
token = "your-auth-token"
capabilities = ["read", "query", "schema"]

[mcp-servers.github]
name = "GitHub Integration"
transport = "http"
endpoint = "https://your-mcp-server.example.com/github"
authentication = "bearer"
token = "ghp_your_github_token"
capabilities = ["repositories", "issues", "files"]
```

## Getting Started

1. **Choose a Server**: Select an MCP server that fits your use case
2. **Deploy**: Set up the server with HTTP transport enabled
3. **Configure**: Add server configuration to your application
4. **Authenticate**: Set up required authentication
5. **Test**: Verify connectivity and capabilities

## Development Resources

- [MCP Specification](https://spec.modelcontextprotocol.io/)
- [MCP TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk)
- [Server Implementation Examples](https://github.com/modelcontextprotocol/servers)
- [Community Discussions](https://github.com/modelcontextprotocol/servers/discussions)

## Contributing

To add a new MCP server to this catalog:

1. Verify HTTP protocol support
2. Test with web-based clients
3. Document capabilities and configuration
4. Provide usage examples
5. Submit a pull request with documentation updates

---

**Note**: This catalog is community-maintained. Server availability, capabilities, and configurations may change. Always refer to the official documentation for the most current information.