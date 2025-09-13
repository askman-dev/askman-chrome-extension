/* eslint-disable react-hooks/exhaustive-deps */
import 'highlight.js/styles/default.min.css';
import { QuoteAgent, QuoteContext } from '@src/agents/quote';
import React, { useState, useContext, useEffect, useRef, useCallback, useMemo } from 'react';
import { PageChatContext } from './PageChatService';
import { ToolDropdown, QuoteDropdown, SystemPromptDropdown, ModelSelector } from '@src/components/controls';
import { tools } from '@src/components/controls/ToolDropdown';
import TextareaAutosize from 'react-textarea-autosize';
import {
  ArrowsPointingInIcon,
  ArrowsPointingOutIcon,
  XMarkIcon,
  PencilSquareIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  StopIcon,
} from '@heroicons/react/20/solid';
import { BaseDropdown } from '@src/components/common/Dropdown';
import { MessageItem } from '@src/components/message';
import {
  ToolsPromptInterface,
  AIInvisibleMessage,
  HumanInvisibleMessage,
  HumanAskMessage,
  SystemInvisibleMessage,
  AIThinkingMessage,
  AIReasoningMessage,
  AIToolPendingMessage,
  AIToolExecutingMessage,
  AIToolResultMessage,
  CommandType,
  TabMessage,
} from '@src/types';
import { StorageManager } from '@src/utils/StorageManager';
import configStorage from '@src/shared/storages/configStorage';
import { createStorage, StorageType } from '@src/shared/storages/base';
import { Handlebars } from '@src/../third-party/kbn-handlebars/src/handlebars';
import { SCROLLBAR_STYLES_THIN_X } from '@src/styles/common';
import { HumanMessage } from '@langchain/core/messages';
import { BlockConfig } from '@src/utils/BlockConfig';
import classNames from 'classnames';

interface PagePanelProps extends React.HTMLAttributes<HTMLDivElement> {
  code: string;
  visible?: boolean;
  quotes?: Array<Promise<QuoteContext>>;
  onHide?: () => void;
}

// Create storage instance for height expansion state
const heightExpandedStorage = createStorage<Record<string, boolean>>(
  'panelHeightExpanded',
  {},
  {
    storageType: StorageType.Session,
    liveUpdate: true,
  },
);

export function PagePanel(props: PagePanelProps) {
  const { visible, quotes, onHide, ...rest } = props;
  const [isMaximized, setIsMaximized] = useState(false);
  const [isHeightExpanded, setIsHeightExpanded] = useState(false);
  const [tempHeightExpandedState, setTempHeightExpandedState] = useState<boolean | null>(null);

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
      setSelectorExpanded(false);
      setPendingDropdown(null);
      setIsMenuOpen(false);
    }
  }, []);

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [handleClickOutside]);

  // 监听全局焦点变化，防止焦点被扩展根容器抢夺
  useEffect(() => {
    const handleFocusChange = (e: FocusEvent) => {
      if (e.target && (e.target as HTMLElement).id === 'askman-chrome-extension-content-view-root') {
        setTimeout(() => {
          if (inputRef.current) {
            inputRef.current.focus();
          }
        }, 10);
      }
    };

    document.addEventListener('focusin', handleFocusChange);
    return () => {
      document.removeEventListener('focusin', handleFocusChange);
    };
  }, []);

  const chatContext = useContext(PageChatContext);
  const [userInput, setUserInput] = useState<string>('');
  const [askPanelVisible, setAskPanelVisible] = useState<boolean>(visible);
  //TODO 需要定义一个可渲染、可序列号的类型，疑似是 StoredMessage
  const [history, setHistory] = useState<{ id: string; role: string; type: string; text: string }[]>([]);
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
  const [selectedSystemPrompt, setSelectedSystemPrompt] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const [selectorExpanded, setSelectorExpanded] = useState(false);
  const [pendingDropdown, setPendingDropdown] = useState<'system' | 'model' | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Streaming control state
  const [isStreaming, setIsStreaming] = useState(false);
  const [isAgentMode, setIsAgentMode] = useState(false);

  // Load height expansion state from storage on mount
  useEffect(() => {
    const loadHeightExpandedState = async () => {
      try {
        // Check if chrome.tabs API is available
        if (!chrome?.tabs?.query) {
          return; // Graceful fallback to default state
        }

        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (!tab?.id || !tab?.url) {
          return; // Invalid tab data, use default state
        }

        const tabKey = `${tab.id}-${tab.url}`;
        const states = await heightExpandedStorage.get();
        setIsHeightExpanded(states[tabKey] || false);
      } catch (error) {
        console.warn('Failed to load height expansion state:', error);
        // Fallback: continue with default state (false)
        // No user-facing error - just log for debugging
      }
    };
    loadHeightExpandedState();
  }, []);

  // Save height expansion state to storage when it changes
  useEffect(() => {
    const saveHeightExpandedState = async () => {
      try {
        // Skip saving if chrome.tabs API is unavailable or component is initializing
        if (!chrome?.tabs?.query) {
          return;
        }

        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (!tab?.id || !tab?.url) {
          return; // Invalid tab data, skip saving
        }

        const tabKey = `${tab.id}-${tab.url}`;
        const currentStates = await heightExpandedStorage.get();
        await heightExpandedStorage.set({
          ...currentStates,
          [tabKey]: isHeightExpanded,
        });
      } catch (error) {
        console.warn('Failed to save height expansion state:', error);
        // Graceful degradation: feature continues to work in current session
        // but state won't persist across panel reopens
      }
    };
    saveHeightExpandedState();
  }, [isHeightExpanded]);

  // Handle maximize priority logic - save height expansion state when maximize activates
  useEffect(() => {
    if (isMaximized && tempHeightExpandedState === null) {
      // Maximize is being activated - save current height expansion state
      setTempHeightExpandedState(isHeightExpanded);
    }
  }, [isMaximized, tempHeightExpandedState, isHeightExpanded]);

  // Restore height expansion state when maximize is deactivated
  useEffect(() => {
    if (!isMaximized && tempHeightExpandedState !== null) {
      // Maximize is being deactivated - restore previous height expansion state
      setIsHeightExpanded(tempHeightExpandedState);
      setTempHeightExpandedState(null);
    }
  }, [isMaximized, tempHeightExpandedState]);

  // Handle viewport changes - ensure height constraints work on resize
  useEffect(() => {
    const handleResize = () => {
      // Force re-calculation of height constraints on viewport changes
      // The CSS min() and calc() will automatically adjust, but this ensures
      // any cached calculations are updated
      if (isHeightExpanded && !isMaximized) {
        // Trigger a small state update to force recalculation
        const forceUpdate = Date.now();
        if (panelRef.current) {
          panelRef.current.style.setProperty('--force-update', forceUpdate.toString());
        }
      }
    };

    // Debounce resize events to avoid excessive recalculations
    let resizeTimeout: NodeJS.Timeout;
    const debouncedHandleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(handleResize, 100);
    };

    window.addEventListener('resize', debouncedHandleResize);
    return () => {
      window.removeEventListener('resize', debouncedHandleResize);
      clearTimeout(resizeTimeout);
    };
  }, [isHeightExpanded, isMaximized]);

  // 菜单项数据 - 使用 useMemo 优化性能
  const menuItems = useMemo(
    () => [
      {
        id: 'new-chat',
        name: 'New Chat',
        shortName: 'New Chat',
        icon: 'new-chat',
      },
      {
        id: 'toggle-size',
        name: isMaximized ? 'Minimize Panel' : 'Maximize Panel',
        shortName: isMaximized ? 'Minimize' : 'Maximize',
        icon: isMaximized ? 'minimize' : 'maximize',
      },
      {
        id: 'settings',
        name: 'Settings',
        shortName: 'Settings',
        icon: 'settings',
      },
    ],
    [isMaximized],
  );

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

  // 处理待显示的下拉菜单 - 当 selector 展开后显示对应菜单
  useEffect(() => {
    if (selectorExpanded && pendingDropdown) {
      if (pendingDropdown === 'system') {
        showSystemPromptDropdown();
      } else if (pendingDropdown === 'model') {
        showModelDropdown();
      }
      setPendingDropdown(null);
    }
  }, [selectorExpanded, pendingDropdown]);

  useEffect(() => {
    quotes.forEach(quote => {
      quote
        .then(quoteContext => {
          setInitQuotes(prev => [...prev, quoteContext]);
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
    const messageListener = (message: TabMessage) => {
      if (message.cmd === CommandType.AGENT_STREAM) {
        setHistory(message.data);
      }
    };

    chrome.runtime.onMessage.addListener(messageListener);

    askPanelVisible &&
      setTimeout(() => {
        inputRef.current.focus();
      }, 200);

    return () => {
      chrome.runtime.onMessage.removeListener(messageListener);
    };
  }, [askPanelVisible]);
  // 使用 ref 保持最新状态，避免闭包问题
  const dropdownStatesRef = useRef({
    isToolDropdownOpen,
    isModelDropdownOpen,
    isSystemPromptDropdownOpen,
    isQuoteDropdownOpen,
  });

  // 更新 ref 中的状态
  useEffect(() => {
    dropdownStatesRef.current = {
      isToolDropdownOpen,
      isModelDropdownOpen,
      isSystemPromptDropdownOpen,
      isQuoteDropdownOpen,
    };
  }, [isToolDropdownOpen, isModelDropdownOpen, isSystemPromptDropdownOpen, isQuoteDropdownOpen]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const currentStates = dropdownStatesRef.current;

      // 检测 Command+K (Mac) 或 Ctrl+K (Windows/Linux)
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        e.stopPropagation();

        if (
          !currentStates.isToolDropdownOpen &&
          !currentStates.isModelDropdownOpen &&
          !currentStates.isSystemPromptDropdownOpen
        ) {
          showToolDropdown();
        } else if (currentStates.isToolDropdownOpen) {
          // 从 tool 切换到 model，需要先展开 selector 然后显示菜单
          setSelectorExpanded(true);
          setPendingDropdown('model');
        } else if (currentStates.isModelDropdownOpen) {
          // 从 model 切换到 system，保持 selector 展开
          setSelectorExpanded(true);
          setPendingDropdown('system');
        } else if (currentStates.isSystemPromptDropdownOpen) {
          // 从 system 切换到 tool，可以收起 selector
          setSelectorExpanded(false);
          showToolDropdown();
        }
        return;
      }

      // 检测左右方向键
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        if (
          currentStates.isToolDropdownOpen ||
          currentStates.isModelDropdownOpen ||
          currentStates.isSystemPromptDropdownOpen
        ) {
          e.preventDefault();
          e.stopPropagation();

          if (e.key === 'ArrowRight') {
            if (currentStates.isToolDropdownOpen) {
              setSelectorExpanded(true);
              setPendingDropdown('model');
            } else if (currentStates.isModelDropdownOpen) {
              setSelectorExpanded(true);
              setPendingDropdown('system');
            } else if (currentStates.isSystemPromptDropdownOpen) {
              setSelectorExpanded(false);
              showToolDropdown();
            }
          } else if (e.key === 'ArrowLeft') {
            if (currentStates.isToolDropdownOpen) {
              setSelectorExpanded(true);
              setPendingDropdown('system');
            } else if (currentStates.isSystemPromptDropdownOpen) {
              setSelectorExpanded(true);
              setPendingDropdown('model');
            } else if (currentStates.isModelDropdownOpen) {
              setSelectorExpanded(false);
              showToolDropdown();
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
  }, []); // 空依赖数组，避免频繁重新绑定事件监听器

  // Add this new useEffect to focus on input when menus are closed
  useEffect(() => {
    if (
      !isToolDropdownOpen &&
      !isQuoteDropdownOpen &&
      !isModelDropdownOpen &&
      !isSystemPromptDropdownOpen &&
      inputRef.current
    ) {
      // 使用 requestAnimationFrame 确保 DOM 完全更新
      requestAnimationFrame(() => {
        setTimeout(() => {
          if (inputRef.current) {
            // 强制重新获取焦点
            (document.activeElement as HTMLElement)?.blur?.();
            inputRef.current.blur();

            // 确保 tabIndex 正确
            inputRef.current.tabIndex = 0;

            // 尝试多种聚焦方法
            inputRef.current.focus();

            // 模拟真实的用户交互
            const clickEvent = new MouseEvent('click', {
              bubbles: true,
              cancelable: true,
              view: window,
            });
            inputRef.current.dispatchEvent(clickEvent);

            const focusEvent = new FocusEvent('focus', {
              bubbles: true,
              cancelable: true,
            });
            inputRef.current.dispatchEvent(focusEvent);

            // 如果焦点设置失败，尝试设置光标位置
            setTimeout(() => {
              if (document.activeElement !== inputRef.current && inputRef.current) {
                try {
                  inputRef.current.setSelectionRange(inputRef.current.value.length, inputRef.current.value.length);
                } catch (e) {
                  // Ignore selection errors
                }
              }
            }, 10);
          }
        }, 100);
      });
    }
  }, [isToolDropdownOpen, isQuoteDropdownOpen, isModelDropdownOpen, isSystemPromptDropdownOpen]);

  const addQuote = (newQuote: QuoteContext) => {
    setInitQuotes(prevQuotes => [...prevQuotes, newQuote]);
  };

  // Stop current streaming
  const stopStreaming = useCallback(() => {
    if (chatContext && typeof chatContext.abortCurrentStream === 'function') {
      chatContext.abortCurrentStream();
      setIsStreaming(false);
    }
  }, [chatContext]);

  async function onSend(overrideTool?: ToolsPromptInterface, overrideSystem?: string, overrideModel?: string) {
    // Use overrideTool if provided, otherwise fall back to userTools state
    const toolToUse = overrideTool || userTools;

    // Capture user input before clearing
    const currentInput = userInput.trim();

    // 1. 立即清空输入框和重置 quotes - 提供更好的用户体验
    setUserInput('');
    setInitQuotes([]);

    // 2. 管理流式状态
    if (isStreaming) {
      stopStreaming();
    }
    setIsStreaming(true);

    // 🚨 CRITICAL PATH DEBUGGING - 确认用户请求走的逻辑路径
    console.log('[PagePanel] ====== SEND REQUEST ROUTING DEBUG ======');
    console.log('[PagePanel] User input:', currentInput);
    console.log('[PagePanel] isAgentMode:', isAgentMode);
    console.log('[PagePanel] toolToUse:', toolToUse ? {
      name: toolToUse.name,
      template: typeof toolToUse.template === 'string' ? toolToUse.template.substring(0, 50) + '...' : 'N/A'
    } : null);
    console.log('[PagePanel] initQuotes count:', initQuotes?.length || 0);
    console.log('[PagePanel] overrideSystem:', overrideSystem ? 'YES' : 'NO');
    console.log('[PagePanel] overrideModel:', overrideModel || 'default');
    
    try {
      if (isAgentMode) {
        console.log('[PagePanel] 🤖 ROUTING TO: askWithAgent (tool calling mode)');
        chrome.runtime.sendMessage({
          cmd: CommandType.ASK_AGENT,
          data: {
            userPrompt: currentInput,
            pageContext,
            quotes: initQuotes,
            options: {
              overrideSystem,
              overrideModel,
            },
          },
        });
      } else if (toolToUse) {
        console.log('[PagePanel] 💬 ROUTING TO: askWithTool (template mode with tool)');
        console.log('[PagePanel] Selected tool:', toolToUse.name);
        // Ask mode with tool template: Use askWithTool
        await chatContext.askWithTool(toolToUse, pageContext, initQuotes, currentInput, {
          overrideSystem,
          overrideModel,
        });
      } else {
        console.log('[PagePanel] 📝 ROUTING TO: askWithQuotes (simple ask mode)');
        // Ask mode without tool: Use askWithQuotes
        await chatContext.askWithQuotes(initQuotes!, currentInput, {
          overrideSystem,
          overrideModel,
        });
      }
    } catch (error) {
      // Stream completed or was aborted
    } finally {
      // Always reset streaming state when done
      setIsStreaming(false);
    }
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

  // 清空历史记录和输入框
  const clearHistory = () => {
    // 保留系统消息
    const systemMessages = chatContext.history.filter(message => message instanceof SystemInvisibleMessage);
    chatContext.history = systemMessages;
    // 清空可见消息
    setHistory([]);
    // 清空输入框
    setUserInput('');
  };

  const blockConfigRef = useRef<BlockConfig>(null);

  // 初始化配置
  useEffect(() => {
    const initBlockConfig = async () => {
      blockConfigRef.current = BlockConfig.getInstance();
      await blockConfigRef.current.initialize();
    };
    initBlockConfig();
  }, []);

  return (
    <div
      ref={panelRef}
      className={classNames(
        'antialiased bg-white text-black text-left fixed border-1 border-solid border-gray-200 drop-shadow-lg text-sm rounded-lg p-4 font-system-ui',
        isMaximized
          ? 'w-[80%] h-[80%] top-[10%] right-[10px] flex flex-col'
          : isHeightExpanded
            ? 'w-[473px] min-w-80 max-w-lg h-[92vh] max-h-[900px] flex flex-col transition-all duration-300 ease-in-out'
            : 'w-[473px] min-w-80 max-w-lg min-h-[155px] flex flex-col',
        `${askPanelVisible ? 'visible' : 'invisible'}`,
      )}
      style={{
        ...(isHeightExpanded &&
          !isMaximized && {
            height: 'min(92vh, calc(100vh - 60px))',
            maxHeight: '900px',
          }),
      }}
      onKeyDown={e => {
        if (
          e.key === 'Escape' &&
          (isQuoteDropdownOpen || isToolDropdownOpen || isModelDropdownOpen || isSystemPromptDropdownOpen)
        ) {
          setIsQuoteDropdownOpen(false);
          setIsToolDropdownOpen(false);
          setIsModelDropdownOpen(false);
          setIsSystemPromptDropdownOpen(false);
          setSelectorExpanded(false);
          setPendingDropdown(null);
          e.stopPropagation();
          e.preventDefault();
        }
      }}
      tabIndex={-1}
      {...rest}>
      <div className="font-medium rounded-lg bg-transparent bg-gradient-to-r from-white via-white to-white/60 mb-2 text-base flex justify-between items-center">
        <div className="flex items-center h-6 min-w-0">
          {/* Always show expanded mode - 紧凑胶囊模式 temporarily disabled */}
          <div className="flex items-center gap-2 h-6">
            <ModelSelector
              initOpen={isModelDropdownOpen}
              className="flex items-center"
              onItemClick={(model, withCommand) => {
                if (withCommand) {
                  onSend(undefined, undefined, model);
                } else {
                  setSelectedModel(model);
                }
                setIsModelDropdownOpen(false);
              }}
              statusListener={updateModelDropdownStatus}
            />
            <SystemPromptDropdown
              className="relative inline-block text-left"
              statusListener={updateSystemPromptDropdownStatus}
              initOpen={isSystemPromptDropdownOpen}
              onItemClick={(preset, withCommand) => {
                if (withCommand) {
                  onSend(undefined, preset.hbs);
                } else {
                  setSelectedSystemPrompt(preset.hbs);
                }
                setIsSystemPromptDropdownOpen(false);
              }}
            />
          </div>
        </div>

        {/* Ask/Agent Mode Toggle */}
        <div className="flex items-center gap-1 px-2">
          <button
            onClick={() => setIsAgentMode(!isAgentMode)}
            className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium transition-colors duration-200 ${
              isAgentMode
                ? 'bg-black text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            title={isAgentMode ? 'Switch to Ask mode (template-based)' : 'Switch to Agent mode (tool calling)'}
          >
            {isAgentMode ? '🤖 Agent' : '💬 Ask'}
          </button>
        </div>

        <div className="grow"></div>

        <div className="flex items-center gap-2">
          <BaseDropdown
            displayName=""
            className="flex items-center"
            onItemClick={(item, _isCommandPressed) => {
              const itemId = item.id as string;
              if (itemId === 'toggle-size') {
                setIsMaximized(!isMaximized);
              } else if (itemId === 'new-chat') {
                clearHistory();
                setUserTools(null);
                setSelectedSystemPrompt(null);
                setSelectedModel(null);
                setTimeout(() => {
                  inputRef.current?.focus();
                }, 100);
              } else if (itemId === 'settings') {
                chrome.runtime.sendMessage({ cmd: CommandType.OpenOptionsPage });
              }
              setIsMenuOpen(false);
            }}
            statusListener={setIsMenuOpen}
            initOpen={isMenuOpen}
            items={menuItems}
            showShortcut={false}
            align="right"
            variant="button-icon"
            buttonDisplay={<ChevronDownIcon className="w-4 h-4" />}
            hoverMessage={null}
            renderItem={(item, index, active) => {
              const itemData = item as { id: string; name: string; shortName: string; icon: string };

              return (
                <div
                  className={`${
                    active ? 'bg-black text-white' : 'text-gray-900 hover:bg-gray-100'
                  } group flex w-full items-center rounded-md px-2 py-2 text-sm cursor-pointer transition-colors`}>
                  <span className="mr-2 inline-flex items-center justify-center w-5 h-5 text-xs font-semibold border border-gray-300 rounded">
                    {itemData.icon === 'minimize' && <ArrowsPointingInIcon className="w-4 h-4" />}
                    {itemData.icon === 'maximize' && <ArrowsPointingOutIcon className="w-4 h-4" />}
                    {itemData.icon === 'new-chat' && <PencilSquareIcon className="w-4 h-4" />}
                    {itemData.icon === 'settings' && (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                    )}
                  </span>
                  <span className="whitespace-nowrap flex-1 flex justify-between items-center">
                    <span>{itemData.shortName}</span>
                  </span>
                </div>
              );
            }}
          />

          <button
            title="Close [ESC]"
            className="text-gray-600 bg-gray-100 hover:bg-black hover:text-white rounded p-1 transition-colors duration-200"
            onClick={() => {
              setAskPanelVisible(false);
              onHide();
            }}>
            <XMarkIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
      <div
        className={classNames(
          'py-2 mb-2',
          SCROLLBAR_STYLES_THIN_X,
          isMaximized || isHeightExpanded ? 'flex-grow' : 'max-h-80',
        )}>
        {history.length === 0 && <div className="h-16"></div>}

        {history.map(message => {
          return <MessageItem key={message.id} {...message} />;
        })}

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

          <div className="w-full pr-2 mb-2 p-1 rounded-md border-solid border-1 border-gray-200 ">
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
                className={`flex-grow outline-none bg-white text-gray-800 text-sm inline-block font-normal tracking-[0] leading-[normal] p-2 h-6 resize-none min-h-[3em] focus:border-black ${SCROLLBAR_STYLES_THIN_X}`}
                //TODO 输入在有字/无字时会发生高度变化，需要修复
                onKeyDown={e => {
                  // 检测 ESC 键
                  if (e.key === 'Escape') {
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
                      setSelectorExpanded(false);
                      setPendingDropdown(null);
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
                    } else if (isSystemPromptDropdownOpen) {
                      // 如果 SystemPrompt 下拉菜单打开，确认选择并关闭菜单
                      setIsSystemPromptDropdownOpen(false);
                    } else {
                      // 如果没有下拉菜单打开，发送消息（使用选中的系统提示词和模型）
                      onSend(undefined, selectedSystemPrompt, selectedModel);
                    }

                    e.preventDefault();
                  }
                  // 检测左右方向键
                  if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
                    if (isToolDropdownOpen || isModelDropdownOpen || isSystemPromptDropdownOpen) {
                      e.preventDefault();
                      e.stopPropagation();

                      if (e.key === 'ArrowRight') {
                        if (isToolDropdownOpen) {
                          setSelectorExpanded(true);
                          setPendingDropdown('model');
                        } else if (isModelDropdownOpen) {
                          setSelectorExpanded(true);
                          setPendingDropdown('system');
                        } else if (isSystemPromptDropdownOpen) {
                          setSelectorExpanded(false);
                          showToolDropdown();
                        }
                      } else if (e.key === 'ArrowLeft') {
                        if (isToolDropdownOpen) {
                          setSelectorExpanded(true);
                          setPendingDropdown('system');
                        } else if (isSystemPromptDropdownOpen) {
                          setSelectorExpanded(true);
                          setPendingDropdown('model');
                        } else if (isModelDropdownOpen) {
                          setSelectorExpanded(false);
                          showToolDropdown();
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
                  setIsQuoteDropdownOpen(false);
                }}
              />
            </div>
            <div className="flex">
              <div
                className="grow cursor-text"
                onClick={() => {
                  // 点击空白区域时聚焦到输入框
                  if (inputRef.current) {
                    inputRef.current.focus();
                  }
                }}></div>
              {isStreaming ? (
                <button
                  onClick={stopStreaming}
                  className="inline-flex items-center justify-center w-8 h-8 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors duration-200"
                  title="Stop streaming">
                  <StopIcon className="w-4 h-4" />
                </button>
              ) : !isAgentMode ? (
                <ToolDropdown
                  initOpen={isToolDropdownOpen}
                  statusListener={updateToolDropdownStatus}
                  className="inline-block relative"
                  onItemClick={(_item, _withCommand) => {
                    if (_withCommand) {
                      setUserTools(_item as unknown as ToolsPromptInterface);
                    }
                    onSend(_item as unknown as ToolsPromptInterface); // 直接发送，不需要修改按钮文字
                    setIsToolDropdownOpen(false); // Explicitly close the dropdown
                  }}
                  buttonDisplay="➤"
                />
              ) : (
                <div
                  className="inline-flex items-center justify-center w-8 h-8 text-gray-400 rounded transition-colors duration-200"
                  title="Agent mode: AI will automatically select tools"
                >
                  <span className="text-sm">🤖</span>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="relative">
          {/* Height expand button - positioned at bottom of panel */}
          {!isMaximized && (
            <div className="group absolute -bottom-4 left-0 right-0 py-1 flex justify-center">
              <button
                className="opacity-0 group-hover:opacity-100 hover:opacity-100 transition-all duration-200 text-gray-600 bg-gray-100 hover:bg-black hover:text-white rounded px-2 py-0.5"
                onClick={() => {
                  setIsHeightExpanded(!isHeightExpanded);
                }}
                title={isHeightExpanded ? '收起面板高度' : '展开面板高度'}
                aria-label={isHeightExpanded ? 'Collapse panel height' : 'Expand panel height'}
                aria-expanded={isHeightExpanded}
                aria-describedby="height-expand-desc"
                type="button"
                tabIndex={0}>
                {isHeightExpanded ? <ChevronUpIcon className="w-3 h-3" /> : <ChevronDownIcon className="w-3 h-3" />}
              </button>
              {/* Screen reader description for height expand button */}
              <span id="height-expand-desc" className="sr-only">
                Toggle panel height between normal and expanded view for better readability of long conversations
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// For backwards compatibility
export const AskPanel = PagePanel;
export const DialogPanel = PagePanel;
export default PagePanel;
