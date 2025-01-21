import classNames from 'classnames';
import 'highlight.js/styles/default.min.css';
import { QuoteAgent, QuoteContext } from '../agents/quote';
import React, { useState, useContext, useEffect, useRef, useCallback } from 'react';
import { ChatPopupContext } from '../chat/chat';
import ToolDropdown, { tools } from './ask-tooldropdown';
import ModelDropdown from './ask/ModelDropDown';
import TextareaAutosize from 'react-textarea-autosize';
import { ArrowsPointingInIcon, ArrowsPointingOutIcon, XMarkIcon } from '@heroicons/react/20/solid';
import AskMessage from './ask-message';
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
import SystemPromptDropdown from './system-prompt-dropdown';
import { StorageManager } from '../utils/StorageManager';
import { Handlebars } from '../../third-party/kbn-handlebars/src/handlebars';
import { SCROLLBAR_STYLES_HIDDEN_X } from '../styles/common';

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
    const content =
      quote.selection ||
      quote.pageContent ||
      quote.text ||
      quote.pageTitle ||
      quote.pageUrl ||
      quote.name ||
      quote.type ||
      'Quote';
    return content.length > 50 ? content.slice(0, 50) + '...' : content;
  };

  const panelRef = useRef<HTMLDivElement>(null);
  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
      setIsToolDropdownOpen(false);
      setIsQuoteDropdownOpen(false);
      setIsModelDropdownOpen(false);
      setIsSystemPromptDropdownOpen(false);
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
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ left: 0, top: 0 });
  const [hoveredQuoteIndex, setHoveredQuoteIndex] = useState<number | null>(null);
  const [isSystemPromptDropdownOpen, setIsSystemPromptDropdownOpen] = useState(false);

  const showToolDropdown = () => {
    setIsToolDropdownOpen(true);
    setIsQuoteDropdownOpen(false);
    setIsModelDropdownOpen(false);
    setIsSystemPromptDropdownOpen(false);
  };
  const showQuoteDropdown = () => {
    setIsQuoteDropdownOpen(true);
    setIsToolDropdownOpen(false);
    setIsModelDropdownOpen(false);
    setIsSystemPromptDropdownOpen(false);
  };
  const showModelDropdown = () => {
    setIsModelDropdownOpen(true);
    setIsToolDropdownOpen(false);
    setIsQuoteDropdownOpen(false);
    setIsSystemPromptDropdownOpen(false);
  };
  const showSystemPromptDropdown = () => {
    setIsSystemPromptDropdownOpen(true);
    setIsToolDropdownOpen(false);
    setIsQuoteDropdownOpen(false);
    setIsModelDropdownOpen(false);
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
  const updateSystemPromptDropdownStatus = (status: boolean) => {
    setIsSystemPromptDropdownOpen(status);
  };

  useEffect(() => {
    // 获取当前选中的工具
    const fetchCurrentTool = async () => {
      try {
        const currentToolId = await StorageManager.getCurrentTool();
        if (currentToolId) {
          const userToolSettings = await StorageManager.getUserTools();
          const allToolsList = [
            ...tools,
            ...Object.values(userToolSettings).map(tool => ({
              id: tool.name,
              name: tool.name,
              hbs: tool.hbs,
              template: Handlebars.compileAST(tool.hbs),
            })),
          ];
          const tool = allToolsList.find(t => t.id === currentToolId);
          if (tool) {
            setUserTools(tool);
          }
        }
      } catch (error) {
        console.error('Error fetching current tool:', error);
      }
    };

    QuoteAgent.getQuoteByDocument(window.location.href, document).then(quoteContext => {
      updatePageContext(quoteContext);
    });
    fetchCurrentTool();
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
        if (!isToolDropdownOpen && !isModelDropdownOpen && !isSystemPromptDropdownOpen) {
          showToolDropdown();
        } else if (isToolDropdownOpen) {
          showModelDropdown();
        } else if (isModelDropdownOpen) {
          showSystemPromptDropdown();
        } else if (isSystemPromptDropdownOpen) {
          showToolDropdown();
        }

        e.stopPropagation();
        return;
      }

      // 检测左右方向键
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        if (isToolDropdownOpen || isModelDropdownOpen || isSystemPromptDropdownOpen) {
          e.preventDefault();
          e.stopPropagation();

          if (e.key === 'ArrowRight') {
            if (isSystemPromptDropdownOpen) {
              showModelDropdown();
            } else if (isModelDropdownOpen) {
              showToolDropdown();
            } else if (isToolDropdownOpen) {
              showSystemPromptDropdown();
            }
          } else if (e.key === 'ArrowLeft') {
            if (isSystemPromptDropdownOpen) {
              showToolDropdown();
            } else if (isModelDropdownOpen) {
              showSystemPromptDropdown();
            } else if (isToolDropdownOpen) {
              showModelDropdown();
            }
          }
          return;
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isToolDropdownOpen, isQuoteDropdownOpen, isModelDropdownOpen, isSystemPromptDropdownOpen]);

  // Add this new useEffect to focus on input when menus are closed
  useEffect(() => {
    if (
      !isToolDropdownOpen &&
      !isQuoteDropdownOpen &&
      !isModelDropdownOpen &&
      !isSystemPromptDropdownOpen &&
      inputRef.current
    ) {
      setTimeout(() => {
        inputRef.current.focus();
      }, 33);
    }
  }, [isToolDropdownOpen, isQuoteDropdownOpen, isModelDropdownOpen, isSystemPromptDropdownOpen]);

  const addQuote = (newQuote: QuoteContext) => {
    setInitQuotes(prevQuotes => [...prevQuotes, newQuote]);
  };

  async function onSend(overrideTool?: ToolsPromptInterface, overrideSystem?: string, overrideModel?: string) {
    // Use overrideTool if provided, otherwise fall back to userTools state
    const toolToUse = overrideTool || userTools;

    if (toolToUse) {
      chatContext.askWithTool(toolToUse, pageContext, initQuotes, userInput.trim(), {
        overrideSystem,
        overrideModel,
      });
    } else {
      chatContext.askWithQuotes(initQuotes!, userInput.trim(), {
        overrideSystem,
        overrideModel,
      });
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

  // myObject.test('你是谁');
  // console.log('history = ' + JSON.stringify(history));
  return (
    <div
      ref={panelRef}
      className={classNames(
        'antialiased bg-white text-black text-left fixed border-1 border-solid border-gray-200 drop-shadow-lg text-sm rounded-lg p-4',
        isMaximized
          ? 'w-[80%] h-[80%] top-[10%] right-[10px] flex flex-col'
          : 'w-[473px] min-w-80 max-w-lg min-h-[155px]',
        `${askPanelVisible ? 'visible' : 'invisible'}`,
      )}
      onKeyDown={e => {
        if (
          e.key === 'Escape' &&
          (isQuoteDropdownOpen || isToolDropdownOpen || isModelDropdownOpen || isSystemPromptDropdownOpen)
        ) {
          setIsQuoteDropdownOpen(false);
          setIsToolDropdownOpen(false);
          setIsModelDropdownOpen(false);
          setIsSystemPromptDropdownOpen(false);
          inputRef.current?.focus();
          e.stopPropagation();
          e.preventDefault();
        }
      }}
      tabIndex={-1}
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
      <div className={classNames('py-2 mb-2', SCROLLBAR_STYLES_HIDDEN_X, isMaximized ? 'flex-grow' : 'max-h-80')}>
        {history.map(message => (
          <AskMessage key={message.id} {...message} />
        ))}

        {history.length > 0 && (
          <div className="pt-32">
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
                          onMouseLeave={() => setHoveredQuoteIndex(null)}>
                          {(quote.name || quote.type || 'Quote').charAt(0).toUpperCase() +
                            (quote.name || quote.type || 'Quote').slice(1)}
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
                className={`flex-grow outline-none bg-white text-gray-800 text-sm inline-block font-normal tracking-[0] leading-[normal] p-2 h-6 resize-none min-h-[3em] focus:border-black ${SCROLLBAR_STYLES_HIDDEN_X}`}
                //TODO 输入在有字/无字时会发生高度变化，需要修复
                onKeyDown={e => {
                  // 检测 ESC 键
                  if (e.key === 'Escape') {
                    console.log('ESC key detected in textarea', {
                      isQuoteDropdownOpen,
                      isToolDropdownOpen,
                      isModelDropdownOpen,
                      isSystemPromptDropdownOpen,
                    });
                    if (
                      isQuoteDropdownOpen ||
                      isToolDropdownOpen ||
                      isModelDropdownOpen ||
                      isSystemPromptDropdownOpen
                    ) {
                      setIsQuoteDropdownOpen(false);
                      setIsToolDropdownOpen(false);
                      setIsModelDropdownOpen(false);
                      setIsSystemPromptDropdownOpen(false);
                      e.stopPropagation();
                      e.preventDefault();
                      return;
                    } else {
                      setAskPanelVisible(false);
                      onHide();
                      e.stopPropagation();
                      e.preventDefault();
                      return;
                    }
                  } else if (e.key === '@' && !e.nativeEvent.isComposing) {
                    updateDropdownPosition(inputRef.current, inputRef.current.selectionStart);
                    showQuoteDropdown();
                    e.stopPropagation();
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
                      e.stopPropagation();
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
                    if (isToolDropdownOpen || isModelDropdownOpen || isSystemPromptDropdownOpen) {
                      e.preventDefault();
                      e.stopPropagation();

                      if (e.key === 'ArrowRight') {
                        if (isSystemPromptDropdownOpen) {
                          showModelDropdown();
                        } else if (isModelDropdownOpen) {
                          showToolDropdown();
                        } else if (isToolDropdownOpen) {
                          showSystemPromptDropdown();
                        }
                      } else if (e.key === 'ArrowLeft') {
                        if (isSystemPromptDropdownOpen) {
                          showToolDropdown();
                        } else if (isModelDropdownOpen) {
                          showSystemPromptDropdown();
                        } else if (isToolDropdownOpen) {
                          showModelDropdown();
                        }
                      }
                      return;
                    }
                  }
                  // github 上面按 s 会触发页面搜索
                  // if (e.key.match(/^[a-z/\\]$/) && !e.shiftKey && !e.ctrlKey && !e.altKey) e.stopPropagation();
                  e.stopPropagation();
                }}
                onKeyUp={e => {
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
              <SystemPromptDropdown
                className="relative inline-block text-left"
                statusListener={updateSystemPromptDropdownStatus}
                initOpen={isSystemPromptDropdownOpen}
                onItemClick={(preset, withCommand) => {
                  if (withCommand) {
                    onSend(undefined, preset.hbs); // 按了 Command 键直接发送，使用 hbs 作为临时系统提示词
                  }
                }}
              />
              <ModelDropdown
                initOpen={isModelDropdownOpen}
                className="relative"
                onItemClick={(model, withCommand) => {
                  if (withCommand) {
                    onSend(undefined, undefined, model); // 直接传递 model，不再包装成对象
                  }
                }}
                statusListener={updateModelDropdownStatus}
              />
              <div className="grow"></div>
              <div className="w-px h-6 bg-gray-200 mx-2 my-auto"></div>
              <ToolDropdown
                initOpen={isToolDropdownOpen}
                statusListener={updateToolDropdownStatus}
                className="inline-block relative"
                onItemClick={(_item, _withCommand) => {
                  setUserTools(_item);
                  onSend(_item); // 直接发送，不需要修改按钮文字
                }}
                buttonDisplay="➔"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AskPanel;
