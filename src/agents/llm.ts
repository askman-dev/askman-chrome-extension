import { ChatOpenAI } from '@langchain/openai';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { QuoteContext } from './quote';

const model = new ChatOpenAI({
  temperature: 0.2,
  topP: 0.2,
  modelName: 'glm-3-turbo',
  openAIApiKey: 'sk-1234567890',
  configuration: {
    baseURL: 'https://dev.bricks.cool/api',
  },
});

export const myObject = {
  test: async (userPrompt: string) => {
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

    const chain = prompt.pipe(model).pipe(outputParser);
    const response = await chain.invoke({
      topic: userPrompt,
    });
    console.log(`> ${userPrompt}

< ${response}
---`);
  },
  askWithQuotes: async (quotes: QuoteContext[], userPrompt: null | string) => {
    let prompt = '';
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

    myObject.test(prompt);
  },
};
