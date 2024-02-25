import { ChatOpenAI } from '@langchain/openai';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { StringOutputParser } from '@langchain/core/output_parsers';

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
      ['human', '你是 问那个人，你需要帮助用户解决问题'],
      ['ai', '遵命，无论如何我都会帮助你'],
      ['human', '{{topic}}'],
    ]);
    const outputParser = new StringOutputParser();

    const chain = prompt.pipe(model).pipe(outputParser);
    const response = await chain.invoke({
      topic: userPrompt,
    });
    console.log(response);
  },
};
