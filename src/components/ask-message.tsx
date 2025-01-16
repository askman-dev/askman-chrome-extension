import classNames from 'classnames';
import AskCode from './ask-code';
import { QuoteAgent } from '../agents/quote';
import React, { useState } from 'react';
import CopyButton, { useCopyButton } from './base/CopyButton';

/* eslint-disable no-unused-vars */
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

function AskMessage(props: AskMessageItem) {
  const { type, text, name } = props;
  const [codeHover, setCodeHover] = useState<number | null>(null);
  const { isVisible, handlers } = useCopyButton(type !== AskMessageType.CODE);
  let messageItem = <div>{text}</div>;

  const TextWithLineBreaks = text => {
    const blocks = QuoteAgent.parseBlocks(text);
    const rendered = blocks.map((block, index) => {
      if (block.type === 'quote') {
        return (
          <div
            key={index}
            className="bg-gray-100 border-l-4 border-blue-500 p-2 mr-4 mb-2 overflow-hidden whitespace-nowrap text-ellipsis">
            <span className="font-bold mr-2">{block.content.join(', ')}</span>
          </div>
        );
      } else if (block.type === 'code') {
        return (
          <div
            className="relative"
            key={`code-${index}`}
            onMouseEnter={() => setCodeHover(index)}
            onMouseLeave={() => setCodeHover(null)}>
            <pre className="bg-gray-800 text-white p-4 rounded mb-2 overflow-x-auto">
              <code>{block.content.join('\n')}</code>
            </pre>
            {codeHover === index && (
              <CopyButton text={block.content.join('\n')} className="top-2 right-2 bg-white hover:bg-gray-100" />
            )}
          </div>
        );
      } else {
        return (
          <div key={`text-${index}`}>
            {block.content.map((line, lineIndex) => (
              <React.Fragment key={`line-${lineIndex}`}>
                {line}
                {lineIndex < block.content.length - 1 && <br />}
              </React.Fragment>
            ))}
          </div>
        );
      }
    });

    return rendered;
  };

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
        'relative',
        name === 'ai' ? 'text-gray-800 mb-3 leading-relaxed' : 'text-sky-600 mb-1 leading-relaxed max-h-16',
        'font-bold',
      )}
      {...handlers}>
      <div className={classNames('pr-8', name === 'human' ? 'max-h-16 overflow-auto' : '')}>{messageItem}</div>
      {isVisible && type !== AskMessageType.CODE && (
        <CopyButton text={text} className="top-[-6px] right-1 bg-gray-100 hover:bg-gray-200" />
      )}
    </div>
  );
}

export default AskMessage;
