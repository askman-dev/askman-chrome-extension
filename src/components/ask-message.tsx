import classNames from 'classnames';
import AskCode from './ask-code';
import { QuoteAgent } from '../agents/quote';
import React, { useState } from 'react';

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
          className="bg-gray-100 border-l-4 border-blue-500 p-2 mr-4 mb-2 overflow-hidden whitespace-nowrap text-ellipsis">
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
        <div key={`text-${index}`} className="">
          {block.content.map((line, lineIndex) => (
            <React.Fragment key={`line-${lineIndex}`}>
              {line}
              {lineIndex < block.content.length - 1 && (
                <>
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

const CopyButton = ({ text }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // 2秒后恢复
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="absolute top-0 right-1 p-2 rounded bg-gray-100 hover:bg-gray-200 transition-all duration-300 opacity-50 hover:opacity-100 z-10"
      aria-label={copied ? "Copied" : "Copy content"}
    >
      {copied ? (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-sky-600" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
          <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
        </svg>
      )}
    </button>
  );
};

function AskMessage(props: AskMessageItem) {
  const { type, text, name } = props;
  const [showCopyButton, setShowCopyButton] = useState(false);
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
        'relative',
        name === 'ai' ? 'text-gray-800 mb-3 leading-relaxed' : 'text-sky-600 mb-1 leading-relaxed max-h-16',
        'font-bold',
      )}
      onMouseEnter={() => setShowCopyButton(true)}
      onMouseLeave={() => setShowCopyButton(false)}
    >
      <div className="pr-8 max-h-16 overflow-auto">
        {messageItem}
      </div>
      {showCopyButton && <CopyButton text={text} />}
    </div>
  );
}

export default AskMessage;
