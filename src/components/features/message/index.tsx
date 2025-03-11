import React, { useState } from 'react';
import classNames from 'classnames';
import { CodeBlock } from '@src/components/features/message/CodeBlock';
import { QuoteAgent } from '@src/agents/quote';
import CopyButton, { useCopyButton } from '@src/components/common/CopyButton';
import { SCROLLBAR_STYLES_THIN_X } from '@src/styles/common';

/* eslint-disable no-unused-vars */
export enum MessageType {
  TEXT = 'text',
  IMAGE = 'image',
  CODE = 'code',
}

export interface MessageItemProps {
  type: MessageType | string;
  text: string;
  role?: string;
  id?: string;
}

function decodeEntities(text: string): string {
  const textArea = document.createElement('textarea');
  textArea.innerHTML = text;
  return textArea.value;
}

export function MessageItem(props: MessageItemProps) {
  const { type, text, role } = props;
  const [codeHover, setCodeHover] = useState<number | null>(null);
  const { isVisible, handlers } = useCopyButton(type !== MessageType.CODE);
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
            {block.content.map((line, lineIndex) => {
              // 解码 HTML 实体
              const decodedLine = decodeEntities(line);
              return (
                <React.Fragment key={`line-${lineIndex}`}>
                  {decodedLine}
                  {lineIndex < block.content.length - 1 && <br />}
                </React.Fragment>
              );
            })}
          </div>
        );
      }
    });

    return rendered;
  };

  // 根据不同的类型，渲染不同的内容
  switch (type) {
    case MessageType.TEXT:
      messageItem = <>{TextWithLineBreaks(text)}</>;
      break;
    case MessageType.CODE:
      messageItem = <CodeBlock code={text} />;
      break;
    default:
      break;
  }

  return (
    <div
      className={classNames(
        'relative',
        role === 'assistant'
          ? 'text-black mb-3 leading-relaxed text-base font-medium'
          : 'text-sky-600 mb-1 leading-relaxed max-h-16  text-base font-medium',
      )}
      {...handlers}>
      <div className={classNames('pr-8', role === 'user' ? `max-h-16 ${SCROLLBAR_STYLES_THIN_X}` : '')}>
        {messageItem}
      </div>
      {isVisible && type !== MessageType.CODE && (
        <CopyButton text={text} className="top-[-6px] right-1 bg-gray-100 hover:bg-gray-200" />
      )}
    </div>
  );
}

// 为了兼容性，保留旧的枚举名称
export const AskMessageType = MessageType;

export default MessageItem;
