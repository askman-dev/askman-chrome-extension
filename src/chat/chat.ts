import { ChatOpenAI } from '@langchain/openai';
import type { ClientOptions, OpenAIChatInput } from '@langchain/openai';

import { QuoteAgent, QuoteContext } from '../agents/quote';
import { HumanMessage, AIMessage, BaseMessage } from '@langchain/core/messages';
import configStorage from '@src/shared/storages/configStorage';
import { createContext } from 'react';
import { ToolsPromptInterface, SystemInvisibleMessage, HumanAskMessage } from '../types';
import { StorageManager } from '@src/utils/StorageManager';
import { extractUsedVars } from './utils/template-utils';

export interface SendOptions {
  overrideSystem?: string;
  overrideModel?: string;
}

export interface ChatCoreInterface {
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

export class ChatCoreContext implements ChatCoreInterface {
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

  private async initSystemMessage() {
    try {
      const systemPrompt = await StorageManager.getSystemPrompt();
      this.history.push(new SystemInvisibleMessage(systemPrompt.content));
    } catch (e) {
      console.error('Failed to initialize system message:', e);
    }
  }

  init() {}
  updateChatModel({ modelName, baseURL, apiKey }: { modelName: string; baseURL: string; apiKey: string }) {
    this.model = new ChatOpenAI({
      modelName: modelName,
      openAIApiKey: apiKey || '-', //必须得是非空字符串，否则会报错
      configuration: {
        baseURL: baseURL,
      },
    });
    return this;
  }
  /**
   * 根据模型名称创建对应的模型客户端
   * @param modelName 模型名称 {provider}/{model} 如：openai/gpt-3.5-turbo
   * @returns
   */
  async createModelClient(modelName: string) {
    // split by '/'
    const [provider, ...rest] = modelName.split('/');
    const model = rest.join('/');

    if (!provider || !model) {
      console.warn('Invalid model name, cant find provider or model.', modelName);
      return this;
    }
    const modelConfigs = await configStorage.getModelConfig();
    const modelConfig = modelConfigs.find(m => m.provider == provider);
    const chatInput: Partial<OpenAIChatInput> & { configuration?: ClientOptions } = {};
    if (modelConfig) {
      chatInput.temperature = modelConfig.config.temperature || 0.2;
      chatInput.topP = modelConfig.config.topP || 0.95;
      chatInput.frequencyPenalty = modelConfig.config.frequencyPenalty || 0;
      chatInput.presencePenalty = modelConfig.config.presencePenalty || 0;
      chatInput.openAIApiKey = modelConfig.config.api_key;
      chatInput.configuration = {
        baseURL: modelConfig.config.base_url,
      };
      modelConfig.config.models.some((m: { name: string; max_tokens: number }) => {
        if (m.name == model) {
          chatInput.modelName = m.name;
          return true;
        }
        return false;
      });
      this.model = new ChatOpenAI(chatInput);
    }
    return this;
  }
  async askWithQuotes(quotes: QuoteContext[], userPrompt: null | string, options?: SendOptions) {
    return this.askWithTool(null, null, quotes, userPrompt, options);
  }

  /**
   * Process message with mentions and template variables.
   * Returns the final message following the structure:
   * <reference> (if has unused mentions)
   * {template}
   * {chat.input} (if not used in template)
   */
  private processMessage(
    context: {
      browser?: { language?: string };
      page?: { url?: string; title?: string; content?: string; selection?: string };
      chat?: { language?: string; input?: string };
    },
    framework: ToolsPromptInterface | null,
    quotes: QuoteContext[],
  ): string {
    // 1. 提取模板中使用的变量
    const usedVars = framework ? extractUsedVars(framework.hbs) : new Set<string>();

    // 2. 遍历引用，标记变量使用类型
    quotes.forEach(quote => {
      // 如果变量在模板中使用到了，标记为模板变量
      if (usedVars.has(quote.type || '')) {
        quote.usageType = 'template_var';
      }
      // selection 类型的引用，标记为 mention
      else {
        quote.usageType = 'mention';
      }
    });

    // 3. 收集未使用的引用，构建 reference 块
    const unusedMentions = quotes.filter(quote => quote.usageType === 'mention');
    let referenceBlock = '';
    if (unusedMentions.length > 0) {
      const references = unusedMentions
        .map(quote => QuoteAgent.promptQuote(quote))
        .filter(Boolean)
        .join('\n');
      if (references) {
        referenceBlock = `<reference>\nBelow are some potentially helpful/relevant pieces of information for figuring out to respond\n${references}\n</reference>`;
      }
    }

    // 4. 渲染模板
    let renderedTemplate = (framework?.template as (..._args: unknown[]) => string)?.(context) || '';
    renderedTemplate = renderedTemplate.trim();

    // 5. 检查是否需要附加用户输入
    // 只有当模板中没有使用 chat.input 且用户有输入时，才需要附加
    let userInput = '';
    if (context.chat.input) {
      // 先检查是否有用户输入
      if (!usedVars.has('chat.input')) {
        // 再检查模板是否使用了这个输入
        userInput = context.chat.input;
      }
    }

    // 6. 拼接最终消息
    return [referenceBlock, renderedTemplate, userInput]
      .filter(Boolean) // 移除空字符串
      .join('\n');
  }

  /**
   * Asynchronously prompts the user with a specific tool, a list of quotes, and an optional user prompt.
   *
   * @param {ToolsPromptInterface} tool - the specific tool to prompt the user with
   * @param {QuoteContext[]} quotes - a list of quotes to prompt the user with
   * @param {null | string} userPrompt - an optional prompt for the user
   * @return {Promise<void>} a Promise that resolves when the user has responded
   */
  async askWithTool(
    framework: ToolsPromptInterface | null,
    pageContext: QuoteContext | null,
    quotes: QuoteContext[],
    userPrompt: null | string,
    options?: SendOptions,
  ): Promise<void> {
    // 1. 更新当前模型：使用临时模型或存储的模型
    const currentModel = options?.overrideModel || (await configStorage.getCurrentModel());
    await this.createModelClient(currentModel);

    // 2. 系统提示词：临时提示词优先于存储的提示词
    const systemPrompt = options?.overrideSystem || (await StorageManager.getSystemPrompt()).content;
    // Remove old system message if exists
    this.history = this.history.filter(msg => !(msg instanceof SystemInvisibleMessage));
    // Add new system message
    this.history.unshift(new SystemInvisibleMessage(systemPrompt));

    if (!userPrompt) {
      userPrompt = '';
    }

    const baseContext = {
      browser: {
        language: pageContext?.browserLanguage,
      },
      page: {
        url: pageContext?.pageUrl,
        title: pageContext?.pageTitle,
        content: pageContext?.pageContent,
        selection: pageContext?.selection,
      },
      chat: {
        language: pageContext?.browserLanguage,
        input: userPrompt,
      },
    };

    // 使用新的消息处理流程
    const prompt = this.processMessage(baseContext, framework, quotes);

    if (!prompt || prompt.trim() === '') {
      console.warn('[Askman] prompt is empty, skip sending');
      return;
    }

    this.history.push(new HumanMessage({ content: prompt }));
    if (this._onDataListener) {
      setTimeout(() => this._onDataListener(this.history));
    }
    return this.stream(this.history);
  }
  async stream(history: BaseMessage[]): Promise<void> {
    if (this._onDataListener == null) {
      console.warn('no this._onDataListener');
    }

    const pendingResponse = new AIMessage({ content: 'Thinking ...' });
    let hasResponse = false;
    setTimeout(() => {
      this.history.push(pendingResponse);
    }, 1);

    if (this._onDataListener) {
      setTimeout(() => this._onDataListener(this.history), 2);
    }

    let lastError = null;
    try {
      const stream = await this.model.stream(history);
      const chunks = [];
      for await (const chunk of stream) {
        chunks.push(chunk);
        const content = chunks.reduce((acc, cur) => acc + cur.content, '');
        // const name = chunk.name;
        if (content.trim() === '') continue;

        pendingResponse.content = content;
        // pendingResponse.name = name || 'ai';
        hasResponse = true;
        if (this._onDataListener) {
          setTimeout(() => this._onDataListener(this.history));
        }
      }
    } catch (error) {
      lastError = error;
    }

    if (!hasResponse) {
      pendingResponse.content = '(Nothing to Show)';
      if (lastError) {
        pendingResponse.content += '\n' + lastError.message;
      }
      if (lastError) {
        pendingResponse.content += '\n' + lastError.message;
      }
      if (this._onDataListener) {
        setTimeout(() => this._onDataListener(this.history));
      }
    }
  }
  setOnDataListener(callback: (_data: BaseMessage[]) => void): void {
    this._onDataListener = callback;
  }
  removeOnDataListener(): void {
    this._onDataListener = null;
  }
}

export const ChatPopupContext = createContext<ChatCoreContext>(null);
