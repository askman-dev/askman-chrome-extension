import classNames from 'classnames';
import AskCode from './ask-code';
import { QuoteAgent } from '../agents/quote';
import React from 'react';

export enum AskMessageType {
  TEXT = 'text',
  IMAGE = 'image',
  CODE = 'code',
}

interface AskMessageItem {
  type: AskMessageType | string;
  text: string;
  name?: string;
}

const TextWithLineBreaks = text => {
  // console.log('text', text, 'lines', text.split('\n'));
  // 先解决 quote 的格式
  // console.log(text)
  const blocks = QuoteAgent.parseBlocks(text);
  const rendered = blocks.map((block, index) => {
    // console.info(index, block)
    if (block.type === 'quote') {
      return (
        <div
          key={index}
          className="bg-gray-100 border-l-4 border-blue-500 p-2 mb-2 overflow-hidden whitespace-nowrap text-ellipsis">
          <span className="font-bold mr-2">{block.content.join(', ')}</span>
        </div>
      );
    } else if (block.type === 'code') {
      return (
        <pre key={`code-${index}`} className="bg-gray-800 text-white p-4 rounded mb-2 overflow-x-auto">
          <code>{block.content.join('\n')}</code>
        </pre>
      );
    } else {
      return (
        <div key={`text-${index}`} className="mb-2">
          {block.content.map((line, lineIndex) => (
            <React.Fragment key={`line-${lineIndex}`}>
              {line}
              {lineIndex < block.content.length - 1 && (
                <>
                  <br />
                  <br />
                </>
              )}
            </React.Fragment>
          ))}
        </div>
      );
    }
  });

  return rendered;
};
function AskMessage(props: AskMessageItem) {
  const { type, text, name } = props;
  let messageItem = <div>{text}</div>;

  // 根据不同的类型，渲染不同的内容
  switch (type) {
    case AskMessageType.TEXT:
      messageItem = <>{TextWithLineBreaks(text)}</>;
      break;
    case AskMessageType.CODE:
      messageItem = <AskCode code={text} />;
      break;
    default:
      break;
  }

  return (
    <div
      className={classNames(
        name === 'ai' ? 'text-gray-800 mb-3' : 'text-sky-600 mb-2 max-h-60 overflow-scroll',
        'font-bold',
      )}>
      {messageItem}
    </div>
  );
}

export default AskMessage;
