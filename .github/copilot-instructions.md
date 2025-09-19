# Copilot Instructions for AI Agents

## Project Overview
- **Askman** is a multi-page Manifest V3 Chrome extension built with Vite, TypeScript, and React.
- Major extension contexts: `src/pages/` contains `background/`, `content/` (with `ui/` and `injected/`), `popup/`, `options/`, `sidepanel/`, `devtools/`, `panel/`, and `thought-prism/`.
- Each page is a separate entry point with its own HTML and React/TS code.
- Content scripts are split: `contentInjected` (DOM manipulation) vs. `contentUI` (React overlay).

## Build & Development
- **Install:** `npm install` (or `pnpm install`)
- **Dev build:** `npm run dev` (Chrome), `npm run dev:firefox` (Firefox)
- **Production build:** `npm run build` (Chrome), `npm run build:firefox` (Firefox)
- **Validate for Chrome Store:** `pnpm validate:chrome` (runs before build)
- **Load extension:** Load `dist/` as unpacked extension in browser.

## Key Architectural Patterns
- **Custom Vite plugins** in `utils/plugins/` for manifest generation, HMR, dynamic imports, and preload inlining.
- **HMR:** Custom WebSocket-based reload system in `utils/reload/`.
- **Cache keys:** CSS cache invalidation via manifest timestamp keys.
- **TOML-based config** in `src/assets/conf/` for models, prompts, and preferences.
- **Storage:** `src/utils/StorageManager.ts` and `src/shared/storages/` abstract Chrome storage with live updates and TOML parsing.
- **Config storage:** `src/shared/storages/configStorage.ts` manages model configs and API keys.

## Features & Data Flow
- **Page Assistant:** `src/features/page-assistant/` provides contextual AI chat with:
  - `PageChatService.ts`: streaming chat engine
  - `PagePanel.tsx`: chat UI with model/tool/system prompt selection
  - Handlebars-based prompt templates with page context injection
  - Quote system for page selections and external content
- **Multi-provider AI support** (OpenRouter, SiliconFlow, etc.)
- **Keyboard shortcuts:** Cmd+I (open chat), Cmd/Ctrl+K (cycle models)

## Developer Workflows
- **Testing:** Uses Vitest (`vitest.config.ts`). Run tests with `pnpm test` or `pnpm vitest`.
- **Chrome Store validation:** `scripts/validate-chrome-extension.js` enforces manifest/i18n limits.
- **Memory system:** Use `memory/prompts/` for requirement extraction and post-mortem analysis. See `memory/README.md` for workflow.

## Conventions & Patterns
- **React + TypeScript** for all UI and logic.
- **Feature folders**: Each major feature in its own folder under `src/features/`.
- **Shared logic**: `src/shared/` for hooks, HOCs, and storages.
- **Third-party code**: Isolated in `third-party/`.
- **No data tracking:** Only user-selected AI provider receives data.

## References
- See `README.md` for install/build/use.
- See `CLAUDE.md` for deep architectural notes and advanced patterns.
- See `memory/README.md` for knowledge capture and prompt workflows.

---

**If unsure about a pattern, check the corresponding feature or shared folder for examples.**
