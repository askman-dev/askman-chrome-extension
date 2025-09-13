import React, { useState } from 'react';
import classNames from 'classnames';
import { CodeBlock } from '@src/components/message/CodeBlock';
import { QuoteAgent } from '@src/agents/quote';
import CopyButton, { useCopyButton } from '@src/components/common/CopyButton';
import { ThinkingAnimation } from '@src/components/ui/ThinkingAnimation';
import { SCROLLBAR_STYLES_THIN_X } from '@src/styles/common';

/* eslint-disable no-unused-vars */
export enum MessageType {
  TEXT = 'text',
  IMAGE = 'image',
  CODE = 'code',
  THINKING = 'thinking',
  REASONING = 'reasoning',
  TOOL_PENDING = 'tool_pending',
  TOOL_EXECUTING = 'tool_executing',
  TOOL_RESULT = 'tool_result',
}

export interface MessageItemProps {
  type: MessageType | string;
  text: string;
  role?: string;
  id?: string;
  reasoning?: string;
  content?: string;
  hasReasoning?: boolean;
  hasContent?: boolean;
  // Tool progress properties
  toolName?: string;
  toolArgs?: any;
  result?: any;
}

function decodeEntities(text: string): string {
  const textArea = document.createElement('textarea');
  textArea.innerHTML = text;
  return textArea.value;
}

export function MessageItem(props: MessageItemProps) {
  const { type, text, role, reasoning, content, hasReasoning, hasContent, toolName, toolArgs, result } = props;
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
            <span className="font-bold mr-2">{block.content}</span>
          </div>
        );
      } else if (
        block.type === 'reference' ||
        block.type === 'webpage_content' ||
        block.type === 'content' ||
        block.type === 'title' ||
        block.type === 'url' ||
        block.type === 'selection'
      ) {
        return (
          <div key={`reference-${index}`} className="inline-flex relative mr-2">
            <span
              className="rounded-md p-1 bg-gray-100 text-gray-700 text-sm hover:bg-gray-200 cursor-pointer"
              title={block.content}>
              {block.type}
            </span>
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
              <code>{block.content}</code>
            </pre>
            {codeHover === index && (
              <CopyButton text={block.content} className="top-2 right-2 bg-white hover:bg-gray-100" />
            )}
          </div>
        );
      } else {
        return (
          <div key={`text-${index}`}>
            {block.content
              .trim()
              .split('\n')
              .map((line, lineIndex, lines) => {
                // 解码 HTML 实体
                const decodedLine = decodeEntities(line);
                return (
                  <React.Fragment key={`line-${lineIndex}`}>
                    {decodedLine}
                    {lineIndex < lines.length - 1 && <br />}
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
    case MessageType.THINKING:
      messageItem = <ThinkingAnimation className="my-2" />;
      break;
    case MessageType.REASONING:
      messageItem = (
        <div>
          {hasReasoning && (
            <div className="text-gray-500 italic mb-2 text-sm font-normal">
              <style>
                {`
                  .reasoning-content > div:first-child::before {
                    content: "Reasoning: ";
                  }
                `}
              </style>
              <div className="reasoning-content">{TextWithLineBreaks(reasoning)}</div>
            </div>
          )}
          {hasContent && <div className="text-black border-t border-gray-200 pt-2">{TextWithLineBreaks(content)}</div>}
          {!hasReasoning && !hasContent && <div>{TextWithLineBreaks(text)}</div>}
        </div>
      );
      break;
    case MessageType.TOOL_PENDING:
      messageItem = (
        <div className="flex items-center gap-2 text-gray-600 py-1">
          <span className="animate-pulse text-lg">⚙️</span>
          <span className="text-sm">准备执行工具: <span className="font-medium">{toolName}</span></span>
        </div>
      );
      break;
    case MessageType.TOOL_EXECUTING:
      messageItem = (
        <div className="flex items-center gap-2 text-blue-600 py-1">
          <span className="animate-spin text-lg">⚙️</span>
          <span className="text-sm">执行中: <span className="font-medium">{toolName}</span></span>
        </div>
      );
      break;
    case MessageType.TOOL_RESULT:
      messageItem = (
        <details className="bg-gray-50 border border-gray-200 rounded-lg p-3 my-2">
          <summary className="cursor-pointer text-green-600 font-medium hover:text-green-700 flex items-center gap-2">
            <span>✅</span>
            <span>{toolName} 执行完成</span>
            <span className="text-xs text-gray-500 ml-auto">点击查看详情</span>
          </summary>
          <div className="mt-3 pt-3 border-t border-gray-200">
            <pre className="text-xs text-gray-700 bg-white p-2 rounded border overflow-auto max-h-40">
              {typeof result === 'string' ? result : JSON.stringify(result, null, 2)}
            </pre>
          </div>
        </details>
      );
      break;
    default:
      messageItem = <>{TextWithLineBreaks(text)}</>;
      break;
  }

  return (
    <div
      className={classNames(
        'relative',
        role === 'assistant'
          ? 'text-black mb-2 leading-relaxed text-base font-medium'
          : 'text-sky-600 mb-1 leading-relaxed max-h-32  text-base font-medium',
      )}
      {...handlers}>
      <div className={classNames('pr-8', role === 'user' ? `max-h-32 ${SCROLLBAR_STYLES_THIN_X}` : '')}>
        {messageItem}
      </div>
      {isVisible && type !== MessageType.CODE && type !== MessageType.THINKING && type !== 'thinking' && (
        <CopyButton text={text} className="top-[-6px] right-1 bg-gray-100 hover:bg-gray-200" />
      )}
    </div>
  );
}

// 为了兼容性，保留旧的枚举名称
export const AskMessageType = MessageType;

export default MessageItem;
