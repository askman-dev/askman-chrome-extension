import classNames from 'classnames';

import Highlight from 'react-highlight';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { QuoteContext } from '../agents/quote';
import React, { useState, useContext, useEffect, useRef } from 'react';
import { ChatPopupContext } from '../chat/chat';
import ToolDropdown, { ToolsPromptInterface } from './ask-tooldropdown';
import TextareaAutosize from 'react-textarea-autosize';

interface IAskPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  code: string;
  visible?: boolean;
  quotes?: Array<Promise<QuoteContext>>;
  onHide?: () => void;
}
interface DomProps {
  status?: 'ready' | 'disabled' | 'loading';
  className?: string;
  divClassName?: string;
  text?: string;
  iconChevronBottom?: string;
  iconChevronBottomClassName?: string;
  onClick?: () => void;
}

export const Send = ({ status, className, text = '解释', onClick }: DomProps): JSX.Element => {
  return (
    <button
      className={classNames(
        `relative w-[69px] rounded-md font-medium border-solid border-black border-1 px-2 py-1 text-white text-xs ${className}`,
        `${status == 'disabled' ? 'cursor-not-allowed' : 'cursor-pointer'}`,
        `${status == 'disabled' ? 'bg-[#CFCFCF] border-[#CFCFCF]' : 'bg-black border'}`,
      )}
      onClick={() => onClick()}
      onKeyDown={e => {
        if (e.key === 'Enter' && !e.shiftKey && !e.ctrlKey && !e.altKey) {
          e.preventDefault();
          onClick();
        }
      }}>
      {text} ↵
    </button>
  );
};
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const ToolBtn = (props: DomProps) => {
  return;
};

interface CancelProps {
  className: string;
  onClick: () => void;
}
const Cancel = ({ className, onClick }: CancelProps): JSX.Element => {
  return (
    <div className={classNames(`relative w-[24px] h-[15px] ${className}`)}>
      <button
        className="absolute -top-px left-0 [text-shadow:0px_4px_4px_#00000040] [font-family:'Inter-Regular',Helvetica] font-normal text-[#0000008c] text-[12px] text-right tracking-[0] leading-[normal]"
        onClick={onClick}>
        隐藏
      </button>
    </div>
  );
};

function AskPanel(props: IAskPanelProps) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { code, visible, quotes, onHide, ...rest } = props;
  const chatContext = useContext(ChatPopupContext);
  const [userInput, setUserInput] = useState<string>('');
  const [askPanelVisible, setAskPanelVisible] = useState<boolean>(visible);
  //TODO 需要定义一个可渲染、可序列号的类型，疑似是 StoredMessage
  const [history, setHistory] = useState<{ name: string; type: 'text' | 'image'; text: string }[]>([]);
  const [initQuotes, setInitQuotes] = useState<Array<QuoteContext>>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const [userTools, setUserTools] = useState<ToolsPromptInterface>();
  useEffect(() => {
    quotes.forEach(quote => {
      quote
        .then(quoteContext => {
          setInitQuotes([...initQuotes, quoteContext]);
        })
        .catch(error => {
          console.error(error);
        });
    });
    return () => {
      setInitQuotes([]);
    };
  }, [quotes]);

  useEffect(() => {
    // console.log('chatContext.history = ' + JSON.stringify(chatContext.history));
    function rerenderHistory() {
      setHistory(
        chatContext.history.map(message => {
          if (typeof message.content == 'string') {
            return { type: 'text', text: message.content, name: message.name };
          } else if (message.content instanceof Array) {
            //TODO 怎么约束 message 是 MessageContentComplex[] 类型？
            return {
              type: 'text',
              name: message.name,
              text: message.content.reduce((acc, cur) => {
                if (cur.type == 'text') {
                  return acc + '\n' + cur.text;
                } else if (cur.type == 'image_url') {
                  return acc + '\n' + cur.image_url;
                } else {
                  return acc + '\n<unknown>';
                }
              }, ''),
            };
          }
        }),
      );
    }

    console.log('注册消息回调');
    chatContext.setOnDataListener(() => {
      // console.log(data);
      rerenderHistory();
    });
    rerenderHistory();

    askPanelVisible &&
      setTimeout(() => {
        console.log('获取焦点');
        inputRef.current.focus();
      }, 200);

    return () => {
      console.log('移除消息回调');
      chatContext.removeOnDataListener();
    };
  }, []);

  function onSend() {
    if (userTools) {
      chatContext.askWithTool(userTools, initQuotes, userInput);
    } else {
      chatContext.askWithQuotes(initQuotes!, userInput);
    }
    setUserTools(null);
    setUserInput('');
    setInitQuotes([]);
  }

  // myObject.test('你是谁');
  // console.log('history = ' + JSON.stringify(history));
  return (
    <div
      className={classNames(
        'bg-white fixed border-1 border-solid border-gray-100 drop-shadow-lg text-sm rounded-lg w-[473px] min-w-80 max-w-lg min-h-[155px]',
        `${askPanelVisible ? 'visible' : 'invisible'}`,
      )}
      {...rest}>
      <div className="font-semibold absolute rounded-lg bg-transparent bg-gradient-to-r from-white via-white to-white/60 w-full text-sm px-3 py-2">
        Ask That Man{' '}
        <Cancel
          className="!absolute !left-[433px] !top-[11px]"
          onClick={() => {
            setAskPanelVisible(false);
            onHide();
          }}
        />
      </div>
      <div className="px-3 py-10 max-h-80 overflow-x-hidden overflow-y-auto mb-2">
        {history.map((message, index) => (
          <div
            key={index}
            className={classNames(
              'text-sm font-normal px-2 leading-[1.125rem]',
              message.name == 'human' ? 'text-sky-700 text-opacity-90' : 'text-black',
              message.name == 'human' ? 'mb-2' : 'mb-4',
            )}>
            {message.text}
          </div>
        ))}
        <Highlight>{code}</Highlight>
      </div>

      <div className="user-tools relative w-full bg-cover pb-2 bg-[50%_50%]">
        {userTools && (
          <div className="w-full relative flex-col justify-start items-start inline-flex text-left px-2 pb-2">
            <button
              className="bg-black text-white rounded-md py-0.5 px-2 border-solid border-1 text-xs"
              title="点击删除"
              onClick={() => {
                setUserTools(null);
              }}>
              {userTools.name}
            </button>
          </div>
        )}

        {initQuotes.length > 0 && (
          <div className="quotes w-full relative flex-col justify-start items-start inline-flex text-left px-2 pb-3">
            {initQuotes.map((quote, index) => (
              <div className="border-l border-black w-full" key={index + '-' + quote}>
                <div className="text-black text-xs font-normal px-2 overflow-hidden whitespace-nowrap text-ellipsis max-h-[2.25rem] leading-[1.125rem] line-clamp-2">
                  引用 {quote.type == 'page' ? quote.pageTitle : quote?.selection}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="w-full overflow-hidden pl-2 pr-2 mb-2">
          <TextareaAutosize
            ref={inputRef}
            maxRows={5}
            minRows={1}
            className="rounded border-solid border-1 border-gray outline-none rounded-md text-gray-800 text-sm w-full font-normal tracking-[0] leading-[normal] p-2 h-6 resize-none"
            onKeyDown={e => {
              // console.log('onKeyDown', e.key);
              if (e.key === 'Enter' && !e.shiftKey && !e.ctrlKey && !e.altKey) {
                onSend();
              }
              // github 上面按 s 会触发页面搜索
              if (e.key === 's') e.preventDefault();
            }}
            onChange={e => {
              setUserInput(e.currentTarget.value);
              e.preventDefault();
            }}
            value={userInput}
            placeholder="请输入问题或要求"></TextareaAutosize>
        </div>
        <div className="w-full h-34 flex">
          <div className="grow"></div>
          <ToolDropdown
            className="right-[100px] mt-[1px] text-right"
            onItemClick={item => {
              setUserTools(item);
            }}
          />
          <Send
            status={userInput || initQuotes.length ? 'ready' : 'disabled'}
            className="cursor-pointer"
            text="发送"
            onClick={onSend}
          />
          <div className="w-2"></div>
        </div>
      </div>
    </div>
  );
}

export default AskPanel;
