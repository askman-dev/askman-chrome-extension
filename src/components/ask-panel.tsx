import classNames from 'classnames';
import 'highlight.js/styles/default.min.css';
import { QuoteContext } from '../agents/quote';
import React, { useState, useContext, useEffect, useRef } from 'react';
import { ChatPopupContext } from '../chat/chat';
import ToolDropdown, { ToolsPromptInterface } from './ask-tooldropdown';
import TextareaAutosize from 'react-textarea-autosize';
import { XMarkIcon } from '@heroicons/react/20/solid';
import AskMessage from './ask-message';
import AskButton from './ask-button';

interface AskPanelProps extends React.HTMLAttributes<HTMLDivElement> {
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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const ToolBtn = (props: DomProps) => {
  return;
};

function AskPanel(props: AskPanelProps) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { code, visible, quotes, onHide, ...rest } = props;
  const chatContext = useContext(ChatPopupContext);
  const [userInput, setUserInput] = useState<string>('');
  const [askPanelVisible, setAskPanelVisible] = useState<boolean>(visible);
  //TODO 需要定义一个可渲染、可序列号的类型，疑似是 StoredMessage
  const [history, setHistory] = useState<{ name: string; type: string; text: string }[]>([]);
  const [initQuotes, setInitQuotes] = useState<Array<QuoteContext>>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const [userTools, setUserTools] = useState<ToolsPromptInterface>();

  // chat list ref
  // const chatListRef = useRef<HTMLDivElement>(null);

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
        'bg-white text-black text-left fixed border-1 border-solid border-gray-200 drop-shadow-lg text-sm rounded-lg w-[473px] min-w-80 max-w-lg min-h-[155px] p-4',
        `${askPanelVisible ? 'visible' : 'invisible'}`,
      )}
      {...rest}>
      <div className="font-medium rounded-lg bg-transparent bg-gradient-to-r from-white via-white to-white/60 mb-2 text-base flex justify-between">
        <span>
          Ask That Man{' '}
          <b className="bg-gray-100 rounded-md py-1 px-2 font-medium text-sm text-black text-opacity-50">
            快捷键 Command + I
          </b>
        </span>

        <div className="grow"></div>
        <span className="bg-gray-100 rounded-full p-1">
          <XMarkIcon
            className="w-4 h-4 text-gray-600 cursor-pointer"
            onClick={() => {
              setAskPanelVisible(false);
              onHide();
            }}
          />
        </span>
      </div>
      <div className="py-2 max-h-80 overflow-x-hidden overflow-y-auto mb-2">
        {history.map((message, index) => (
          <AskMessage
            key={index}
            // key={message.id}
            {...message}
          />
        ))}
      </div>

      <div className="user-tools relative w-full bg-cover bg-[50%_50%]">
        {userTools && (
          <div className="w-full relative flex-col justify-start items-start inline-flex text-left px-2 pb-2">
            <button
              className="bg-black text-white rounded-md py-0.5 px-2 cursor-pointer border-solid border-1 text-xs"
              title="点击删除"
              onClick={() => {
                setUserTools(null);
              }}>
              {userTools.name}
            </button>
          </div>
        )}

        {initQuotes.length > 0 && (
          <div className="quotes w-full relative flex-col justify-start items-start inline-flex text-left pb-3">
            {initQuotes.map((quote, index) => (
              <div className="border-l border-black w-full" key={index + '-' + quote}>
                <div className="text-black text-xs font-normal px-2 overflow-hidden whitespace-nowrap text-ellipsis max-h-[2.25rem] leading-[1.125rem] line-clamp-2">
                  引用 {quote.type == 'page' ? quote.pageTitle : quote?.selection}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="w-full overflow-hidden pr-2 mb-2">
          <TextareaAutosize
            ref={inputRef}
            maxRows={5}
            minRows={1}
            className="rounded border-solid border-1 border-gray outline-none rounded-md text-gray-800 text-sm w-full font-normal tracking-[0] leading-[normal] p-2 h-6 resize-none"
            onKeyDown={e => {
              // console.log('onKeyDown', e.key);
              if (e.key === 'Enter' && !e.shiftKey && !e.ctrlKey && !e.altKey) {
                if (e.nativeEvent instanceof KeyboardEvent && e.nativeEvent.isComposing) {
                  e.preventDefault();
                  return;
                }

                onSend();
                e.preventDefault();
              }
              // github 上面按 s 会触发页面搜索
              if (e.key.match(/^[a-z/\\]$/) && !e.shiftKey && !e.ctrlKey && !e.altKey) e.stopPropagation();
            }}
            onChange={e => {
              setUserInput(e.currentTarget.value);
              e.preventDefault();
            }}
            value={userInput}
            placeholder="请输入问题或要求"></TextareaAutosize>
        </div>
        <div className="w-full h-34 flex">
          <ToolDropdown
            className="right-[100px] mt-[1px] text-right"
            onItemClick={item => {
              setUserTools(item);
            }}
          />
          <AskButton
            primary
            disabled={!(userInput || initQuotes.length)}
            onClick={onSend}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey && !e.ctrlKey && !e.altKey) {
                e.preventDefault();
                onSend();
              }
            }}>
            发送
          </AskButton>
          <div className="grow"></div>
        </div>
      </div>
    </div>
  );
}

export default AskPanel;
