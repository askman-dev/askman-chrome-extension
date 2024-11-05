import { ChatOpenAI } from '@langchain/openai';
import type { ClientOptions, OpenAIChatInput } from '@langchain/openai';

import { QuoteAgent, QuoteContext } from '../agents/quote';
import { HumanMessage, AIMessage, BaseMessage } from '@langchain/core/messages';
import configStorage from '@src/shared/storages/configStorage';
import { createContext } from 'react';
import chatPresets from '@assets/conf/chat-presets.toml';
import { ToolsPromptInterface, SystemInvisibleMessage, HumanAskMessage } from '../types';

export interface ChatCoreInterface {
  model: ChatOpenAI;
  history: BaseMessage[];
  init();
  askWithQuotes(quotes: QuoteContext[], userPrompt: null | string);
  askWithTool(tool: ToolsPromptInterface, pageContext: QuoteContext, quotes: QuoteContext[], userPrompt: null | string);
  setOnDataListener(callback: (data: BaseMessage[]) => void);
  removeOnDataListener();
}

export class ChatCoreContext implements ChatCoreInterface {
  model: ChatOpenAI;
  history: BaseMessage[] | HumanAskMessage[];
  _onDataListener: (data: BaseMessage[]) => void;
  constructor() {
    this.history = [];
    this.history.length = 0;
    this.history.push(
      new SystemInvisibleMessage({
        content: chatPresets['system-init']['system'],
        name: 'system',
      }),
    );
    // this.history.push(new AIInvisibleMessage({ content: chatPresets['system-init']['ai'], name: 'ai' }));
    // this.history.push(new HumanMessage({content: 'Quotes: * ` 404. That’s an error. The requested URL /not+found was not found on this server. That’s all we know.` from [Error 404 (Not Found)!!1](https://google.com/not+found)', name: "human"}));
    // this.history.push(new AIMessage({content: "遵命，无论如何我都会帮助你", name: "ai"}));
    // this.history.push(new HumanMessage("fff"))
    // this.history.push(new AIMessage({content: `你说了很多遍了，我知道了`, name: "ai"}));

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
   * 根据模型名称更新模型
   * @param modelName 模型名称 {provider}/{model} 如：openai/gpt-3.5-turbo
   * @returns
   */
  async updateModelByName(modelName: string) {
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
  async askWithQuotes(quotes: QuoteContext[], userPrompt: null | string) {
    return this.askWithTool(null, null, quotes, userPrompt);
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
    framework: ToolsPromptInterface,
    pageContext: QuoteContext,
    quotes: QuoteContext[],
    userPrompt: null | string,
  ) {
    const context = {
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

    let prompt = framework?.template(context) || '';
    prompt = prompt.trim();
    // concat framework prompt with user prompt
    const quotesPrompts = quotes
      .map(quote => {
        return QuoteAgent.promptQuote(quote);
      })
      .filter(p => p);
    if (quotesPrompts.length) {
      prompt = quotesPrompts.join('\n') + '\n';
    }
    if (userPrompt) {
      prompt += userPrompt;
    }
    if (prompt.trim() == '') {
      console.warn('[Askman] prompt is empty, skip sending');
      return;
    }
    this.history.push(new HumanMessage({ content: prompt, name: 'human' }));
    this._onDataListener && setTimeout(() => this._onDataListener(this.history));
    return this.stream(this.history);
  }
  async stream(history) {
    // console.log('start stream ', new Date());
    if (this._onDataListener == null) {
      console.warn('no this._onDataListener');
    }
    const pendingResponse = new AIMessage({ content: 'Just Guessing ...', name: 'ai' });
    let hasResponse = false;
    setTimeout(() => this.history.push(pendingResponse));
    this._onDataListener && setTimeout(() => this._onDataListener(this.history));
    const stream = await this.model.stream(history);
    // 这里会等一小会
    // console.log('start stream 2 ', new Date());
    const chunks = [];
    for await (const chunk of stream) {
      chunks.push(chunk);
      // console.log(`${chunk.content}|`, new Date());
      const content = chunks.reduce((acc, cur) => {
        return acc + cur.content;
      }, '');
      if (content.trim() == '') continue;
      pendingResponse.content = content;
      hasResponse = true;
      this._onDataListener && setTimeout(() => this._onDataListener(this.history));
    }
    if (!hasResponse) {
      pendingResponse.content = '(Nothing to Show)';
      this._onDataListener && setTimeout(() => this._onDataListener(this.history));
    }
  }
  setOnDataListener(callback: (data: BaseMessage[]) => void) {
    this._onDataListener = callback;
  }
  removeOnDataListener() {
    this._onDataListener = null;
  }
}

export const ChatPopupContext = createContext<ChatCoreContext>(null);
