import { ChatOpenAI } from '@langchain/openai';

import { QuoteContext } from '@src/agents/quote';
import { HumanMessage, AIMessage, BaseMessage } from '@langchain/core/messages';
import configStorage from '@src/shared/storages/configStorage';
import { createContext } from 'react';
import { ToolsPromptInterface, SystemInvisibleMessage, HumanAskMessage } from '@src/types';
import { StorageManager } from '@src/utils/StorageManager';

export interface SendOptions {
  overrideSystem?: string;
  overrideModel?: string;
}

export interface PageChatInterface {
  model: ChatOpenAI;
  history: BaseMessage[];
  init(): void;
  askWithQuotes(_quotes: QuoteContext[], _userPrompt: null | string, _options?: SendOptions): Promise<void>;
  askWithTool(
    _tool: ToolsPromptInterface,
    _pageContext: QuoteContext,
    _quotes: QuoteContext[],
    _userPrompt: null | string,
    _options?: SendOptions,
  ): Promise<void>;
  setOnDataListener(_callback: (_data: BaseMessage[]) => void): void;
  removeOnDataListener(): void;
}

export class PageChatService implements PageChatInterface {
  model: ChatOpenAI;
  history: BaseMessage[] | HumanAskMessage[];
  _onDataListener: (_data: BaseMessage[]) => void;

  constructor() {
    this.history = [];
    this.history.length = 0;
    this.initSystemMessage();
    this.model = new ChatOpenAI({
      temperature: 0.2,
      topP: 0.95,
      modelName: 'free',
      openAIApiKey: 'sk-example', //必须得是非空字符串，否则会报错
      configuration: {
        baseURL: 'https://extapi.askman.dev/v1',
      },
    });
    this.init();
  }

  async initSystemMessage() {
    try {
      // Get the current system preset
      const currentPreset = await StorageManager.getCurrentSystemPreset();
      const presets = await StorageManager.getSystemPresets();
      const preset = presets.find(p => p.name === currentPreset);

      if (preset && preset.hbs) {
        this.history.push(new SystemInvisibleMessage(preset.hbs));
      }
    } catch (error) {
      console.error('Error initializing system message:', error);
    }
  }

  async init() {
    try {
      const configs = await configStorage.getModelConfig();

      // Find default model or use first available
      let selectedConfig = null;
      let selectedModel = null;

      // First, look for a model with default=true
      for (const config of configs) {
        const defaultModel = config.config.models.find(m => m.default === true);
        if (defaultModel) {
          selectedConfig = config;
          selectedModel = defaultModel;
          break;
        }
      }

      // Fallback to first available model
      if (!selectedConfig && configs.length > 0) {
        selectedConfig = configs[0];
        selectedModel = selectedConfig.config.models[0];
      }

      if (selectedConfig && selectedModel) {
        this.model = new ChatOpenAI({
          temperature: 0.2,
          topP: 0.95,
          modelName: selectedModel.name,
          openAIApiKey: selectedConfig.config.api_key,
          configuration: {
            baseURL: selectedConfig.config.base_url,
          },
        });
      }
    } catch (error) {
      console.error('Error initializing PageChatService:', error);
    }
  }

  async askWithQuotes(quotes: QuoteContext[], userPrompt: null | string, options?: SendOptions) {
    if (!userPrompt || userPrompt.trim() === '') {
      return;
    }

    try {
      // Override model if specified
      if (options?.overrideModel) {
        await this.switchToModel(options.overrideModel);
      }

      // Add user message to history
      const humanMessage = new HumanMessage(userPrompt);
      this.history.push(humanMessage);

      // Immediately update UI to show user message
      this._onDataListener?.(this.history);

      // Build context from quotes
      let contextString = '';
      if (quotes && quotes.length > 0) {
        contextString = quotes
          .map(quote => {
            return `Context: ${quote.selection || quote.pageContent || quote.text || ''}`;
          })
          .join('\n\n');
      }

      // Prepare messages for the model
      const messages = [...this.history];
      if (contextString) {
        messages.push(new HumanMessage(`Context:\n${contextString}\n\nQuestion: ${userPrompt}`));
      }

      // Add system override if provided
      if (options?.overrideSystem) {
        messages.unshift(new SystemInvisibleMessage(options.overrideSystem));
      }

      // Stream the response
      const stream = await this.model.stream(messages);
      let response = '';

      for await (const chunk of stream) {
        response += chunk.content;
        // Create a temporary AI message for the listener
        const tempHistory = [...this.history, new AIMessage(response)];
        this._onDataListener?.(tempHistory);
      }

      // Add final AI message to history
      this.history.push(new AIMessage(response));
      this._onDataListener?.(this.history);
    } catch (error) {
      console.error('Error in askWithQuotes:', error);
      const errorMessage = new AIMessage(`Error: ${error.message}`);
      this.history.push(errorMessage);
      this._onDataListener?.(this.history);
    }
  }

  async askWithTool(
    tool: ToolsPromptInterface,
    pageContext: QuoteContext,
    quotes: QuoteContext[],
    userPrompt: null | string,
    options?: SendOptions,
  ) {
    if (!userPrompt || userPrompt.trim() === '') {
      return;
    }

    try {
      // Override model if specified
      if (options?.overrideModel) {
        await this.switchToModel(options.overrideModel);
      }

      // Process template
      const context = {
        chat: { input: userPrompt },
        page: pageContext,
        quotes: quotes,
      };

      const renderedTemplate = (tool.template as (..._args: unknown[]) => string)?.(context) || '';

      // Create human ask message with rendered template
      const humanAskMessage = new HumanAskMessage({
        content: userPrompt,
        name: 'user',
        rendered: renderedTemplate,
      });
      this.history.push(humanAskMessage);

      // Immediately update UI to show user message
      this._onDataListener?.(this.history);

      // Prepare messages for the model
      const messages = [...this.history];

      // Add system override if provided
      if (options?.overrideSystem) {
        messages.unshift(new SystemInvisibleMessage(options.overrideSystem));
      }

      // Stream the response
      const stream = await this.model.stream(messages);
      let response = '';

      for await (const chunk of stream) {
        response += chunk.content;
        // Create a temporary AI message for the listener
        const tempHistory = [...this.history, new AIMessage(response)];
        this._onDataListener?.(tempHistory);
      }

      // Add final AI message to history
      this.history.push(new AIMessage(response));
      this._onDataListener?.(this.history);
    } catch (error) {
      console.error('Error in askWithTool:', error);
      const errorMessage = new AIMessage(`Error: ${error.message}`);
      this.history.push(errorMessage);
      this._onDataListener?.(this.history);
    }
  }

  private async switchToModel(modelName: string) {
    try {
      const configs = await configStorage.getModelConfig();

      for (const config of configs) {
        const model = config.config.models.find(
          m => m.name === modelName || `${config.provider}/${m.name}` === modelName,
        );

        if (model) {
          this.model = new ChatOpenAI({
            temperature: 0.2,
            topP: 0.95,
            modelName: model.name,
            openAIApiKey: config.config.api_key,
            configuration: {
              baseURL: config.config.base_url,
            },
          });
          break;
        }
      }
    } catch (error) {
      console.error('Error switching model:', error);
    }
  }

  setOnDataListener(callback: (_data: BaseMessage[]) => void): void {
    this._onDataListener = callback;
  }

  removeOnDataListener(): void {
    this._onDataListener = null;
  }
}

// Create context for React components
export const PageChatContext = createContext<PageChatService>(null);
