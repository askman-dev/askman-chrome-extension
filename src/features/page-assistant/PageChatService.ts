import { QuoteContext } from '@src/agents/quote';
import { HumanMessage, AIMessage, BaseMessage, ToolMessage } from '@langchain/core/messages';
import { createContext } from 'react';
import {
  ToolsPromptInterface,
  SystemInvisibleMessage,
  HumanAskMessage,
  AIThinkingMessage,
  AIToolPendingMessage,
  AIToolExecutingMessage,
  AIToolResultMessage,
} from '@src/types';
import { StorageManager } from '@src/utils/StorageManager';
import { tools } from '@src/components/controls/ToolDropdown';
import { CoreMessage, streamText, ToolCallPart, ToolResultPart } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';

interface FinishPart {
  type: 'finish';
  finishReason: string;
  totalUsage: any;
}

export interface SendOptions {
  overrideSystem?: string;
  overrideModel?: string;
}

export interface PageChatInterface {
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
  askWithAgent(
    _userPrompt: string,
    _pageContext: QuoteContext,
    _quotes: QuoteContext[],
    _options?: SendOptions,
  ): Promise<void>;
  setOnDataListener(_callback: (_data: BaseMessage[]) => void): void;
  removeOnDataListener(): void;
}

export class PageChatService implements PageChatInterface {
  history: BaseMessage[] = [];
  _onDataListener: ((data: BaseMessage[]) => void) | null = null;
  private currentAbortController: AbortController | null = null;

  constructor() {
    this.initSystemMessage();
  }

  async initSystemMessage() {
    try {
      const currentPreset = await StorageManager.getCurrentSystemPreset();
      const presets = await StorageManager.getSystemPresets();
      const preset = presets.find(p => p.name === currentPreset);
      if (preset?.hbs) {
        this.history.push(new SystemInvisibleMessage(preset.hbs));
      }
    } catch (error) {
      console.error('Error initializing system message:', error);
    }
  }

  init() {
    console.log('PageChatService initialized');
  }

  async askWithQuotes(quotes: QuoteContext[], userPrompt: string | null, options?: SendOptions) {
    if (!userPrompt?.trim()) return;

    const noContextTool = tools.find(t => t.name === 'No Context');
    if (!noContextTool) {
      console.error('[PageChatService] No Context tool not found');
      return;
    }

    return this.askWithTool(noContextTool, new QuoteContext(), quotes, userPrompt, options);
  }

  async askWithTool(
    tool: ToolsPromptInterface,
    pageContext: QuoteContext,
    quotes: QuoteContext[],
    userPrompt: string | null,
    options?: SendOptions,
  ) {
    if (!userPrompt?.trim()) return;

    try {
      const context = { chat: { input: userPrompt }, page: { ...pageContext }, quotes };
      const renderedTemplate = (tool.template as (...args: unknown[]) => string)?.(context) || '';

      const humanAskMessage = new HumanAskMessage({ content: userPrompt, name: 'user', rendered: renderedTemplate });
      this.history.push(humanAskMessage);
      this._onDataListener?.(this.history);

      const messages = this.convertToCoreMessages(options?.overrideSystem);
      if (messages.length > 0 && messages[messages.length - 1].role === 'user') {
        messages[messages.length - 1].content = renderedTemplate;
      }

      const thinkingMessage = new AIThinkingMessage();
      this._onDataListener?.([...this.history, thinkingMessage]);

      await this.streamResponse(messages, options?.overrideModel);
    } catch (error) {
      console.error('Error in askWithTool:', error);
      this.history.push(new AIMessage(`Error: ${error.message}`));
      this._onDataListener?.(this.history);
    }
  }

  async askWithAgent(
    userPrompt: string,
    pageContext: QuoteContext,
    quotes: QuoteContext[],
    options?: SendOptions,
  ) {
    if (!userPrompt?.trim()) return;

    try {
      const humanAskMessage = new HumanAskMessage({ content: userPrompt, name: 'user', rendered: userPrompt });
      this.history.push(humanAskMessage);
      this._onDataListener?.(this.history);

      const messages = this.convertToCoreMessages(options?.overrideSystem);

      const thinkingMessage = new AIThinkingMessage();
      this._onDataListener?.([...this.history, thinkingMessage]);

      const { pageTools } = await import('./tools/page-tools');
      await this.streamResponseWithTools(messages, pageTools, options?.overrideModel);
    } catch (error) {
      console.error('Error in askWithAgent:', error);
      this.history.push(new AIMessage(`Error: ${error.message}`));
      this._onDataListener?.(this.history);
    }
  }

  private convertToCoreMessages(overrideSystem?: string): CoreMessage[] {
    const messages: CoreMessage[] = [];
    const systemMessage = overrideSystem || this.history.find(m => m instanceof SystemInvisibleMessage)?.content as string;
    if (systemMessage) {
      messages.push({ role: 'system', content: systemMessage });
    }

    this.history.forEach(msg => {
      if (msg instanceof HumanAskMessage) {
        messages.push({ role: 'user', content: msg.rendered || msg.content as string });
      } else if (msg instanceof HumanMessage) {
        messages.push({ role: 'user', content: msg.content as string });
      } else if (msg instanceof AIMessage && !(msg instanceof AIThinkingMessage)) {
        messages.push({ role: 'assistant', content: msg.content as string });
      } else if (msg instanceof ToolMessage) {
        messages.push({ role: 'tool', content: [{ type: 'tool-result', toolCallId: msg.tool_call_id as string, toolName: msg.additional_kwargs.toolName as string, output: JSON.parse(msg.content as string) }] });
      }
    });

    return messages;
  }

  private async getModelProvider(overrideModel?: string) {
    const modelConfigs = await StorageManager.getModelConfig();
    let selectedProvider = null;
    let selectedModel = null;

    if (overrideModel) {
      for (const providerConfig of modelConfigs) {
        const model = providerConfig.config.models.find(m => `${providerConfig.provider}/${m.name}` === overrideModel || m.name === overrideModel);
        if (model) {
          selectedProvider = providerConfig;
          selectedModel = model;
          break;
        }
      }
    }

    if (!selectedProvider) {
      for (const providerConfig of modelConfigs) {
        const model = providerConfig.config.models.find(m => m.default);
        if (model) {
          selectedProvider = providerConfig;
          selectedModel = model;
          break;
        }
      }
    }

    if (!selectedProvider) {
      selectedProvider = modelConfigs[0];
      selectedModel = selectedProvider.config.models[0];
    }

    if (!selectedProvider || !selectedModel) throw new Error('No suitable AI model configured');

    const { base_url: baseURL, api_key: apiKey } = selectedProvider.config;
    return { customProvider: createOpenAI({ baseURL, apiKey }), selectedModel };
  }

  private async streamResponse(messages: CoreMessage[], overrideModel?: string) {
    try {
      const { customProvider, selectedModel } = await this.getModelProvider(overrideModel);
      const stream = await streamText({
        model: customProvider.chat(selectedModel.name),
        messages,
        temperature: 0.2,
      });

      let accumulatedText = '';
      const aiMessage = new AIMessage('');
      for await (const chunk of stream.textStream) {
        accumulatedText += chunk;
        aiMessage.content = accumulatedText;
        this._onDataListener?.([...this.history, aiMessage]);
      }

      this.history.push(aiMessage);
      this._onDataListener?.(this.history);
    } catch (error) {
      console.error('Error in streamResponse:', error);
      throw error;
    }
  }

  private async streamResponseWithTools(messages: CoreMessage[], tools: Record<string, any>, overrideModel?: string) {
    try {
      const { customProvider, selectedModel } = await this.getModelProvider(overrideModel);

      const stream = await streamText({
        model: customProvider.chat(selectedModel.name),
        messages,
        tools,
        temperature: 0.2,
      });

      let accumulatedText = '';
      let finalAIMessage: AIMessage | null = null;
      let toolExecutionMessages: BaseMessage[] = [];

      for await (const part of stream.fullStream) {
        console.log('[Stream Event]', part.type, part);

        switch (part.type) {
          case 'text-delta': {
            accumulatedText += part.text;
            if (!finalAIMessage) finalAIMessage = new AIMessage('');
            finalAIMessage.content = accumulatedText;
            this._onDataListener?.([...this.history, ...toolExecutionMessages, finalAIMessage]);
            break;
          }

          case 'tool-call': {
            const toolCallPart = part as ToolCallPart;
            toolExecutionMessages.push(new AIToolPendingMessage(toolCallPart.toolName, toolCallPart.input));
            this._onDataListener?.([...this.history, ...toolExecutionMessages]);
            break;
          }

          case 'tool-result': {
            const toolResultPart = part as ToolResultPart;
            toolExecutionMessages = toolExecutionMessages.filter(m => !(m instanceof AIToolPendingMessage && (m as AIToolPendingMessage).toolName === toolResultPart.toolName));
            toolExecutionMessages.push(new AIToolResultMessage(toolResultPart.toolName, toolResultPart.output));
            this.history.push(new ToolMessage({
                content: JSON.stringify(toolResultPart.output),
                tool_call_id: toolResultPart.toolCallId,
                additional_kwargs: { toolName: toolResultPart.toolName },
            }));
            this._onDataListener?.([...this.history, ...toolExecutionMessages]);
            break;
          }

          case 'finish': {
            const finishPart = part as FinishPart;
            console.log('[Stream Finish]', finishPart.finishReason, finishPart.totalUsage);
            break;
          }

          default: {
            // Handle other event types if necessary
            break;
          }
        }
      }

      if (finalAIMessage) {
        this.history.push(finalAIMessage);
      }
      this._onDataListener?.(this.history);

    } catch (error) {
      console.error('Error in streamResponseWithTools:', error);
      this.history.push(new AIMessage(`Error: ${error.message}`));
      this._onDataListener?.(this.history);
    }
  }

  setOnDataListener(callback: (data: BaseMessage[]) => void) {
    this._onDataListener = callback;
  }

  removeOnDataListener() {
    this._onDataListener = null;
  }

  abortCurrentStream() {
    if (this.currentAbortController) {
      this.currentAbortController.abort();
      this.currentAbortController = null;
    }
  }

  isStreaming(): boolean {
    return !!this.currentAbortController;
  }
}

export const PageChatContext = createContext<PageChatService | null>(null);