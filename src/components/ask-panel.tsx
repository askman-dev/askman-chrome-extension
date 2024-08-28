import classNames from 'classnames';
import 'highlight.js/styles/default.min.css';
import { QuoteContext } from '../agents/quote';
import React, { useState, useContext, useEffect, useRef } from 'react';
import { ChatPopupContext } from '../chat/chat';
import ToolDropdown from './ask-tooldropdown';
import TextareaAutosize from 'react-textarea-autosize';
import { XMarkIcon } from '@heroicons/react/20/solid';
import AskMessage from './ask-message';
import AskButton from './ask-button';
import { ToolsPromptInterface, AIInvisibleMessage, HumanInvisibleMessage, HumanAskMessage } from '../types';
import QuoteDropdown from './ask-quotedropdown';
import KeyBinding from './icons';

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
  const [history, setHistory] = useState<{ id: string; name: string; type: string; text: string }[]>([]);
  const [initQuotes, setInitQuotes] = useState<Array<QuoteContext>>([]);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null); // Add this line

  const [userTools, setUserTools] = useState<ToolsPromptInterface>();
  const [isToolDropdownOpen, setIsToolDropdownOpen] = useState(false);
  const [isQuoteDropdownOpen, setIsQuoteDropdownOpen] = useState(false);
  const showToolDropdown = () => {
    setIsToolDropdownOpen(true);
    setIsQuoteDropdownOpen(false);
  };
  const showQuoteDropdown = () => {
    setIsQuoteDropdownOpen(true);
    setIsToolDropdownOpen(false);
  };
  // chat list ref
  // const chatListRef = useRef<HTMLDivElement>(null);

  const [lastKPressTime, setLastKPressTime] = useState<number | null>(null);

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
        chatContext.history
          .filter(message => !(message instanceof HumanInvisibleMessage || message instanceof AIInvisibleMessage))
          .map((message, idx) => {
            if (message instanceof HumanAskMessage) {
              return { type: 'text', id: `history-${idx}`, text: message.rendered, name: message.name };
            } else if (typeof message.content == 'string') {
              return { type: 'text', id: `history-${idx}`, text: message.content, name: message.name };
            } else if (message.content instanceof Array) {
              //TODO 怎么约束 message 是 MessageContentComplex[] 类型？
              return {
                type: 'text',
                id: `history-${idx}`,
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
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // 检测 ESC 键
      if (e.key === 'Escape') {
        if (isQuoteDropdownOpen) {
          setIsQuoteDropdownOpen(false);
          e.preventDefault();
          e.stopPropagation();
          return;
        }
        if (isToolDropdownOpen) {
          setIsToolDropdownOpen(false);
          e.preventDefault();
          e.stopPropagation();
          return;
        }
      }

      // 检测 Command+K (Mac) 或 Ctrl+K (Windows/Linux)
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();

        // 使用一个计时器来检测是否是双击 K
        if (lastKPressTime && Date.now() - lastKPressTime < 300) {
          // 双击 K，触发 QuoteDropdown
          showQuoteDropdown();
        } else {
          if (isToolDropdownOpen) {
            showQuoteDropdown();
          } else {
            // 单击 K，触发 ToolDropdown
            showToolDropdown();
          }
        }

        setLastKPressTime(Date.now());
        return;
      }

      // 检测左右方向键
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        if (isToolDropdownOpen || isQuoteDropdownOpen) {
          e.preventDefault();
          e.stopPropagation();
          if (isToolDropdownOpen) {
            setIsToolDropdownOpen(false);
            setIsQuoteDropdownOpen(true);
          } else {
            setIsQuoteDropdownOpen(false);
            setIsToolDropdownOpen(true);
          }
          return;
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isToolDropdownOpen, isQuoteDropdownOpen, lastKPressTime]);

  // Add this new useEffect to focus on input when menus are closed
  useEffect(() => {
    if (!isToolDropdownOpen && !isQuoteDropdownOpen && inputRef.current) {
      setTimeout(() => {
        inputRef.current.focus();
      }, 33);
    }
  }, [isToolDropdownOpen, isQuoteDropdownOpen]);

  function onSend() {
    if (userTools) {
      chatContext.askWithTool(userTools, initQuotes, userInput.trim());
    } else {
      chatContext.askWithQuotes(initQuotes!, userInput.trim());
    }
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
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
          Ask That Man <KeyBinding text="⌘ I"></KeyBinding>
        </span>

        <div className="grow"></div>
        <button
          className="bg-gray-100 text-gray-600 rounded-full p-1 hover:bg-black hover:text-white"
          onClick={() => {
            setAskPanelVisible(false);
            onHide();
          }}>
          <XMarkIcon className="w-4 h-4 cursor-pointer" />
        </button>
      </div>
      <div className="py-2 max-h-80 overflow-x-hidden overflow-y-auto mb-2">
        {history.map(message => (
          <AskMessage key={message.id} {...message} />
        ))}

        {history.length > 0 && (
          <div className="pt-64">
            <footer ref={messagesEndRef} />
          </div>
        )}
      </div>
      {/* inputs area */}
      <div className="">
        <ToolDropdown
          isOpen={isToolDropdownOpen}
          setIsOpen={setIsToolDropdownOpen}
          className="left-[100px] inline-block"
          onItemClick={item => {
            setUserTools(item);
          }}
        />

        <QuoteDropdown
          isOpen={isQuoteDropdownOpen}
          setIsOpen={setIsQuoteDropdownOpen}
          className="left-[100px] inline-block"
          onItemClick={item => {
            setUserTools(item);
          }}
        />
      </div>
      <div className="user-tools relative w-full bg-cover bg-[50%_50%]">
        {userTools && (
          <div className="w-full relative flex-col justify-start items-start inline-flex text-left pb-2">
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

        <div className="w-full pr-2 mb-2 p-1 rounded-md border-solid border-1 border-gray ">
          <div className="">
            {initQuotes.length > 0 && (
              <div className="quotes relative flex-col justify-start items-start inline-flex pb-3">
                {initQuotes.map((quote, index) => (
                  <div className="border-l border-black w-full flex items-center" key={index + '-' + quote}>
                    <div className="text-black text-xs font-normal px-2 overflow-hidden whitespace-nowrap text-ellipsis max-h-[2.25rem] leading-[1.125rem] line-clamp-2">
                      {quote.type == 'page' ? 'PageTitle ' : 'Selection '}
                    </div>
                    <button
                      title="点击删除 开发中"
                      className="bg-gray-100 text-gray-600 rounded-full h-4 mt-0.5 hover:bg-black hover:text-white"
                      onClick={() => {
                        // alert("没实现")
                      }}>
                      <XMarkIcon className="w-4 h-4 cursor-pointer" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="flex">
            <TextareaAutosize
              ref={inputRef}
              maxRows={5}
              minRows={1}
              className="flex-grow outline-none text-gray-800 text-sm inline-block font-normal tracking-[0] leading-[normal] p-2 h-6 resize-none 
              focus:border-black"
              //TODO 输入在有字/无字时会发生高度变化，需要修复
              onKeyDown={e => {
                // 检测 ESC 键
                if (e.key === 'Escape') {
                  if (isQuoteDropdownOpen || isToolDropdownOpen) {
                    e.preventDefault();
                    return;
                  }
                }
                // 检测 Command+K (Mac) 或 Ctrl+K (Windows/Linux)
                if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                  e.preventDefault();
                  return;
                }

                // 现有的 Enter 键逻辑
                if (e.key === 'Enter' && !e.shiftKey && !e.ctrlKey && !e.altKey) {
                  if (e.nativeEvent instanceof KeyboardEvent && e.nativeEvent.isComposing) {
                    e.preventDefault();
                    return;
                  }

                  if (isToolDropdownOpen) {
                    // 如果 Tool 下拉菜单打开，确认选择并关闭菜单
                    setIsToolDropdownOpen(false);
                  } else if (isQuoteDropdownOpen) {
                    // 如果 Quote 下拉菜单打开，确认选择并关闭菜单
                    setIsQuoteDropdownOpen(false);
                  } else {
                    // 如果没有下拉菜单打开，发送消息
                    onSend();
                  }

                  e.preventDefault();
                }
                // 检测左右方向键
                if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
                  if (isToolDropdownOpen || isQuoteDropdownOpen) {
                    e.preventDefault();
                    e.stopPropagation();
                    if (isToolDropdownOpen) {
                      setIsToolDropdownOpen(false);
                      setIsQuoteDropdownOpen(true);
                    } else {
                      setIsQuoteDropdownOpen(false);
                      setIsToolDropdownOpen(true);
                    }
                    return;
                  }
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
              ➔
            </AskButton>
          </div>
        </div>
        <div className="w-full h-34 flex">
          <div className="grow"></div>
        </div>
      </div>
    </div>
  );
}

export default AskPanel;
