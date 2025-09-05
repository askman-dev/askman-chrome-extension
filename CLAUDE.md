
# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Architecture Overview

This is a **multi-page Manifest V3 Chrome extension** built with a complex Vite-based build system supporting dual browser compatibility (Chrome + Firefox) with Hot Module Reload (HMR) for development.

### Key Architectural Patterns

**Multi-Page Chrome Extension Structure:**
- `src/pages/` contains 8 distinct extension contexts: `background/`, `content/` (with `ui/` and `injected/` subcontexts), `popup/`, `options/`, `sidepanel/`, `devtools/`, `panel/`, and `thought-prism/`
- Each page has its own HTML entry point and TypeScript/React components
- Content scripts are split into two parts: `contentInjected` (DOM manipulation) and `contentUI` (React UI overlay)

**Build System Complexity:**
- **Dual Browser Support**: Separate build commands for Chrome (`build`) and Firefox (`build:firefox`) using `__FIREFOX__` environment flag
- **HMR System**: Custom WebSocket-based reload system (`utils/reload/`) that watches `src/` and `manifest.js` changes
- **Cache Invalidation**: Dynamic cache keys for CSS files using timestamps (`<KEY>` replacement in manifest)
- **Custom Vite Plugins**: 5 custom plugins in `utils/plugins/` handle manifest generation, HMR injection, dynamic imports, and preload script inlining

**Chrome Web Store Validation:**
- Custom validation script (`scripts/validate-chrome-extension.js`) enforces Chrome Web Store limits (description ≤132 chars, name ≤75 chars)
- Reads from i18n files in `public/_locales/` for multi-language support
- Must pass validation before builds (`pnpm validate:chrome` runs first in build commands)

## Core Service Layers

**Configuration & Storage System:**
- **TOML-based Configuration**: Models, chat presets, tools, and preferences stored as TOML files in `src/assets/conf/`
- **StorageManager** (`src/utils/StorageManager.ts`): Central manager for TOML config parsing and Chrome extension storage
- **Base Storage Pattern** (`src/shared/storages/base.ts`): Abstraction over Chrome storage API with live updates, supports Local/Sync/Session/Managed storage types
- **Config Storage** (`src/shared/storages/configStorage.ts`): Manages model configurations and API keys with provider-agnostic setup

## Features Architecture

This Chrome extension is built with a sophisticated multi-feature architecture providing both page-level AI assistance and advanced multi-column conversation management.

### Feature: Page Assistant (`src/features/page-assistant/`)

**Core Purpose**: Provides contextual AI assistance for web pages with rich content integration capabilities.

**Architecture**:
- **PageChatService** (`PageChatService.ts`): Core chat engine with custom streaming for reasoning+content phases
- **PagePanel** (`PagePanel.tsx`): Full-featured chat UI with model/tool/system prompt selection
- **Template System**: Handlebars-based prompt templates with page context injection
- **Context Extraction**: Integrates with QuoteAgent for page content, URL, title, and selection data

**Key Features**:
- Multi-provider AI model support (OpenRouter, SiliconFlow, etc.)
- Custom streaming implementation for O1-style reasoning models
- Real-time message rendering with thinking animations
- Quote system for incorporating page selections and external content
- Tool dropdown integration with customizable prompt templates
- Model and system prompt selection with per-request overrides
- Keyboard shortcuts for efficient interaction (Cmd/Ctrl+K cycling)

**Message System**:
- `HumanAskMessage`: User input with rendered template content
- `AIReasoningMessage`: Dual-phase AI responses (reasoning + final content)  
- `AIThinkingMessage`: Typing/loading indicators
- `SystemInvisibleMessage`: System prompts that don't show in UI

### Feature: Prism (`src/features/prism/`)

**Core Purpose**: Advanced multi-column conversation interface for complex dialog management and thought exploration.

**Architecture Overview**:
This is a sophisticated canvas-based conversation system with three main subsystems:

#### Conversation Subsystem (`conversation/`)
- **PrismInput** (`PrismInput.tsx`): Advanced input component with integrated tool/model/system controls
- **PrismColumn** (`PrismColumn.tsx`): Individual conversation column with full chat interface
- **PrismChatService** (`services/PrismChatService.ts`): Vercel AI SDK-based streaming service

#### Canvas Subsystem (`canvas/`)
- **MultiColumnCanvas** (`MultiColumnCanvas.tsx`): Primary container with zoom/pan/focus modes
- **LayoutCalculator** (`LayoutCalculator.tsx`): Sophisticated grid layout algorithm for automatic column positioning
- **ColumnPositionWrapper** (`ColumnPositionWrapper.tsx`): Positioning and sizing wrapper
- **CanvasControlPanel** (`CanvasControlPanel.tsx`): Canvas navigation and control interface

#### Advanced Layout System
- **Grid Layout Algorithm**: Automatically positions columns using "extract and reorganize" pattern
- **Branch Detection**: Identifies parent-child relationships and creates visual conversation trees
- **Row-based Organization**: Root conversations in row 0, branched conversations in dedicated rows
- **Dynamic Positioning**: Real-time position calculation based on viewport size and column relationships

**Key Capabilities**:
- **Multi-Column Conversations**: Each column maintains independent chat history and context
- **Focus Mode**: Double-click to focus on a single column with optimal reading experience  
- **Conversation Branching**: Create alternate conversation paths from any message
- **Canvas Navigation**: Zoom, pan, and navigate large conversation landscapes
- **Cross-Column Context**: Messages can reference and build upon other columns
- **Responsive Layout**: Automatically adjusts column positions based on screen size

**Interaction Models**:
- **Normal Mode**: Full canvas navigation with pan/zoom controls
- **Focus Mode**: Single-column reading mode with text selection and smooth scrolling
- **Branch Creation**: Right-click any message to spawn new conversation thread
- **Column Management**: Drag, resize, and organize conversation columns

**Data Architecture** (`canvas/types.ts`):
- **CanvasMessage**: Core message structure extending Vercel AI SDK format
- **ChatColumn**: Column definition with messages, metadata, and positional data
- **GridData**: Layout calculation results with position mappings
- **MultiColumnState**: Complete canvas state management

### LLM Architecture (Critical: Dual Implementation System)

**WARNING**: This project contains **TWO SEPARATE LLM systems** that are incompatible with each other. Understanding both is crucial for making changes.

#### System 1: Vercel AI SDK (`src/llm/llm-service.ts`)
- **Library Stack**: `@ai-sdk/openai` + `ai` (Vercel AI SDK)
- **Entry Point**: `streamChatResponse()` function
- **Config Source**: `StorageManager.getModelConfig()` 
- **Message Format**: Vercel AI SDK's `CoreMessage` interface
- **Template Engine**: Handlebars CSP-safe version (`compileAST()`)
- **Provider Setup**: `createOpenAI()` with custom baseURL/apiKey

**FUNCTIONS USING THIS SYSTEM:**
- **Prism Multi-Column Chat** (`src/features/prism/services/PrismChatService.ts`)
  - `ThoughtPrism.tsx` - Main Prism page interface
  - `MultiColumnCanvas.tsx` - Canvas-based conversation management  
  - All Prism conversation columns and branching functionality
- **Impact of Changes**: Modifying this system affects the entire Prism feature's AI functionality

#### System 2: LangChain Implementation (Multiple Files)
- **Library Stack**: `@langchain/openai` + `@langchain/core`
- **Classes**: 
  - `ChatCoreContext` (`src/chat/chat.ts`) - Base implementation (currently unused in UI)
  - `PageChatService` (`src/features/page-assistant/PageChatService.ts`) - Extended version
- **Config Source**: `configStorage.getModelConfig()` (different storage path)
- **Message Format**: LangChain `BaseMessage` hierarchy (`HumanMessage`, `AIMessage`, custom types)
- **Streaming**: Custom fetch-based streaming with reasoning+content phase separation
- **Template Processing**: Different context structures and variable extraction

**FUNCTIONS USING THIS SYSTEM:**
- **Content Script Page Assistant** (`src/pages/content/ui/app.tsx`)
  - In-page chat overlay that appears on websites
  - `PagePanel.tsx` - Chat interface with tool/model/system prompt controls
  - Page content extraction and context integration
  - Quote system for selected text integration
- **Reasoning Display**: Custom dual-phase streaming (reasoning + content)
  - `AIReasoningMessage`, `AIThinkingMessage`, `HumanAskMessage` custom message types
  - Real-time thinking animations and progressive response rendering
- **Impact of Changes**: Modifying this system affects all in-page AI assistance functionality

#### Key Incompatibilities
1. **Message Formats**: `CoreMessage` vs `BaseMessage` - cannot be interchanged
2. **Configuration Systems**: Different storage managers with different TOML parsing
3. **Streaming Implementation**: Vercel SDK vs custom fetch + manual chunk parsing
4. **Template Context**: Different variable structures and processing logic
5. **Provider Initialization**: Different client setup patterns

#### Architecture Decision Context
- **System 1 (Vercel AI)**: Modern, clean API, better for simple streaming
- **System 2 (LangChain)**: More complex but supports custom reasoning phases, richer message types

#### Refactoring Impact Analysis
**If you modify System 1 (Vercel AI SDK):**
- ✅ **Breaks**: All Prism multi-column chat functionality
- ✅ **Breaks**: Canvas-based conversation branching and management
- ✅ **Breaks**: `ThoughtPrism.tsx` page and all its conversation features
- ❌ **Safe**: Page Assistant continues to work (uses different system)

**If you modify System 2 (LangChain):**
- ✅ **Breaks**: Content script in-page chat overlay on websites
- ✅ **Breaks**: Page content extraction and context integration
- ✅ **Breaks**: Quote system for selected text
- ✅ **Breaks**: Custom reasoning display and thinking animations
- ✅ **Breaks**: `PagePanel.tsx` chat interface
- ❌ **Safe**: Prism multi-column chat continues to work (uses different system)

**Full System Migration Risk:**
- Message format translation between `CoreMessage` ↔ `BaseMessage`
- Configuration migration between `StorageManager` ↔ `configStorage`  
- Template context structure changes
- Streaming implementation replacement
- Custom message types (`AIReasoningMessage`, etc.) compatibility

### Shared Services & Integration

**Cross-Feature Dependencies**:
- Both features use **StorageManager** for configuration persistence
- Shared **ToolDropdown**, **ModelSelector**, **SystemPromptDropdown** components
- Common **QuoteContext** system for page data integration
- Unified **template engine** (Handlebars with custom kbn-handlebars fork)
- Shared **message types** and rendering patterns

**Integration Points**:
- Page Assistant can spawn Prism conversations for complex explorations
- Prism columns can incorporate page context from Page Assistant
- Both features share model configurations and tool templates
- Unified storage backend maintains user preferences across features

**Page Context & Data Flow:**
- **QuoteContext** (`src/agents/quote.ts`): Captures page content, selection, title, and URL
- **Template System**: Handlebars-based templating with custom kbn-handlebars fork in `third-party/`
- **Message Types**: Custom message classes (HumanAskMessage, AIReasoningMessage, AIThinkingMessage) extending LangChain BaseMessage

## Development Workflow

**Package Manager**: Uses `pnpm@9.5.0` (specified in packageManager field)

**Key Commands:**
```bash
pnpm dev              # Chrome development with HMR
pnpm dev:firefox      # Firefox development with HMR  
pnpm build            # Production build for Chrome
pnpm build:firefox    # Production build for Firefox
pnpm validate:chrome  # Validate Chrome Web Store compliance
pnpm test             # Run tests with Vitest
pnpm vitest --run     # Run tests without watch mode
```

**HMR Development Process:**
1. `pnpm build:hmr` - Builds HMR client injection scripts
2. `pnpm wss` - Starts WebSocket server (port 8081)
3. `build:watch` - Watches src/ for changes and rebuilds
4. HMR clients auto-reload appropriate extension contexts

**Build Outputs:**
- `dist/` directory with manifest.json generated from `manifest.js`
- Production builds create versioned ZIP files for store upload
- CSS files get cache-busting keys for content script injection

## Technology Stack Deep-Dive

**CSS Framework Migration**: 
- Recently migrated from @twind to **Tailwind CSS v4** with custom config in `tailwind.config.ts`
- Uses CSS custom properties for theming with HSL color space
- Content scripts have isolated CSS to prevent page style conflicts

**React & UI Components:**
- **React 18.2.0** with custom HOCs in `src/shared/hoc/` for error boundaries and suspense
- **Headless UI** and **Radix UI** for accessible components  
- **Monaco Editor** integration with Shiki syntax highlighting for code editing
- **Custom Dropdown System** with recent tooltip conflict fixes

**Content Script Architecture:**
- Dual content scripts: one for DOM access, one for UI overlay
- CSS isolation using shadow DOM and construct-style-sheets-polyfill
- React root rendered in isolated container with Tailwind CSS scoping

## Configuration Files

**Critical Config Files:**
- `manifest.js` - Dynamic manifest with environment-based feature toggling (sidepanel, newtab override currently commented)
- `vite.config.ts` - Complex Vite setup with custom plugins and dual-browser support
- `src/assets/conf/*.toml` - User-configurable settings loaded at runtime
- `public/_locales/` - i18n strings for Chrome Web Store compliance

**Environment Flags:**
- `__DEV__` - Development mode flag
- `__FIREFOX__` - Firefox-specific build modifications
- Build system uses these for conditional compilation

## Extension Permissions & Security

**Manifest V3 Permissions:**
- `tabs`, `notifications`, `storage`, `contextMenus` 
- Content Security Policy allows 'wasm-unsafe-eval' for Monaco Editor
- Web accessible resources carefully scoped to necessary assets

**Command System:**
- Keyboard shortcut: Ctrl+I (Command+I on Mac) for chat popup
- Context menu integration for selected text processing
- Background script handles tab management and popup display logic

## Testing & Quality

**Test Setup:**
- **Vitest** with jsdom environment for component testing
- Custom test utilities in `test-utils/`
- Coverage reports via @vitest/coverage-v8

**Code Quality:**
- ESLint with Airbnb TypeScript config
- Prettier formatting with lint-staged pre-commit hooks
- Husky Git hooks for quality enforcement
- Commitlint for conventional commit messages

## Key Files for Extension Context Understanding

- `src/pages/background/index.ts` - Service worker with context menu and command handling
- `src/pages/content/ui/app.tsx` - Main content script UI entry point  
- `src/features/page-assistant/PageChatService.ts` - Core AI chat functionality
- `utils/plugins/make-manifest.ts` - Dynamic manifest generation with cache invalidation
- `src/shared/storages/base.ts` - Chrome extension storage abstraction
- `src/agents/quote.ts` - Page context extraction and processing

This architecture enables sophisticated AI-powered web page interaction while maintaining Chrome Web Store compliance and cross-browser compatibility.