import classNames from 'classnames';

import Highlight from 'react-highlight';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { QuoteContext } from '../agents/quote';
import React, { useState, useContext, useEffect } from 'react';
import { ChatPopupContext } from '../chat/chat';

interface IAskPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  code: string;
  visible?: boolean;
  quotes?: Array<Promise<QuoteContext>>;
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

export const Send = ({ status, className, divClassName, text = '解释 ↵', onClick }: DomProps): JSX.Element => {
  return (
    <button
      className={classNames(
        `relative w-[69px] h-[25px]  rounded-[5px] border-solid border-black ${className}`,
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
      <span
        className={`absolute top-[2px] left-[10px] text-white text-[14px] text-right tracking-[0] leading-[normal] ${divClassName}`}>
        {text}
      </span>
    </button>
  );
};
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const ToolBtn = ({ className, iconChevronBottom, iconChevronBottomClassName }: DomProps) => {
  return (
    <div className={`${className}`}>
      <div>工具</div>
    </div>
  );
};

interface CancelProps {
  className: string;
}
const Cancel = ({ className }: CancelProps): JSX.Element => {
  return (
    <div className={classNames(`relative w-[24px] h-[15px] ${className}`)}>
      <div className="absolute -top-px left-0 [text-shadow:0px_4px_4px_#00000040] [font-family:'Inter-Regular',Helvetica] font-normal text-[#0000008c] text-[12px] text-right tracking-[0] leading-[normal]">
        隐藏
      </div>
    </div>
  );
};

function AskPanel(props: IAskPanelProps) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { code, visible, quotes, ...rest } = props;
  const chatContext = useContext(ChatPopupContext);
  const [userInput, setUserInput] = useState<string>('');
  //TODO 需要定义一个可渲染、可序列号的类型，疑似是 StoredMessage
  const [history, setHistory] = useState<{ name: string; type: 'text' | 'image'; text: string }[]>([]);
  const [initQuotes, setInitQuotes] = useState<Array<QuoteContext>>([]);

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
    //TODO fixbug 这里希望清空数组，实际上没有作用
    return () => {
      setInitQuotes([]);
    };
  }, [quotes]);

  useEffect(() => {
    console.log('chatContext.history = ' + JSON.stringify(chatContext.history));
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
    chatContext.setOnDataListener(data => {
      console.log(data);
      rerenderHistory();
    });
    rerenderHistory();
    return () => {
      console.log('移除消息回调');
      chatContext.removeOnDataListener();
    };
  }, []);

  function onSend() {
    chatContext.askWithQuotes(initQuotes!, userInput);
    setUserInput('');
    setInitQuotes([]);
  }

  // myObject.test('你是谁');
  console.log('history = ' + JSON.stringify(history));
  return (
    <div
      className={classNames(
        'bg-white fixed overflow-hidden border-2 border-solid rounded-md w-[473px] min-w-80 max-w-lg min-h-[155px]',
        `${visible ? 'visible' : 'invisible'}`,
      )}
      {...rest}>
      <div className="font-semibold absolute w-full bg-white opacity-60 text-sm bg-white px-3 py-2">
        Ask That Man <Cancel className="!absolute !left-[433px] !top-[11px]" />
      </div>
      <div className="px-3 py-10 max-h-80 overflow-auto">
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

      <div className="relative w-full bg-[url(/layout.png)] bg-cover bg-[50%_50%]">
        <div className="w-full relative flex-col justify-start items-start inline-flex text-left px-2">
          {initQuotes &&
            initQuotes.map((quote, index) => (
              <div className="border-l border-black w-full" key={index + '-' + quote}>
                <div className="text-black text-xs font-normal px-2 overflow-hidden whitespace-nowrap text-ellipsis max-h-[2.25rem] leading-[1.125rem] line-clamp-2">
                  {quote?.selection}
                </div>
              </div>
            ))}
        </div>
        <div className="w-full h-[68px] overflow-hidden p-3">
          <textarea
            className="rounded border-solid border border-b border-[#0000004c] rounded-[5px] text-[#00000095] text-[14px] w-full h-full font-normal tracking-[0] leading-[normal] p-1 min-h-1.25"
            onKeyDown={e => {
              console.log('onKeyDown', e.key);
              if (e.key === 'Enter' && !e.shiftKey && !e.ctrlKey && !e.altKey) {
                e.preventDefault();
                onSend();
              }
            }}
            onChange={e => {
              setUserInput(e.currentTarget.value);
            }}
            value={userInput}
            placeholder="请输入问题或要求"></textarea>
        </div>
        <div className="w-full h-25">
          <Send
            status={userInput || initQuotes.length ? 'ready' : 'disabled'}
            className="float-right !border-[unset] cursor-pointer"
            divClassName="!left-[11px] !top-[3px]"
            text="发送 ↵"
            onClick={onSend}
          />
          <ToolBtn
            className="float-right"
            iconChevronBottom="image.png"
            iconChevronBottomClassName="!left-[40px] !top-[9px]"
          />
        </div>
      </div>
    </div>
  );
}

export default AskPanel;
