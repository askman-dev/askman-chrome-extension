import { ChatOpenAI } from '@langchain/openai';
import { QuoteAgent, QuoteContext } from '../agents/quote';
import { HumanMessage, AIMessage, BaseMessage } from '@langchain/core/messages';
import { createContext } from 'react';
import chatPresets from '@assets/conf/chat-presets.toml';
import { ToolsPromptInterface, AIInvisibleMessage, HumanInvisibleMessage, HumanAskMessage } from '../types';

export interface ChatCoreInterface {
  model: ChatOpenAI;
  history: BaseMessage[];
  init();
  askWithQuotes(quotes: QuoteContext[], userPrompt: null | string);
  askWithTool(tool: ToolsPromptInterface, quotes: QuoteContext[], userPrompt: null | string);
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
      new HumanInvisibleMessage({
        content: chatPresets['system-init']['human'],
        name: 'human',
      }),
    );
    this.history.push(new AIInvisibleMessage({ content: chatPresets['system-init']['ai'], name: 'ai' }));
    // this.history.push(new HumanMessage({content: 'Quotes: * ` 404. That’s an error. The requested URL /not+found was not found on this server. That’s all we know.` from [Error 404 (Not Found)!!1](https://google.com/not+found)', name: "human"}));
    // this.history.push(new AIMessage({content: "遵命，无论如何我都会帮助你", name: "ai"}));
    // this.history.push(new HumanMessage("fff"))
    // this.history.push(new AIMessage({content: `你说了很多遍了，我知道了`, name: "ai"}));

    this.model = new ChatOpenAI({
      temperature: 0.2,
      topP: 0.95,
      modelName: 'free',
      openAIApiKey: '',
      configuration: {
        baseURL: 'https://extapi.askman.dev/v1',
      },
    });
    this.init();
  }
  init() {}
  async askWithQuotes(quotes: QuoteContext[], userPrompt: null | string) {
    //TODO 需要替换成从模版中读取，以方便用户自定义
    let prompt = '';
    let rendered = '';
    const quotesPrompts = quotes
      .map(quote => {
        return QuoteAgent.promptQuote(quote);
      })
      .filter(p => p);
    if (quotesPrompts.length) {
      prompt = '' + quotesPrompts.join('\n') + '\n';
      rendered = QuoteAgent.formatQuotes(quotesPrompts) + '\n';
    }
    if (userPrompt) {
      prompt += userPrompt;
      rendered += userPrompt;
    }

    this.history.push(new HumanAskMessage({ content: prompt, rendered: rendered, name: 'human' }));
    this._onDataListener && setTimeout(() => this._onDataListener(this.history));
    return this.stream(this.history);
  }

  /**
   * Asynchronously prompts the user with a specific tool, a list of quotes, and an optional user prompt.
   *
   * @param {ToolsPromptInterface} tool - the specific tool to prompt the user with
   * @param {QuoteContext[]} quotes - a list of quotes to prompt the user with
   * @param {null | string} userPrompt - an optional prompt for the user
   * @return {Promise<void>} a Promise that resolves when the user has responded
   */
  async askWithTool(tool: ToolsPromptInterface, quotes: QuoteContext[], userPrompt: null | string) {
    // 先把 quotes 与 user prompt 合并，然后再用 tool 包装
    let prompt = '';
    const quotesPrompts = quotes
      .map(quote => {
        if (quote.type == 'selection') return null;
        return QuoteAgent.promptQuote(quote);
      })
      .filter(p => p);
    // if (quotesPrompts.length) {
    //   prompt = quotesPrompts.join('\n') + '\n';
    // }
    // if (userPrompt) {
    //   prompt += userPrompt;
    // }

    const context = {
      //TODO 这里 quote 和 selection 有重复定义的问题，需要解决
      quotes: quotesPrompts,
      page: {
        pageUrl: '',
        pageTitle: '',
        selection: '',
      },
      chat: {
        language: 'zh',
        input: userPrompt,
      },
    };
    quotes.forEach(quote => {
      //TODO 只保留最后一个，有什么问题呢？
      if (quote.selection) {
        context.page.selection = quote.selection;
      }
    });

    prompt = tool.template(context);
    prompt = prompt.trim();
    // prompt = nunjucks.renderString(tool.template, context);

    this.history.push(new HumanMessage({ content: prompt, name: 'human' }));
    this._onDataListener && setTimeout(() => this._onDataListener(this.history));
    return this.stream(this.history);
  }
  async stream(history) {
    // console.log('start stream ', new Date());
    if (this._onDataListener == null) {
      console.warn('no this._onDataListener');
    }
    const pendingResponse = new AIMessage({ content: '正在思考...', name: 'ai' });
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
      pendingResponse.content = '(无返回内容或返回空格)';
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
