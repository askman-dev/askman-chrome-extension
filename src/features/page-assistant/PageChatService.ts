import { ChatOpenAI } from '@langchain/openai';

import { QuoteContext } from '@src/agents/quote';
import { HumanMessage, AIMessage, BaseMessage } from '@langchain/core/messages';
import configStorage from '@src/shared/storages/configStorage';
import { createContext } from 'react';
import {
  ToolsPromptInterface,
  SystemInvisibleMessage,
  HumanAskMessage,
  AIThinkingMessage,
  AIReasoningMessage,
} from '@src/types';
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

    console.log('[PageChatService] askWithQuotes 被调用');
    console.log('[PageChatService] 收到的引用数据:', quotes);
    console.log('[PageChatService] 用户输入:', userPrompt);

    // Create a default tool with template function that handles quotes context
    const defaultQuotesTool: ToolsPromptInterface = {
      id: 'default-quotes',
      name: 'Default Quotes Handler',
      hbs: '', // Not using Handlebars
      template: (context: { chat: { input: string }; quotes: QuoteContext[] }) => {
        const { chat, quotes } = context;

        console.log('[PageChatService] 模板渲染 - context:', context);

        if (!quotes || quotes.length === 0) {
          console.log('[PageChatService] 没有引用数据，返回原输入:', chat.input);
          return chat.input;
        }

        const contextString = quotes
          .map((quote, index) => {
            console.log(`[PageChatService] 处理引用 ${index}:`, quote);

            // Fix: Check all possible properties including pageTitle and pageUrl
            const content =
              quote.selection ||
              quote.pageContent ||
              quote.pageTitle || // Added
              quote.pageUrl || // Added
              quote.text ||
              '';

            console.log(`[PageChatService] 引用内容 ${index}:`, content ? content.slice(0, 100) + '...' : '(空)');

            if (!content) return '';

            // Use cleaner format with quote type
            return `[${quote.type || 'context'}]: ${content}`;
          })
          .filter(line => line !== '')
          .join('\n');

        console.log(
          '[PageChatService] 最终上下文字符串:',
          contextString ? contextString.slice(0, 200) + '...' : '(空)',
        );

        if (!contextString) {
          console.log('[PageChatService] 上下文为空，返回原输入');
          return chat.input;
        }

        const finalTemplate = `Context:\n${contextString}\n\nQuestion: ${chat.input}`;
        console.log('[PageChatService] 最终模板结果:', finalTemplate.slice(0, 300) + '...');
        return finalTemplate;
      },
    };

    // Call askWithTool with the default tool
    return this.askWithTool(
      defaultQuotesTool,
      new QuoteContext(), // Empty pageContext since quotes contain the needed info
      quotes,
      userPrompt,
      options,
    );
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

      // Prepare messages for the model - replace the last user message with rendered template
      const messages = [...this.history];
      // Replace the HumanAskMessage content with rendered template for model
      const lastMessage = messages[messages.length - 1];
      if (lastMessage instanceof HumanAskMessage) {
        messages[messages.length - 1] = new HumanMessage(renderedTemplate);
      }

      // Add system override if provided, replacing any existing system messages
      if (options?.overrideSystem) {
        // Remove existing system messages
        const filteredMessages = messages.filter(msg => !(msg instanceof SystemInvisibleMessage));
        // Add new system message at the beginning
        messages.splice(0, messages.length, new SystemInvisibleMessage(options.overrideSystem), ...filteredMessages);
      }

      // Show thinking indicator
      const thinkingMessage2 = new AIThinkingMessage();
      const thinkingHistory2 = [...this.history, thinkingMessage2];
      this._onDataListener?.(thinkingHistory2);

      // Get current model configuration for custom streaming
      const configs = await configStorage.getModelConfig();
      let apiKey = 'sk-example';
      let baseURL = 'https://extapi.askman.dev/v1';
      let modelName = 'free';

      // Find the current model config
      if (options?.overrideModel) {
        for (const config of configs) {
          const model = config.config.models.find(
            m => m.name === options.overrideModel || `${config.provider}/${m.name}` === options.overrideModel,
          );
          if (model) {
            apiKey = config.config.api_key;
            baseURL = config.config.base_url;
            modelName = model.name;
            break;
          }
        }
      } else {
        // Use default model from storage
        const currentModel = await configStorage.getCurrentModel();
        if (currentModel) {
          for (const config of configs) {
            const model = config.config.models.find(
              m => m.name === currentModel || `${config.provider}/${m.name}` === currentModel,
            );
            if (model) {
              apiKey = config.config.api_key;
              baseURL = config.config.base_url;
              modelName = model.name;
              break;
            }
          }
        }
      }

      // Use custom streaming to handle reasoning + content phases
      const finalMessage2 = await this.streamWithReasoning(messages, apiKey, baseURL, modelName);

      // Add final reasoning message to history (keep it as AIReasoningMessage to preserve gray styling)
      this.history.push(finalMessage2);
      this._onDataListener?.(this.history);
    } catch (error) {
      console.error('Error in askWithTool:', error);
      const errorMessage = new AIMessage(`Error: ${error.message}`);
      this.history.push(errorMessage);
      this._onDataListener?.(this.history);
    }
  }

  // Custom streaming method to access raw chunks with reasoning data
  private async streamWithReasoning(
    messages: BaseMessage[],
    apiKey: string,
    baseURL: string,
    modelName: string,
  ): Promise<AIReasoningMessage> {
    const reasoningMessage = new AIReasoningMessage();

    try {
      // Convert messages to API format
      const apiMessages = messages
        .filter(
          msg =>
            !(msg instanceof SystemInvisibleMessage) ||
            (typeof msg.content === 'string' ? msg.content.trim() !== '' : true),
        )
        .map(msg => {
          if (msg instanceof SystemInvisibleMessage) {
            return { role: 'system', content: msg.content };
          } else if (msg instanceof HumanMessage) {
            return { role: 'user', content: msg.content };
          } else if (msg instanceof AIMessage) {
            return { role: 'assistant', content: msg.content };
          }
          return { role: 'user', content: String(msg.content) };
        });

      // Make direct API request (ensure no double slashes)
      const cleanBaseURL = baseURL.endsWith('/') ? baseURL.slice(0, -1) : baseURL;
      const response = await fetch(`${cleanBaseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: modelName,
          messages: apiMessages,
          stream: true,
          temperature: 0.2,
          top_p: 0.95,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body reader available');
      }

      const decoder = new TextDecoder();
      let buffer = '';
      let hasFirstChunk = false;
      let accumulatedReasoning = '';
      let accumulatedContent = '';

      // eslint-disable-next-line no-constant-condition
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');

        // Keep the last incomplete line in buffer
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6).trim();
            if (data === '[DONE]') continue;

            try {
              const chunk = JSON.parse(data);
              const delta = chunk.choices?.[0]?.delta;

              if (delta) {
                let shouldUpdate = false;

                // Handle reasoning phase (only when reasoning is present and content is empty)
                if (delta.reasoning && typeof delta.reasoning === 'string' && !delta.content) {
                  accumulatedReasoning += delta.reasoning;
                  reasoningMessage.updateReasoning(accumulatedReasoning);
                  shouldUpdate = true;
                  console.log('Reasoning chunk:', delta.reasoning);
                }

                // Handle content phase (only when content is present)
                if (delta.content && typeof delta.content === 'string') {
                  accumulatedContent += delta.content;
                  reasoningMessage.updateContent(accumulatedContent);
                  shouldUpdate = true;
                  console.log('Content chunk:', delta.content);
                }

                // Update UI only when we have actual changes
                if (shouldUpdate) {
                  if (!hasFirstChunk) {
                    hasFirstChunk = true;
                  }
                  const tempHistory = [...this.history, reasoningMessage];
                  this._onDataListener?.(tempHistory);
                }
              }
            } catch (parseError) {
              console.error('Error parsing chunk:', parseError);
            }
          }
        }
      }

      reader.releaseLock();
    } catch (error) {
      console.error('Error in custom streaming:', error);
      reasoningMessage.updateContent(`Error: ${error.message}`);
    }

    return reasoningMessage;
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
