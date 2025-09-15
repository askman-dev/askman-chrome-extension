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
import { CoreMessage, streamText } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { stepCountIs } from 'ai';

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
  _onDataListener: ((_data: BaseMessage[]) => void) | null = null;
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
      const renderedTemplate = (tool.template as (..._args: unknown[]) => string)?.(context) || '';

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
    _pageContext: QuoteContext,
    _quotes: QuoteContext[],
    options?: SendOptions,
  ) {
    if (!userPrompt?.trim()) return;

    console.log('[PageChatService] 🤖 askWithAgent called with:', { userPrompt, _pageContext, _quotes, options });

    try {
      const humanAskMessage = new HumanAskMessage({ content: userPrompt, name: 'user', rendered: userPrompt });
      this.history.push(humanAskMessage);
      this._onDataListener?.(this.history);

      const messages = this.convertToCoreMessages(options?.overrideSystem);

      // 显示思考状态
      const thinkingMessage = new AIThinkingMessage();
      this._onDataListener?.([...this.history, thinkingMessage]);

      console.log('[PageChatService] 🔧 Loading page tools for agent mode...');
      const { pageTools } = await import('./tools/page-tools');
      await this.streamResponseWithTools(messages, pageTools, options?.overrideModel, thinkingMessage);
    } catch (error) {
      console.error('[PageChatService] Error in askWithAgent:', error);
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private async streamResponseWithTools(messages: CoreMessage[], tools: Record<string, any>, overrideModel?: string, initialThinkingMessage?: AIThinkingMessage) {
    try {
      const { customProvider, selectedModel } = await this.getModelProvider(overrideModel);
      
      console.log('[PageChatService] 🤖 Using model:', selectedModel.name, 'from provider:', customProvider);

      const result = await streamText({
        model: customProvider.chat(selectedModel.name),
        messages,
        tools,
        stopWhen: stepCountIs(10),
        onFinish: async ({ _text, finishReason, usage, _response, steps, totalUsage }) => {
          console.log('[PageChatService] 🛑 AI finished processing. Reason:', finishReason);
          console.log('[PageChatService] Usage for this request:', usage);
          console.log('[PageChatService] Total usage this session:', totalUsage);
          console.log('[PageChatService] Steps taken:', steps);
        }
      });

      let accumulatedText = '';
      let finalAIMessage: AIMessage | null = null;
      const currentToolCalls = new Map<string, BaseMessage>();
      let hasToolsCompleted = false;
      let thinkingAfterTools: AIThinkingMessage | null = null;

      // 新增：基于事件流的消息片段组装
      interface MessageSegment {
        type: 'text' | 'tool';
        content: string | BaseMessage; // string for text, BaseMessage for tool
        toolId?: string;
      }

      const messageSegments: MessageSegment[] = [];
      let currentTextBuffer = '';

      // 辅助函数：基于 segments 构建显示消息数组
      const buildDisplayMessages = (): BaseMessage[] => {
        const displayMessages = [...this.history];

        for (const segment of messageSegments) {
          if (segment.type === 'text' && segment.content.trim()) {
            displayMessages.push(new AIMessage(segment.content));
          } else if (segment.type === 'tool') {
            displayMessages.push(segment.content);
          }
        }

        // 添加当前文本缓冲区（如果有内容）
        if (currentTextBuffer.trim()) {
          displayMessages.push(new AIMessage(currentTextBuffer));
        }

        return displayMessages;
      };

      // 新增：thinking 状态管理
      let showInitialThinking = !!initialThinkingMessage;
      const thinkingStartTime = Date.now();

      for await (const part of result.fullStream) {
        switch (part.type) {
          case 'text-delta': {
            accumulatedText += part.text;
            currentTextBuffer += part.text;
            console.log('[PageChatService] 📝 Text delta received:', part.text, 'accumulated:', accumulatedText.length);
            
            // 工具完成后的思考状态处理
            if (hasToolsCompleted && !finalAIMessage && !showInitialThinking) {
              if (!thinkingAfterTools) {
                thinkingAfterTools = new AIThinkingMessage();
                console.log('[PageChatService] 💭 显示工具完成后的思考状态');
                this._onDataListener?.([...this.history, ...Array.from(currentToolCalls.values()), thinkingAfterTools]);
              }
            }
            
            // 初始 thinking 管理：确保至少显示 500ms 且有足够内容才移除
            if (showInitialThinking && initialThinkingMessage) {
              const elapsed = Date.now() - thinkingStartTime;
              
              if (elapsed < 500 || accumulatedText.length < 8) {
                // 继续显示 thinking（时间不够或内容太少）
                console.log('[PageChatService] 💭 保持显示初始 thinking，elapsed:', elapsed, 'length:', accumulatedText.length);
                this._onDataListener?.([...this.history, initialThinkingMessage]);
              } else {
                // 有足够内容且时间够了，移除 thinking
                console.log('[PageChatService] ✨ 移除初始 thinking，显示文本');
                showInitialThinking = false;
                if (!finalAIMessage) finalAIMessage = new AIMessage('');
                finalAIMessage.content = accumulatedText;
                this._onDataListener?.([...this.history, finalAIMessage]);
              }
            } else if (!showInitialThinking) {
              // 正常文本更新（thinking 已移除）- 使用新的分割逻辑
              const displayMessages = buildDisplayMessages();

              // 如果有工具后的thinking且当前文本缓冲区为空
              if (thinkingAfterTools && (!currentTextBuffer || !currentTextBuffer.trim())) {
                displayMessages.push(thinkingAfterTools);
              }

              this._onDataListener?.(displayMessages);
            }
            break;
          }
          case 'tool-call': {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            console.log('[PageChatService] 🛠️ Tool called:', part.toolName, 'with input:', (part as any).input);
            console.log('[PageChatService] 🔑 Tool call ID:', part.toolCallId);

            // 工具调用开始，移除初始 thinking
            showInitialThinking = false;

            // 如果当前文本缓冲区有内容，先推入 segments
            if (currentTextBuffer.trim()) {
              messageSegments.push({
                type: 'text',
                content: currentTextBuffer
              });
              console.log('[PageChatService] 📝 Pushed text segment before tool, length:', currentTextBuffer.length);
              currentTextBuffer = ''; // 清空缓冲区
            }

            // 显示工具准备状态
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const toolPendingMsg = new AIToolPendingMessage(part.toolName, (part as any).input);
            currentToolCalls.set(part.toolCallId, toolPendingMsg);

            // 添加工具 segment
            messageSegments.push({
              type: 'tool',
              content: toolPendingMsg,
              toolId: part.toolCallId
            });
            console.log('[PageChatService] 📝 Added tool segment, total segments:', messageSegments.length);

            // 构建并发送显示消息
            const displayMessages = buildDisplayMessages();
            console.log('[PageChatService] 📤 Sending pending state to UI, tool count:',
              displayMessages.filter(m => m.constructor.name.includes('Tool')).length);
            // 强制创建新的数组引用以确保React状态更新
            const forceNewArray = [...displayMessages];
            this._onDataListener?.(forceNewArray);

            // 立即更新为 "正在执行" 状态
            const toolCallId = part.toolCallId; // 捕获当前的 toolCallId
            const timeoutStart = Date.now();
            console.log('[PageChatService] ⏰ Setting timeout at:', timeoutStart);
            setTimeout(() => {
              const capturedToolCallId = toolCallId;
              console.log('[PageChatService] ⏰ Timeout executing at:', Date.now(), 'delay:', Date.now() - timeoutStart);

              // 1. 记录更新前的状态
              const existingTool = currentToolCalls.get(capturedToolCallId);
              console.log('[PageChatService] 🔍 setTimeout triggered for tool:', capturedToolCallId);
              console.log('[PageChatService] 📊 BEFORE setTimeout update - existing tool:', {
                exists: !!existingTool,
                type: existingTool?.constructor.name,
                content: typeof existingTool?.content === 'string' ? existingTool.content.substring(0, 50) + '...' : existingTool?.content,
                currentStatus: existingTool?.constructor.name === 'Dr' ? 'completed' :
                              existingTool?.constructor.name === 'xr' ? 'executing' : 'pending'
              });

              // 2. 决策逻辑：检查是否应该更新
              const shouldUpdate = existingTool && existingTool.constructor.name !== 'Dr';
              console.log('[PageChatService] 🤔 Should update to executing?', shouldUpdate,
                'Reason:', existingTool?.constructor.name === 'Dr' ? 'Already completed' : 'Still pending');

              if (shouldUpdate) {
                // 3. 执行更新
                console.log('[PageChatService] ✏️ UPDATING to executing state for tool:', part.toolName);
                const toolExecutingMsg = new AIToolExecutingMessage(part.toolName);
                currentToolCalls.set(capturedToolCallId, toolExecutingMsg);

                // 4. 更新对应的 segment
                const segmentIndex = messageSegments.findIndex(s => s.type === 'tool' && s.toolId === capturedToolCallId);
                if (segmentIndex !== -1) {
                  messageSegments[segmentIndex].content = toolExecutingMsg;
                  console.log('[PageChatService] 📊 Updated segment at index:', segmentIndex);
                }

                // 5. 记录更新后的状态
                const afterUpdate = currentToolCalls.get(capturedToolCallId);
                console.log('[PageChatService] 📊 AFTER setTimeout update:', {
                  type: afterUpdate?.constructor.name,
                  content: typeof afterUpdate?.content === 'string' ? afterUpdate.content.substring(0, 50) + '...' : afterUpdate?.content,
                  mapSize: currentToolCalls.size
                });
              } else {
                console.log('[PageChatService] ⏭️ SKIPPING setTimeout update - tool already in final state');
                return; // 跳过后续的 UI 更新
              }

              // 构建并发送显示消息
              const updatedMessages = buildDisplayMessages();
              console.log('[PageChatService] 📤 Sending executing state to UI, tool count:',
                updatedMessages.filter(m => m.constructor.name.includes('Tool')).length);
              // 强制创建新的数组引用以确保React状态更新
              const forceNewArray = [...updatedMessages];
              this._onDataListener?.(forceNewArray);
            }, 100); // 短暂延迟，让用户看到 "准备执行" 状态
            break;
          }
          case 'tool-result': {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const toolOutput = (part as any).output;
            console.log('[PageChatService] ✅ Tool result for:', part.toolName, 'output length:', typeof toolOutput === 'string' ? toolOutput.length : 'non-string');
            console.log('[PageChatService] 🔑 Tool result ID:', part.toolCallId);

            // 1. 记录更新前的状态
            const existingTool = currentToolCalls.get(part.toolCallId);
            console.log('[PageChatService] 📊 BEFORE tool-result update:', {
              toolId: part.toolCallId,
              existingToolExists: !!existingTool,
              existingType: existingTool?.constructor.name,
              existingContent: typeof existingTool?.content === 'string' ? existingTool.content.substring(0, 50) + '...' : existingTool?.content,
              currentMapIds: Array.from(currentToolCalls.keys()),
              currentMapSize: currentToolCalls.size
            });

            // 2. 执行更新
            console.log('[PageChatService] ✏️ UPDATING to result state for tool:', part.toolName);
            const toolResultMsg = new AIToolResultMessage(part.toolName, toolOutput);
            currentToolCalls.set(part.toolCallId, toolResultMsg);
            hasToolsCompleted = true;

            // 3. 更新对应的 segment
            const segmentIndex = messageSegments.findIndex(s => s.type === 'tool' && s.toolId === part.toolCallId);
            if (segmentIndex !== -1) {
              messageSegments[segmentIndex].content = toolResultMsg;
              console.log('[PageChatService] 📊 Updated tool segment to result state at index:', segmentIndex);
            }

            // 3. 记录更新后的状态
            console.log('[PageChatService] 📊 AFTER tool-result update:', {
              newType: toolResultMsg.constructor.name,
              newContent: typeof toolResultMsg.content === 'string' ? toolResultMsg.content.substring(0, 50) + '...' : toolResultMsg.content,
              mapSize: currentToolCalls.size,
              mapContents: Array.from(currentToolCalls.entries()).map(([id, msg]) => ({
                id: id.substring(0, 12) + '...',
                type: msg.constructor.name,
                content: typeof msg.content === 'string' ? msg.content.substring(0, 30) + '...' : '[Complex]'
              }))
            });
            console.log('[PageChatService] 🎯 Tool result message type:', toolResultMsg.constructor.name);
            console.log('[PageChatService] 🗃️ Map contents after update:',
              Array.from(currentToolCalls.entries()).map(([id, msg]) => ({id, type: msg.constructor.name})));
            console.log('[PageChatService] 🎯 Tool result message content:', toolResultMsg.content);
            
            // 构建并发送显示消息
            const displayMessages = buildDisplayMessages();

            console.log('[PageChatService] 🔧 Tool messages to add in tool-result:',
              Array.from(currentToolCalls.values()).map(m => ({type: m.constructor.name, content: m.content})));

            console.log('[PageChatService] 📤 Sending updated messages to UI, total count:', displayMessages.length);
            console.log('[PageChatService] 📋 Tool states in final array:',
              displayMessages.filter(m => m.constructor.name.includes('Tool')).map(m => m.constructor.name));
            console.log('[PageChatService] 🔍 All messages being sent:',
              displayMessages.map((m, i) => ({
                index: i,
                type: m.constructor.name,
                content: typeof m.content === 'string' ? m.content.substring(0, 50) + '...' : '[Complex Content]'
              })));

            // 强制创建新的数组引用以确保React状态更新
            const forceNewArray = [...displayMessages];
            this._onDataListener?.(forceNewArray);
            break;
          }
        }
      }

      // 确保最后的文本也被添加到 segments
      if (currentTextBuffer.trim()) {
        messageSegments.push({
          type: 'text',
          content: currentTextBuffer
        });
        console.log('[PageChatService] 📝 Pushed final text segment, length:', currentTextBuffer.length);
      }

      // 基于 segments 添加最终消息到历史记录
      for (const segment of messageSegments) {
        if (segment.type === 'text' && segment.content.trim()) {
          this.history.push(new AIMessage(segment.content));
        } else if (segment.type === 'tool') {
          this.history.push(segment.content);
        }
      }

      // 最终更新，确保显示完整的对话历史
      this._onDataListener?.(this.history);

    } catch (error) {
      console.error('[PageChatService] Error in streamResponseWithTools:', error);
      this.history.push(new AIMessage(`Error: ${error.message}`));
      this._onDataListener?.(this.history);
    }
  }

  setOnDataListener(callback: (_data: BaseMessage[]) => void) {
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
