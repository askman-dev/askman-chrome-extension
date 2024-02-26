import { ChatOpenAI } from '@langchain/openai';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { QuoteContext } from '../agents/quote';
import { HumanMessage, AIMessage } from '@langchain/core/messages';

export class ChatCore {
  private model: ChatOpenAI = null;
  private history: BaseMessage[] = [];
  constructor() {
    this.model = new ChatOpenAI({
      temperature: 0.2,
      topP: 0.2,
      modelName: 'glm-3-turbo',
      openAIApiKey: 'sk-1234567890',
      configuration: {
        baseURL: 'https://dev.bricks.cool/api',
      },
    });
  }
  init() {
    this.history.length = 0;
    this.history.push(
      new HumanMessage(`你是 问那个人，你需要帮助用户解决问题.你需要遵循以下指导:
        1. 使用中文回答
        2. 用户的 Quote 需要你关注，但并不要求一定用到
        3. 用户的问题回跟在 UserPrompt 后面`),
    );
    this.history.push(new AIMessage(`遵命，无论如何我都会帮助你`));
  }
  async askWithQuotes(quotes: QuoteContext[], userPrompt: null | string) {
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

    this.history.push(new HumanMessage(prompt));
    return this.model.invoke(this.history);
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
}
