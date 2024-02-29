import { ChatOpenAI } from '@langchain/openai';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { QuoteContext } from '../agents/quote';
import { HumanMessage, AIMessage, BaseMessage } from '@langchain/core/messages';
import { createContext } from 'react';
import { ToolsPromptInterface } from '../components/ask-tooldropdown';

export interface ChatCoreInterface {
  model: ChatOpenAI;
  history: BaseMessage[];
  init();
  test(userPrompt: string);
  askWithQuotes(quotes: QuoteContext[], userPrompt: null | string);
  askWithTool(tool: ToolsPromptInterface, userPrompt: null | string);
  testAskWithQuotes(quotes: QuoteContext[], userPrompt: null | string);
  setOnDataListener(callback: (data: BaseMessage[]) => void);
  removeOnDataListener();
}

export class ChatCoreContext implements ChatCoreInterface {
  model: ChatOpenAI;
  history: BaseMessage[];
  _onDataListener: (data: BaseMessage[]) => void;
  constructor() {
    this.history = [];
    this.history.length = 0;
    this.history.push(
      new HumanMessage({
        content: `你是 问那个人，你需要帮助用户解决问题.你需要遵循以下指导:
        1. 使用中文回答
        2. 用户的 Quote 需要你关注，但并不要求一定用到
        3. 用户的问题回跟在 UserPrompt 后面`,
        name: 'human',
      }),
    );
    this.history.push(new AIMessage({ content: `遵命，无论如何我都会帮助你`, name: 'ai' }));
    // this.history.push(new HumanMessage({content: 'Quotes: * ` 404. That’s an error. The requested URL /not+found was not found on this server. That’s all we know.` from [Error 404 (Not Found)!!1](https://google.com/not+found)', name: "human"}));
    // this.history.push(new AIMessage({content: "遵命，无论如何我都会帮助你", name: "ai"}));
    // this.history.push(new HumanMessage("fff"))
    // this.history.push(new AIMessage({content: `你说了很多遍了，我知道了`, name: "ai"}));

    this.model = new ChatOpenAI({
      temperature: 0.2,
      topP: 0.2,
      // modelName: 'glm-3-turbo',
      // openAIApiKey: 'sk-1234567890',
      // configuration: {
      //   baseURL: 'https://dev.bricks.cool/api',
      // },
      modelName: 'deepseek-chat',
      openAIApiKey: 'sk-f3cf17259a04443a8fb63e5802679cd7',
      configuration: {
        baseURL: 'https://api.deepseek.com/v1',
      },
    });
    this.init();
  }
  init() {}
  async askWithQuotes(quotes: QuoteContext[], userPrompt: null | string) {
    //TODO 需要替换成从模版中读取，以方便用户自定义
    let prompt = '';
    const quotesPrompts = quotes
      .map(quote => {
        if (quote.pageTitle && quote.pageUrl && quote.selection) {
          return `* \`${quote.selection}\` from [${quote.pageTitle}](${quote.pageUrl})\n`;
        } else if (quote.pageTitle && quote.pageUrl) {
          return `* \`browsing [${quote.pageTitle}](${quote.pageUrl})\n`;
        } else if (quote.selection) {
          return `* ${quote.selection}\n`;
        } else {
          return null;
        }
      })
      .filter(p => p);
    if (quotesPrompts.length) {
      prompt = 'Quotes:\n' + quotesPrompts.join('\n') + '\n';
    }
    if (userPrompt) {
      prompt += userPrompt;
    }

    this.history.push(new HumanMessage({ content: prompt, name: 'human' }));
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
        if (quote.pageTitle && quote.pageUrl && quote.selection) {
          return `\`${quote.selection}\` from [${quote.pageTitle}](${quote.pageUrl})\n`;
        } else if (quote.pageTitle && quote.pageUrl) {
          return `\`browsing [${quote.pageTitle}](${quote.pageUrl})\n`;
        } else if (quote.selection) {
          return `${quote.selection}\n`;
        } else {
          return null;
        }
      })
      .filter(p => p);
    if (quotesPrompts.length) {
      prompt = quotesPrompts.join('\n') + '\n';
    }
    if (userPrompt) {
      prompt += userPrompt;
    }

    if (tool.template.indexOf('${INPUT}') > -1) {
      prompt = tool.template.replace('${INPUT}', prompt);
    }

    this.history.push(new HumanMessage({ content: prompt, name: 'human' }));
    this._onDataListener && setTimeout(() => this._onDataListener(this.history));
    return this.stream(this.history);
  }
  async stream(history) {
    console.log('start stream ', new Date());
    if (this._onDataListener == null) {
      console.warn('no this._onDataListener');
    }
    const pendingResponse = new AIMessage({ content: '正在思考...', name: 'ai' });
    setTimeout(() => this.history.push(pendingResponse));
    this._onDataListener && setTimeout(() => this._onDataListener(this.history));
    const stream = await this.model.stream(history);
    // 这里会等一小会
    console.log('start stream 2 ', new Date());
    const chunks = [];
    for await (const chunk of stream) {
      chunks.push(chunk);
      // console.log(`${chunk.content}|`, new Date());
      pendingResponse.content = chunks.reduce((acc, cur) => {
        return acc + cur.content;
      }, '');

      this._onDataListener && setTimeout(() => this._onDataListener(this.history));
    }
  }
  async test(userPrompt: string) {
    const prompt = ChatPromptTemplate.fromMessages([
      [
        'human',
        `你是 问那个人，你需要帮助用户解决问题.你需要遵循以下指导:
          1. 使用中文回答
          2. 用户的 Quote 需要你关注，但并不要求一定用到
          3. 用户的问题回跟在 UserPrompt 后面`,
      ],
      ['ai', '遵命，无论如何我都会帮助你'],
      ['human', '{topic}'],
    ]);
    const outputParser = new StringOutputParser();

    const chain = prompt.pipe(this.model).pipe(outputParser);
    const response = await chain.invoke({
      topic: userPrompt,
    });
    console.log(`> ${userPrompt}
    
    < ${response}
    ---`);
  }
  async testAskWithQuotes(quotes: QuoteContext[], userPrompt: null | string) {
    let prompt = 'Quotes:\n';
    quotes.forEach(quote => {
      if (quote.pageTitle && quote.pageUrl && quote.selection) {
        prompt += `* \`${quote.selection}\` from [${quote.pageTitle}](${quote.pageUrl})\n`;
      } else {
        prompt += `* ${quote.selection}\n`;
      }
    });
    if (userPrompt) {
      prompt += 'User Prompt:\n' + userPrompt;
    }

    this.test(prompt);
  }
  setOnDataListener(callback: (data: BaseMessage[]) => void) {
    this._onDataListener = callback;
  }
  removeOnDataListener() {
    this._onDataListener = null;
  }
}

export const ChatPopupContext = createContext<ChatCoreContext>(null);
