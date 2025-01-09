import classNames from 'classnames';
import 'highlight.js/styles/default.min.css';
import { QuoteAgent, QuoteContext } from '../agents/quote';
import React, { useState, useContext, useEffect, useRef, useCallback } from 'react';
import { ChatPopupContext } from '../chat/chat';
import ToolDropdown from './ask-tooldropdown';
import ModelDropdown from './ask/ModelDropDown';
import TextareaAutosize from 'react-textarea-autosize';
import { ArrowsPointingInIcon, ArrowsPointingOutIcon, XMarkIcon } from '@heroicons/react/20/solid';
import AskMessage from './ask-message';
import AskButton from './ask-button';
import {
  ToolsPromptInterface,
  AIInvisibleMessage,
  HumanInvisibleMessage,
  HumanAskMessage,
  SystemInvisibleMessage,
  CommandType,
} from '../types';
import QuoteDropdown from './ask-quotedropdown';
import KeyBinding from './icons';
import configStorage from '../shared/storages/configStorage';

interface AskPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  code: string;
  visible?: boolean;
  quotes?: Array<Promise<QuoteContext>>;
  onHide?: () => void;
}
// interface DomProps {
//   status?: 'ready' | 'disabled' | 'loading';
//   className?: string;
//   divClassName?: string;
//   text?: string;
//   iconChevronBottom?: string;
//   iconChevronBottomClassName?: string;
//   onClick?: () => void;
// }

function AskPanel(props: AskPanelProps) {
  const { visible, quotes, onHide, ...rest } = props;
  const [isMaximized, setIsMaximized] = useState(false);

  const getTruncatedContent = (quote: QuoteContext): string => {
    const content = quote.selection || quote.pageContent || quote.text || quote.pageTitle || quote.pageUrl || quote.name || quote.type || 'Quote';
    return content.length > 50 ? content.slice(0, 50) + '...' : content;
  };

  const panelRef = useRef<HTMLDivElement>(null);
  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
      setIsToolDropdownOpen(false);
      // setIsQuoteDropdownOpen(false);
      setIsModelDropdownOpen(false);
    }
  }, []);

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [handleClickOutside]);

  const chatContext = useContext(ChatPopupContext);
  const [userInput, setUserInput] = useState<string>('');
  const [askPanelVisible, setAskPanelVisible] = useState<boolean>(visible);
  //TODO 需要定义一个可渲染、可序列号的类型，疑似是 StoredMessage
  const [history, setHistory] = useState<{ id: string; name: string; type: string; text: string }[]>([]);
  const [initQuotes, setInitQuotes] = useState<Array<QuoteContext>>([]);
  const [pageContext, setPageContext] = useState<QuoteContext>(new QuoteContext());
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null); // Add this line

  const [userTools, setUserTools] = useState<ToolsPromptInterface>();
  const [isToolDropdownOpen, setIsToolDropdownOpen] = useState(false);
  const [isQuoteDropdownOpen, setIsQuoteDropdownOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState('free'); // 添加状态来跟踪选中的模型
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ left: 0, top: 0 });
  const [hoveredQuoteIndex, setHoveredQuoteIndex] = useState<number | null>(null);

  const showToolDropdown = () => {
    // toolButtonRef.current?.click();
    console.log('isToolDropdownOpen = ' + isToolDropdownOpen, 'set to true');
    setIsToolDropdownOpen(true);
    setIsQuoteDropdownOpen(false);
    setIsModelDropdownOpen(false);
  };
  const showQuoteDropdown = () => {
    setIsQuoteDropdownOpen(true);
    setIsToolDropdownOpen(false);
    setIsModelDropdownOpen(false);
  };
  const showModelDropdown = () => {
    setIsModelDropdownOpen(true);
    setIsToolDropdownOpen(false);
    setIsQuoteDropdownOpen(false);
  };
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

  const updatePageContext = (quoteContext: QuoteContext) => {
    setPageContext({
      ...pageContext,
      ...quoteContext,
      type: 'page',
    });
  };

  const updateToolDropdownStatus = (status: boolean) => {
    setIsToolDropdownOpen(status);
  };
  const updateModelDropdownStatus = (status: boolean) => {
    setIsModelDropdownOpen(status);
  };
  const updateQuoteDropdownStatus = (status: boolean) => {
    setIsQuoteDropdownOpen(status);
  };

  useEffect(() => {
    QuoteAgent.getQuoteByDocument(window.location.href, document).then(quoteContext => {
      updatePageContext(quoteContext);
    });
    // console.log('chatContext.history = ' + JSON.stringify(chatContext.history));
    function rerenderHistory() {
      setHistory(
        chatContext.history
          .filter(
            message =>
              !(
                message instanceof HumanInvisibleMessage ||
                message instanceof AIInvisibleMessage ||
                message instanceof SystemInvisibleMessage
              ),
          )
          .map((message, idx) => {
            if (message instanceof HumanAskMessage) {
              return { type: 'text', id: `history-${idx}`, text: message.rendered, name: message.name };
            } else if (typeof message.content == 'string') {
              return { type: 'text', id: `history-${idx}`, text: message.content, name: message.name };
            } else if (message.content instanceof Array) {
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

    // console.log('注册消息回调');
    chatContext.setOnDataListener(() => {
      // console.log(data);
      rerenderHistory();
    });
    rerenderHistory();

    askPanelVisible &&
      setTimeout(() => {
        // console.log('获取焦点');
        inputRef.current.focus();
      }, 200);

    return () => {
      // console.log('移除消息回调');
      chatContext.removeOnDataListener();
    };
  }, []);
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // 检测 Command+K (Mac) 或 Ctrl+K (Windows/Linux)
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        // e.preventDefault();
        if (!isToolDropdownOpen) {
          showToolDropdown();
        } else if (isToolDropdownOpen) {
          showModelDropdown();
        }

        e.stopPropagation();
        return;
      }

      // 检测左右方向键
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        // console.log('[ask-panel] listened key press, arrow left or right', e.target, e.currentTarget);
        if (isToolDropdownOpen || isModelDropdownOpen) {
          e.preventDefault();
          e.stopPropagation();
          if (isToolDropdownOpen && e.key === 'ArrowRight') {
            showModelDropdown();
          } else if (isModelDropdownOpen && e.key === 'ArrowRight') {
            showToolDropdown();
          } else if (isToolDropdownOpen && e.key === 'ArrowLeft') {
            showModelDropdown();
          } else if (isModelDropdownOpen && e.key === 'ArrowLeft') {
            showToolDropdown();
          }
          return;
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isToolDropdownOpen, isQuoteDropdownOpen, isModelDropdownOpen]);

  // Add this new useEffect to focus on input when menus are closed
  useEffect(() => {
    if (!isToolDropdownOpen && !isQuoteDropdownOpen && !isModelDropdownOpen && inputRef.current) {
      setTimeout(() => {
        // console.log('focus on input because menus are closed');
        inputRef.current.focus();
      }, 33);
    }
  }, [isToolDropdownOpen, isQuoteDropdownOpen, isModelDropdownOpen]);

  const addQuote = (newQuote: QuoteContext) => {
    setInitQuotes(prevQuotes => [...prevQuotes, newQuote]);
  };

  async function onSend(overrideTool?: ToolsPromptInterface) {
    await chatContext.updateModelByName(selectedModel);
    // Use overrideTool if provided, otherwise fall back to userTools state
    const toolToUse = overrideTool || userTools;

    if (toolToUse) {
      chatContext.askWithTool(toolToUse, pageContext, initQuotes, userInput.trim());
    } else {
      chatContext.askWithQuotes(initQuotes!, userInput.trim());
    }

    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
    setUserInput('');
  }

  function updateDropdownPosition(input: HTMLTextAreaElement, cursorPosition: number) {
    // 创建一个临时 span 来测量文本位置
    const span = document.createElement('span');
    span.style.cssText = `
      font: ${window.getComputedStyle(input).font};
      visibility: hidden;
      position: absolute;
      white-space: pre-wrap;
      word-wrap: break-word;
      width: ${input.clientWidth}px;
      padding: ${window.getComputedStyle(input).padding};
    `;

    // 获取光标之前的文本
    const textBeforeCursor = input.value.substring(0, cursorPosition);
    span.textContent = textBeforeCursor;

    // 将 span 添加到文档中进行测量
    input.parentElement.appendChild(span);

    // 添加安全检查
    let left = 0;
    let top = 14; //TODO needs to update calculated height

    if (span.firstChild) {
      const range = document.createRange();
      const textNode = span.firstChild as Text;
      range.setStart(textNode, Math.max(0, textNode.length - 1));
      const atRect = range.getBoundingClientRect();
      const spanRect = span.getBoundingClientRect();
      left = atRect.left - spanRect.left + parseInt(window.getComputedStyle(input).paddingLeft);
      top = atRect.top - spanRect.top + parseInt(window.getComputedStyle(input).paddingTop);
    }

    // 清理
    input.parentElement.removeChild(span);

    // 设置下拉菜单位置
    setDropdownPosition({ left, top });
  }

  // 在组件加载时读取存储的模型
  useEffect(() => {
    const loadSelectedModel = async () => {
      const savedModel = await configStorage.getSelectedModel();
      setSelectedModel(savedModel);
    };
    loadSelectedModel();
  }, []);

  // 修改模型选择的处理函数
  const handleModelSelect = async (model: string) => {
    setSelectedModel(model);
    await configStorage.setModel(model);
  };

  // myObject.test('你是谁');
  // console.log('history = ' + JSON.stringify(history));
  return (
    <div
      ref={panelRef}
      className={classNames(
        'antialiased bg-white text-black text-left fixed border-1 border-solid border-gray-200 drop-shadow-lg text-sm rounded-lg p-4',
        isMaximized ? 'w-[80%] h-[80%] top-[10%] right-[10px] flex flex-col' : 'w-[473px] min-w-80 max-w-lg min-h-[155px]',
        `${askPanelVisible ? 'visible' : 'invisible'}`,
      )}
      {...rest}>
      <div className="font-medium rounded-lg bg-transparent bg-gradient-to-r from-white via-white to-white/60 mb-2 text-base flex justify-between">
        <span>
          Askman <KeyBinding text="⌘ I"></KeyBinding>{' '}
          <KeyBinding
            text="Setting"
            className="hover:bg-gray-300 cursor-pointer"
            onClick={() => {
              chrome.runtime.sendMessage({ cmd: CommandType.OpenOptionsPage });
            }}></KeyBinding>
        </span>

        <div className="grow"></div>
        
        <button
          className="bg-gray-100 text-gray-600 rounded-full p-1 hover:bg-black hover:text-white mr-2"
          onClick={() => setIsMaximized(!isMaximized)}>
          {isMaximized ? (
            <ArrowsPointingInIcon className="w-4 h-4 cursor-pointer" />
          ) : (
            <ArrowsPointingOutIcon className="w-4 h-4 cursor-pointer" />
          )}
        </button>
        
        <button
          className="bg-gray-100 text-gray-600 rounded-full p-1 hover:bg-black hover:text-white"
          onClick={() => {
            setAskPanelVisible(false);
            onHide();
          }}>
          <XMarkIcon className="w-4 h-4 cursor-pointer" />
        </button>
      </div>
      <div className={classNames(
        "py-2 overflow-x-hidden overflow-y-auto mb-2",
        isMaximized ? "flex-grow" : "max-h-80"
      )}>
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
      <div className="mt-auto">
        <div className="user-tools relative w-full bg-cover bg-[50%_50%]">
          {/* {userTools && (
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
          )} */}

          <div className="w-full pr-2 mb-2 p-1 rounded-md border-solid border-1 border-gray ">
            <div className="flex">
              {initQuotes.length > 0 && (
                <div className="quotes relative flex flex-wrap gap-2">
                  {initQuotes.map((quote, index) => (
                    <div className="flex items-center bg-gray-100 rounded-md px-2 py-1" key={index + '-' + quote}>
                      <div className="relative">
                        <div 
                          className="text-black text-xs font-normal overflow-hidden whitespace-nowrap text-ellipsis max-w-[150px]"
                          onMouseEnter={() => setHoveredQuoteIndex(index)}
                          onMouseLeave={() => setHoveredQuoteIndex(null)}
                        >
                          {(quote.name || quote.type || 'Quote').charAt(0).toUpperCase() + (quote.name || quote.type || 'Quote').slice(1)}
                        </div>
                        {hoveredQuoteIndex === index && (
                          <div className="absolute left-0 top-full mt-1 z-50 bg-gray-800 text-white text-xs rounded px-2 py-1 whitespace-normal min-w-[300px] max-w-[400px] shadow-lg">
                            {getTruncatedContent(quote)}
                          </div>
                        )}
                      </div>
                      <button
                        title="删除引用"
                        className="ml-2 text-gray-600 hover:text-black"
                        onClick={() => {
                          setInitQuotes(quotes => quotes.filter((_, i) => i !== index));
                          inputRef.current?.focus();
                        }}>
                        <XMarkIcon className="w-3 h-3 cursor-pointer" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="flex relative">
              <TextareaAutosize
                ref={inputRef}
                maxRows={5}
                minRows={1}
                className="flex-grow outline-none bg-white text-gray-800 text-sm inline-block font-normal tracking-[0] leading-[normal] p-2 h-6 resize-none min-h-[3em] 
                focus:border-black"
                //TODO 输入在有字/无字时会发生高度变化，需要修复
                onKeyDown={e => {
                  // 检测 ESC 键
                  if (e.key === 'Escape') {
                    if (isQuoteDropdownOpen || isToolDropdownOpen || isModelDropdownOpen) {
                      e.preventDefault();
                      return;
                    }
                  } else if (e.key === '@' && !e.nativeEvent.isComposing) {
                    updateDropdownPosition(inputRef.current, inputRef.current.selectionStart);
                    showQuoteDropdown();
                    e.preventDefault();
                    return;
                  }
                  // 检测 Command+K (Mac) 或 Ctrl+K (Windows/Linux)
                  if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                    // e.preventDefault();
                    return;
                  }

                  // TODO How to prevent notion.so intercept command+v?

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
                    } else if (isModelDropdownOpen) {
                      // 如果 Model 下拉菜单打开，确认选择并关闭菜单
                      setIsModelDropdownOpen(false);
                    } else {
                      // 如果没有下拉菜单打开，发送消息
                      onSend();
                    }

                    e.preventDefault();
                  }
                  // 检测左右方向键
                  if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
                    if (isToolDropdownOpen || isModelDropdownOpen) {
                      e.preventDefault();
                      e.stopPropagation();
                      if (isToolDropdownOpen && e.key === 'ArrowRight') {
                        showModelDropdown();
                      } else if (isModelDropdownOpen && e.key === 'ArrowRight') {
                        showToolDropdown();
                      } else if (isToolDropdownOpen && e.key === 'ArrowLeft') {
                        showModelDropdown();
                      } else if (isModelDropdownOpen && e.key === 'ArrowLeft') {
                        showToolDropdown();
                      }
                      return;
                    }
                  }
                  // github 上面按 s 会触发页面搜索
                  // if (e.key.match(/^[a-z/\\]$/) && !e.shiftKey && !e.ctrlKey && !e.altKey) e.stopPropagation();
                  e.stopPropagation();
                }}
                onChange={e => {
                  setUserInput(e.currentTarget.value);
                  e.preventDefault();
                }}
                value={userInput}
                placeholder="@ to insert contents"></TextareaAutosize>

              <QuoteDropdown
                initOpen={isQuoteDropdownOpen}
                statusListener={updateQuoteDropdownStatus}
                className="absolute"
                style={{
                  left: `${dropdownPosition.left}px`,
                  top: `${dropdownPosition.top}px`,
                }}
                onItemClick={item => {
                  addQuote(item);
                }}
              />
            </div>
            <div className="flex">
              <ToolDropdown
                displayName={userTools?.name || 'Frame'}
                initOpen={isToolDropdownOpen}
                // isOpen={isToolDropdownOpen}
                // setIsOpen={setIsToolDropdownOpen}
                statusListener={updateToolDropdownStatus}
                className="inline-block"
                onItemClick={(item, withCommand) => {
                  setUserTools(item);
                  if (withCommand) {
                    onSend(item);
                  }
                }}
              />
              <ModelDropdown
                displayName={selectedModel}
                initOpen={isModelDropdownOpen}
                className=""
                onItemClick={handleModelSelect}
                statusListener={updateModelDropdownStatus}
              />
              <div className="grow"></div>
              <AskButton
                primary
                disabled={!(userInput || initQuotes.length)}
                onClick={() => {
                  onSend();
                }}
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
        </div>
      </div>
    </div>
  );
}

export default AskPanel;
