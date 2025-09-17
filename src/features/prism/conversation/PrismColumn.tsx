/**
 * 调用方：MultiColumnCanvas 渲染每个对话列时调用
 * 依赖：内置消息显示和输入功能，不依赖外部状态管理
 */

import React, { useCallback, forwardRef, useState, useEffect, useRef, useMemo } from 'react';
import { PrismInput, type PrismInputRef } from '@src/features/prism';
import type { ShortcutInterface } from '@src/types';
import type { SystemPresetInterface } from '@src/utils/StorageManager';
import type { ChatColumnProps, CanvasMessage } from '@src/features/prism/canvas/types';
import { StorageManager } from '@src/utils/StorageManager';
import configStorage from '@src/shared/storages/configStorage';
import { Handlebars } from '@src/../third-party/kbn-handlebars/src/handlebars';
import { ThinkingAnimation } from '@src/components/ui/ThinkingAnimation';
import defaultShortcuts from '@assets/conf/shortcuts.toml';

// 初始化默认快捷键列表
const shortcuts: ShortcutInterface[] = [];
for (const k in defaultShortcuts) {
  try {
    shortcuts.push({
      id: defaultShortcuts[k].name,
      name: defaultShortcuts[k].name,
      hbs: defaultShortcuts[k].hbs,
      template: Handlebars.compileAST(defaultShortcuts[k].hbs),
    });
  } catch (e) {
    console.error('Cannot parse default shortcuts', e);
  }
}

const ChatColumn = forwardRef<HTMLDivElement, ChatColumnProps>(
  (
    {
      column,
      isActive = false,
      isFocused = false,
      onSelect,
      onDoubleClick,
      onBranch,
      onMessageCreate,
      onExitFocus,
      width = 40,
      className = '',
      highlightedMessageId = null,
    },
    ref,
  ) => {
    // 滚动相关状态
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [scrollInfo, setScrollInfo] = useState({
      hasOverflow: false,
      scrollTop: 0,
      scrollHeight: 0,
      clientHeight: 0,
    });

    // 拖拽检测状态
    const [isColumnDragging, setIsColumnDragging] = useState(false);
    const dragStartPosition = useRef<{ x: number; y: number } | null>(null);
    const DRAG_THRESHOLD = 5; // 拖拽阈值：超过5px才认为是拖拽

    // PrismInput 相关状态
    const prismInputRef = useRef<PrismInputRef>(null);
    const [inputValue, setInputValue] = useState('');
    const [isShortcutDropdownOpen, setIsShortcutDropdownOpen] = useState(false);
    const [isSystemPromptDropdownOpen, setIsSystemPromptDropdownOpen] = useState(false);
    const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);

    // 选择状态管理
    const [selectedShortcut, setSelectedShortcut] = useState<ShortcutInterface | null>(null);
    const [selectedSystemPrompt, setSelectedSystemPrompt] = useState<string | null>(null);
    const [selectedModel, setSelectedModel] = useState<string | null>(null);

    // 初始化状态从存储中读取默认值
    useEffect(() => {
      const initializeDefaults = async () => {
        try {
          // 初始化快捷键选择
          const currentShortcut = await StorageManager.getCurrentShortcut();
          if (currentShortcut) {
            // 获取快捷键列表以找到完整的快捷键对象
            const userShortcutSettings = await StorageManager.getUserShortcuts();
            const userShortcuts = Object.values(userShortcutSettings).map(shortcut => ({
              id: shortcut.name,
              name: shortcut.name,
              hbs: shortcut.hbs,
              template: Handlebars.compileAST(shortcut.hbs),
            }));

            // 合并默认快捷键和用户快捷键
            const allShortcuts = [...shortcuts, ...userShortcuts];
            const foundShortcut = allShortcuts.find(s => s.id === currentShortcut);
            if (foundShortcut) {
              setSelectedShortcut(foundShortcut);
            }
          }

          // 初始化系统提示词
          const systemPrompt = await StorageManager.getSystemPrompt();
          if (systemPrompt?.content) {
            setSelectedSystemPrompt(systemPrompt.content);
          }

          // 初始化模型选择
          const currentModel = await configStorage.getCurrentModel();
          if (currentModel) {
            setSelectedModel(currentModel);
          }
        } catch (error) {
          console.error('Failed to initialize ChatColumn defaults:', error);
        }
      };

      initializeDefaults();
    }, []);

    // 将消息按 prompt-response 配对
    const createMessagePairs = useCallback((messageList: CanvasMessage[]) => {
      const pairs: Array<{
        id: string;
        prompt: CanvasMessage;
        response?: CanvasMessage;
      }> = [];

      // 处理每个根消息的对话链
      const processChain = (messages: CanvasMessage[], startIndex = 0) => {
        for (let i = startIndex; i < messages.length; i++) {
          const currentMsg = messages[i];

          if (currentMsg.role === 'user') {
            // 查找这个用户消息的 AI 回复
            const aiResponse = messages.find(msg => msg.parentId === currentMsg.id && msg.role === 'assistant');

            pairs.push({
              id: currentMsg.id,
              prompt: currentMsg,
              response: aiResponse,
            });
          }
        }
      };

      // 按时间排序处理消息
      const sortedMessages = [...messageList].sort(
        (a, b) => new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime(),
      );

      processChain(sortedMessages);
      return pairs;
    }, []);

    // 使用 useMemo 缓存 messagePairs，避免每次渲染都重新计算
    const messagePairs = useMemo(() => createMessagePairs(column.messages), [column.messages, createMessagePairs]);

    // 检查滚动状态 - 使用节流的requestAnimationFrame确保流畅更新
    const rafRef = useRef<number>();
    const checkScrollState = useCallback(() => {
      const container = scrollContainerRef.current;
      if (!container) return;

      // 取消之前的更新请求，避免重复
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }

      // 使用requestAnimationFrame确保在浏览器重绘前更新状态
      rafRef.current = requestAnimationFrame(() => {
        const { scrollTop, scrollHeight, clientHeight } = container;
        const hasOverflow = scrollHeight > clientHeight;

        setScrollInfo({
          hasOverflow,
          scrollTop,
          scrollHeight,
          clientHeight,
        });
      });
    }, []);

    // 监听滚动和内容变化
    useEffect(() => {
      const container = scrollContainerRef.current;
      if (!container) return;

      const handleScroll = () => checkScrollState();
      const resizeObserver = new ResizeObserver(() => checkScrollState());

      container.addEventListener('scroll', handleScroll);
      resizeObserver.observe(container);

      // 初始检查
      checkScrollState();

      return () => {
        container.removeEventListener('scroll', handleScroll);
        resizeObserver.disconnect();
        // 清理pending的RAF
        if (rafRef.current) {
          cancelAnimationFrame(rafRef.current);
        }
      };
    }, [checkScrollState, messagePairs]);

    // 滚动条点击处理
    const handleScrollbarClick = useCallback((e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const container = scrollContainerRef.current;
      if (!container) return;

      const scrollbar = e.currentTarget as HTMLElement;
      const rect = scrollbar.getBoundingClientRect();
      const clickY = e.clientY - rect.top;
      const scrollbarHeight = rect.height;
      const percentage = clickY / scrollbarHeight;

      const maxScroll = container.scrollHeight - container.clientHeight;
      container.scrollTop = percentage * maxScroll;
    }, []);

    // 滚动条拖拽处理
    const handleScrollbarDrag = useCallback((e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(true);

      const container = scrollContainerRef.current;
      if (!container) return;

      const scrollbar = e.currentTarget.parentElement as HTMLElement;
      const scrollbarRect = scrollbar.getBoundingClientRect();
      const maxScroll = container.scrollHeight - container.clientHeight;

      // 预计算拖拽所需的常量，避免重复计算
      const thumbHeightPercent = Math.max(20, (container.clientHeight / container.scrollHeight) * 100);
      const availableRange = scrollbarRect.height * (1 - thumbHeightPercent / 100);
      const thumbCenterOffset = (scrollbarRect.height * thumbHeightPercent) / 100 / 2;

      let rafId: number;

      const handleMouseMove = (moveEvent: MouseEvent) => {
        // 取消之前的动画帧
        if (rafId) cancelAnimationFrame(rafId);

        rafId = requestAnimationFrame(() => {
          // 只做必要的计算
          const mouseY = moveEvent.clientY - scrollbarRect.top - thumbCenterOffset;
          const constrainedY = Math.max(0, Math.min(availableRange, mouseY));

          // 直接设置scrollTop，避免额外计算
          container.scrollTop = (constrainedY / availableRange) * maxScroll;
        });
      };

      const handleMouseUp = () => {
        setIsDragging(false);
        if (rafId) cancelAnimationFrame(rafId);
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }, []);

    // 拖拽检测处理
    const handleColumnMouseDown = useCallback((event: React.MouseEvent) => {
      // 记录拖拽起始位置
      dragStartPosition.current = { x: event.clientX, y: event.clientY };
      setIsColumnDragging(false);

      // 添加全局事件监听
      const handleMouseMove = (moveEvent: MouseEvent) => {
        if (!dragStartPosition.current) return;

        const deltaX = Math.abs(moveEvent.clientX - dragStartPosition.current.x);
        const deltaY = Math.abs(moveEvent.clientY - dragStartPosition.current.y);

        // 超过阈值认为是拖拽
        if (deltaX > DRAG_THRESHOLD || deltaY > DRAG_THRESHOLD) {
          setIsColumnDragging(true);
        }
      };

      const handleMouseUp = () => {
        // 清理事件监听
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        // 重置拖拽状态
        setTimeout(() => {
          dragStartPosition.current = null;
          setIsColumnDragging(false);
        }, 0);
      };

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }, []);

    // 点击列选择 - 现在会检查是否为拖拽
    const handleColumnClick = useCallback(
      (event: React.MouseEvent) => {
        event.stopPropagation();

        // 如果是拖拽操作，则不触发选择
        if (isColumnDragging) {
          return;
        }

        if (onSelect) {
          onSelect(column.id);
        }
      },
      [column.id, onSelect, isColumnDragging],
    );

    // 消息分叉处理
    const handleMessageBranch = useCallback(
      (messageId: string) => {
        console.log('TODO: Message branch logic', { columnId: column.id, messageId });
        if (onBranch) {
          onBranch(messageId);
        }
      },
      [column.id, onBranch],
    );

    // PrismInput 消息发送处理
    const handlePrismInputSend = useCallback(
      (message: string, options?: { tool?: ShortcutInterface; systemPrompt?: string; model?: string }) => {
        // 合并传入的 options 和当前选择的状态
        const finalOptions = {
          tool: options?.tool || selectedShortcut,
          systemPrompt: options?.systemPrompt || selectedSystemPrompt,
          model: options?.model || selectedModel,
        };

        console.log('PrismInput send logic', {
          columnId: column.id,
          message,
          tool: finalOptions.tool?.name,
          systemPrompt: finalOptions.systemPrompt,
          model: finalOptions.model,
        });

        const parentId = messagePairs.length > 0 ? messagePairs[messagePairs.length - 1].response?.id : undefined;

        if (onMessageCreate) {
          onMessageCreate(message, parentId, finalOptions);
        }
      },
      [column.id, onMessageCreate, messagePairs, selectedShortcut, selectedSystemPrompt, selectedModel],
    );

    // 键盘事件处理
    const handlePrismInputKeyDown = useCallback(
      (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        // 检测 Command+K (Mac) 或 Ctrl+K (Windows/Linux)
        if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
          e.preventDefault();
          e.stopPropagation();

          if (!isShortcutDropdownOpen && !isModelDropdownOpen && !isSystemPromptDropdownOpen) {
            setIsShortcutDropdownOpen(true);
          } else if (isShortcutDropdownOpen) {
            setIsSystemPromptDropdownOpen(true);
            setIsShortcutDropdownOpen(false);
          } else if (isSystemPromptDropdownOpen) {
            setIsModelDropdownOpen(true);
            setIsSystemPromptDropdownOpen(false);
          } else if (isModelDropdownOpen) {
            setIsShortcutDropdownOpen(true);
            setIsModelDropdownOpen(false);
          }
          return;
        }

        // 处理方向键菜单导航
        if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
          if (isShortcutDropdownOpen || isModelDropdownOpen || isSystemPromptDropdownOpen) {
            e.preventDefault();
            e.stopPropagation();

            if (e.key === 'ArrowRight') {
              if (isSystemPromptDropdownOpen) {
                setIsModelDropdownOpen(true);
                setIsSystemPromptDropdownOpen(false);
              } else if (isModelDropdownOpen) {
                setIsShortcutDropdownOpen(true);
                setIsModelDropdownOpen(false);
              } else if (isShortcutDropdownOpen) {
                setIsSystemPromptDropdownOpen(true);
                setIsShortcutDropdownOpen(false);
              }
            } else if (e.key === 'ArrowLeft') {
              if (isSystemPromptDropdownOpen) {
                setIsShortcutDropdownOpen(true);
                setIsSystemPromptDropdownOpen(false);
              } else if (isModelDropdownOpen) {
                setIsSystemPromptDropdownOpen(true);
                setIsModelDropdownOpen(false);
              } else if (isShortcutDropdownOpen) {
                setIsModelDropdownOpen(true);
                setIsShortcutDropdownOpen(false);
              }
            }
            return;
          }
        }

        // 处理ESC键层级控制
        if (e.key === 'Escape') {
          if (isShortcutDropdownOpen || isSystemPromptDropdownOpen || isModelDropdownOpen) {
            setIsShortcutDropdownOpen(false);
            setIsSystemPromptDropdownOpen(false);
            setIsModelDropdownOpen(false);
            e.stopPropagation();
            e.preventDefault();

            // 短暂延迟后重新聚焦输入框
            setTimeout(() => {
              prismInputRef.current?.focus();
            }, 10);
            return;
          } else if (isFocused && onExitFocus) {
            // 如果没有下拉菜单打开且处于聚焦状态，则退出聚焦模式
            onExitFocus();
            e.stopPropagation();
            e.preventDefault();
            return;
          }
        }
      },
      [isShortcutDropdownOpen, isSystemPromptDropdownOpen, isModelDropdownOpen, isFocused, onExitFocus],
    );

    // 全局键盘事件监听（用于ESC键退出聚焦模式）
    useEffect(() => {
      const handleGlobalKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape' && isFocused && onExitFocus) {
          onExitFocus();
          e.stopPropagation();
          e.preventDefault();
        }
      };

      if (isFocused) {
        document.addEventListener('keydown', handleGlobalKeyDown);
        return () => document.removeEventListener('keydown', handleGlobalKeyDown);
      }
    }, [isFocused, onExitFocus]);

    // 快捷键选择处理
    const handleShortcutSelect = useCallback(
      (shortcut: ShortcutInterface, withCommand?: boolean) => {
        console.log('Shortcut selected:', { shortcut: shortcut.name, withCommand });
        if (withCommand) {
          // Command+click: 保存为默认快捷键但不发送
          setSelectedShortcut(shortcut);
        } else if (inputValue.trim()) {
          // 常规点击且有输入内容：自动发送消息
          handlePrismInputSend(inputValue.trim(), { tool: shortcut });
          setInputValue('');
        } else {
          // 常规点击但无输入内容：仅保存到状态
          setSelectedShortcut(shortcut);
        }
        setIsShortcutDropdownOpen(false);
      },
      [inputValue, handlePrismInputSend],
    );

    // 系统提示词选择处理
    const handleSystemPromptSelect = useCallback(
      (preset: SystemPresetInterface, withCommand?: boolean) => {
        console.log(`[${new Date().toLocaleTimeString()}.${Date.now() % 1000}] System prompt selected:`, {
          preset: preset.name,
          withCommand,
        });
        if (withCommand && inputValue.trim()) {
          handlePrismInputSend(inputValue.trim(), { systemPrompt: preset.hbs });
          setInputValue('');
        } else {
          // 常规选择：保存到状态
          setSelectedSystemPrompt(preset.hbs);
        }
        setIsSystemPromptDropdownOpen(false);
      },
      [inputValue, handlePrismInputSend],
    );

    // 模型选择处理
    const handleModelSelect = useCallback(
      (model: string, withCommand?: boolean) => {
        console.log(`[${new Date().toLocaleTimeString()}.${Date.now() % 1000}] Model selected:`, {
          model,
          withCommand,
        });
        if (withCommand && inputValue.trim()) {
          handlePrismInputSend(inputValue.trim(), { model });
          setInputValue('');
        } else {
          // 常规选择：保存到状态
          setSelectedModel(model);
        }
        setIsModelDropdownOpen(false);
      },
      [inputValue, handlePrismInputSend],
    );

    // 使用 useCallback 包装状态更新函数，避免每次渲染都创建新的引用
    const handleShortcutDropdownStatusChange = useCallback((open: boolean) => {
      setIsShortcutDropdownOpen(open);
    }, []);

    const handleSystemPromptDropdownStatusChange = useCallback((open: boolean) => {
      setIsSystemPromptDropdownOpen(open);
    }, []);

    const handleModelDropdownStatusChange = useCallback((open: boolean) => {
      setIsModelDropdownOpen(open);
    }, []);

    const columnClasses = [
      'flex flex-col',
      'transition-all duration-200',
      'bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-gray-200 dark:border-slate-700',
      'h-[80vh]', // 固定高度为视口高度的80%
      'ChatColumn', // 添加这个类名用于边界检测
      'font-compensated', // 添加字体补偿类
      // 在聚焦模式下启用文本选择
      isFocused && 'select-text',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <div
        ref={ref}
        className={columnClasses}
        style={
          {
            width: `${width}vw`,
            minWidth: '640px',
            '--font-compensation': '1.0',
          } as React.CSSProperties
        }
        onClick={handleColumnClick}
        onDoubleClick={onDoubleClick}
        onMouseDown={e => {
          // 在 focus 模式下，只阻止事件传播到画布，允许文本选择
          if (isFocused) {
            e.stopPropagation();
            return;
          }

          // 启动拖拽检测
          handleColumnMouseDown(e);
        }}>
        {/* 列头部 */}
        <div
          className={`flex-shrink-0 px-4 py-3 border-b rounded-t-lg ${
            isFocused ? 'bg-black border-gray-800' : 'border-gray-200 dark:border-slate-700'
          }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className={`w-2 h-2 rounded-full ${
                  isActive ? (isFocused ? 'bg-white' : 'bg-green-500') : isFocused ? 'bg-white/70' : 'bg-gray-400'
                }`}
              />
              <h3
                className={`text-sm font-medium truncate ${
                  isFocused ? 'text-white' : 'text-gray-900 dark:text-gray-100'
                }`}>
                {column.metadata.title || `Column ${column.id.slice(-8)}`}
                {isFocused && (
                  <span className="ml-2 text-xs text-white cursor-help" title="Press ESC key to exit focus mode">
                    <kbd className="px-1.5 py-0.5 text-xs font-semibold text-gray-800 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded mr-1">
                      ESC
                    </kbd>
                    to unpin
                  </span>
                )}
              </h3>
            </div>

            <div className="flex items-center gap-1">
              <span className={`text-xs ${isFocused ? 'text-white/80' : 'text-gray-500 dark:text-gray-400'}`}>
                {column.messages.length} msg{column.messages.length !== 1 ? 's' : ''}
              </span>

              {/* Focus 模式快捷键提示 */}
              {isFocused && (
                <div className="relative group">
                  <button
                    className="p-1 hover:bg-white/20 rounded text-xs text-white/80 hover:text-white transition-all"
                    title="Keyboard shortcuts">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </button>
                  <div className="absolute right-0 top-full mt-1 w-48 bg-gray-900 text-white text-xs rounded-lg shadow-lg p-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <div className="font-medium mb-1">Keyboard Shortcuts:</div>
                    <div className="space-y-1">
                      <div>← → Switch columns</div>
                      <div>↑ ↓ Switch rows</div>
                      <div>ESC Exit focus</div>
                    </div>
                  </div>
                </div>
              )}

              {/* 列操作按钮 */}
              <button
                className={`p-1 rounded text-xs transition-all ${
                  isFocused
                    ? 'hover:bg-white/20 text-white/80 hover:text-white'
                    : 'hover:bg-gray-200 dark:hover:bg-slate-600 opacity-60 hover:opacity-100'
                }`}
                title="Branch conversation"
                onClick={e => {
                  e.stopPropagation();
                  const lastMessage = column.messages[column.messages.length - 1];
                  if (lastMessage) {
                    handleMessageBranch(lastMessage.id);
                  }
                }}>
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* 分叉信息 */}
          {column.parentColumnId && (
            <div className="mt-2 flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
                />
              </svg>
              <span>
                Branched from {column.parentColumnId} @ {column.branchPoint}
              </span>
            </div>
          )}
        </div>

        {/* 消息内容区域容器 - 相对定位用于滚动条定位 */}
        <div className="flex-grow relative">
          {/* 消息内容区域 - 可滚动 */}
          <div
            ref={scrollContainerRef}
            className="absolute inset-0 p-4 overflow-y-auto pr-2 select-text scrollbar-hide"
            style={{
              scrollbarWidth: 'none' /* Firefox */,
              msOverflowStyle: 'none' /* IE and Edge */,
            }}>
            {messagePairs.length === 0 ? (
              /* 空状态 */
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="w-12 h-12 bg-gray-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg
                      className="w-6 h-6 text-gray-400 dark:text-gray-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                      />
                    </svg>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">No messages yet</p>
                </div>
              </div>
            ) : (
              /* 消息对话列表 */
              <div className="space-y-2">
                {messagePairs.map(pair => (
                  <div key={pair.id} data-message-id={pair.prompt.id}>
                    {/* DialogPanel-style message implementation */}
                    <div className="space-y-1">
                      {/* User message (prompt) - DialogPanel style */}
                      <div
                        className={`relative text-sky-600 mb-1 leading-relaxed text-base font-medium select-text ${
                          highlightedMessageId === pair.prompt.id ? 'ring-2 ring-yellow-400 rounded p-1' : ''
                        }`}>
                        <div className="pr-8 select-text">
                          {typeof pair.prompt.content === 'string'
                            ? pair.prompt.content
                            : JSON.stringify(pair.prompt.content)}
                        </div>
                      </div>

                      {/* AI response - DialogPanel style */}
                      {pair.response ? (
                        <div
                          className={`relative text-black mb-3 leading-relaxed text-base font-medium select-text ${
                            highlightedMessageId === pair.response.id ? 'ring-2 ring-yellow-400 rounded p-1' : ''
                          }`}>
                          <div className="pr-8 whitespace-pre-wrap select-text">
                            {typeof pair.response.content === 'string'
                              ? pair.response.content
                              : JSON.stringify(pair.response.content)}
                          </div>
                          <button
                            onClick={() => handleMessageBranch(pair.response!.id)}
                            className="mt-2 text-xs text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
                            Branch from here
                          </button>
                        </div>
                      ) : (
                        // Show thinking animation when there's no response yet
                        <div className="relative mb-3 py-2">
                          <ThinkingAnimation className="py-2" />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 右侧迷你滚动条指示器 - 固定在容器右侧 */}
          {scrollInfo.hasOverflow && (
            <div
              className="absolute right-1 top-2 bottom-2 w-3 bg-gray-200/50 dark:bg-slate-600/50 rounded-full cursor-pointer hover:bg-gray-200/70 dark:hover:bg-slate-600/70 transition-colors"
              onClick={handleScrollbarClick}>
              <div
                className={`w-full rounded-full transition-colors duration-200 cursor-grab ${
                  isDragging
                    ? 'cursor-grabbing bg-gray-600 dark:bg-slate-300'
                    : 'bg-gray-400 dark:bg-slate-400 hover:bg-gray-500 dark:hover:bg-slate-300'
                }`}
                style={{
                  height: `${Math.max(20, (scrollInfo.clientHeight / scrollInfo.scrollHeight) * 100)}%`,
                  transform: `translateY(${(() => {
                    if (scrollInfo.scrollHeight <= scrollInfo.clientHeight) return 0;

                    const maxScroll = scrollInfo.scrollHeight - scrollInfo.clientHeight;
                    const scrollRatio = scrollInfo.scrollTop / maxScroll;
                    const thumbHeight = Math.max(20, (scrollInfo.clientHeight / scrollInfo.scrollHeight) * 100);
                    const maxPosition = 100 - thumbHeight;

                    // 修复：将轨道百分比转换为相对于滚动条自身的百分比
                    const trackPositionPercent = scrollRatio * maxPosition;
                    const thumbPositionPercent = (trackPositionPercent / thumbHeight) * 100;

                    return thumbPositionPercent;
                  })()}%)`,
                }}
                onMouseDown={handleScrollbarDrag}
              />
            </div>
          )}
        </div>

        {/* 底部输入和元数据区域 */}
        <div className="flex-shrink-0 p-3">
          {/* PrismInput implementation */}
          <PrismInput
            ref={prismInputRef}
            className="nodrag"
            value={inputValue}
            placeholder="Type your message..."
            minRows={1}
            maxRows={5}
            onValueChange={setInputValue}
            onSend={handlePrismInputSend}
            onKeyDown={handlePrismInputKeyDown}
            // 显示控制工具区域
            showShortcutDropdown={true}
            showSystemPromptDropdown={true}
            showModelSelector={true}
            // 控制组件回调
            onShortcutDropdownStatusChange={handleShortcutDropdownStatusChange}
            onSystemPromptDropdownStatusChange={handleSystemPromptDropdownStatusChange}
            onModelDropdownStatusChange={handleModelDropdownStatusChange}
            // 快捷键选择回调
            onShortcutSelect={handleShortcutSelect}
            onSystemPromptSelect={handleSystemPromptSelect}
            onModelSelect={handleModelSelect}
            // 按钮布局配置
            buttonLayout="inline"
            buttonAlignment="space-between"
          />
        </div>
      </div>
    );
  },
);

ChatColumn.displayName = 'ChatColumn';

export default ChatColumn;
