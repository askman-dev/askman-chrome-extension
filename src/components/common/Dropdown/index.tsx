import React, { Fragment, useRef, useEffect, useState } from 'react';
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/20/solid';
import classNames from 'classnames';
import { usePreventOverflowHidden } from '@src/shared/hooks/usePreventOverflowHidden';

export interface DropdownProps {
  displayName: string;
  className?: string;
  onItemClick: (_item: Record<string, unknown>, _isCommandPressed: boolean) => void;
  statusListener: (_status: boolean) => void;
  initOpen: boolean;
  items: Array<{
    id: string;
    name: string;
    shortName?: string;
  }>;
  shortcutKey?: string;
  renderItem?: (
    _item: Record<string, unknown>,
    _index: number,
    _active: boolean,
    _isSelected?: boolean,
  ) => React.ReactElement;
  selectedId?: string;
  showShortcut?: boolean;
  align?: 'left' | 'right';
  buttonDisplay?: string;
  onMainButtonClick?: (_e: React.MouseEvent) => void;
  hoverMessage?: string;
}

export function Dropdown({
  displayName,
  className,
  onItemClick,
  statusListener,
  initOpen,
  items,
  shortcutKey = '⌘ K',
  renderItem,
  selectedId,
  showShortcut = true,
  align = 'left',
  buttonDisplay,
  onMainButtonClick,
  hoverMessage,
}: DropdownProps) {
  const [isCommandPressed, setIsCommandPressed] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuItemsRef = useRef<(HTMLButtonElement | null)[]>([]);
  const menuRef = useRef<HTMLDivElement>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout>();
  const isClosingRef = useRef(false); // 防止关闭后立即重新打开

  const selectedIndex = selectedId ? items.findIndex(item => item.id === selectedId) : 0;

  // 移除自己的状态管理，完全依赖 HeadlessUI 的状态，避免状态冲突
  // useEffect(() => {
  //   if (initOpen && !isOpened) {
  //     setIsOpen(true);
  //   } else if (!initOpen && isOpened) {
  //     setIsOpen(false);
  //   }
  // }, [initOpen]);

  // 直接使用 initOpen 作为状态，让 HeadlessUI 管理打开/关闭
  useEffect(() => {
    statusListener(initOpen);
    if (initOpen) {
      const targetIndex = selectedIndex >= 0 ? selectedIndex : 0;
      setTimeout(() => menuItemsRef.current[targetIndex]?.focus(), 0);
    }
  }, [initOpen, selectedIndex, statusListener]);

  // 同步 initOpen 到 HeadlessUI 状态
  const openMenuRef = useRef<(() => void) | null>(null);
  const closeMenuRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (initOpen && openMenuRef.current) {
      openMenuRef.current();
    } else if (!initOpen && closeMenuRef.current) {
      closeMenuRef.current();
    }
  }, [initOpen]);

  // 清理定时器
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  // 移除自定义mousedown监听器，让HeadlessUI处理outside click
  // HeadlessUI Menu 自动处理outside click关闭行为

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Command 或 Ctrl 按下
    if (e.metaKey || e.ctrlKey) {
      setIsCommandPressed(true);
    }

    // ESC 键处理 - 由父组件管理状态，不在这里直接修改
    if (e.key === 'Escape' && initOpen) {
      e.preventDefault();
      e.stopPropagation();
      // 通过 statusListener 通知父组件关闭
      statusListener(false);
      return;
    }

    // Enter 时直接发送
    if (e.key === 'Enter') {
      e.preventDefault();
      e.stopPropagation();

      // 清除悬停定时器，防止冲突
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }

      // 设置关闭标志，防止其他事件重新打开菜单
      isClosingRef.current = true;

      // 先关闭菜单，防止闪烁
      statusListener(false);

      // 延迟重置关闭标志
      setTimeout(() => {
        isClosingRef.current = false;
      }, 33);

      const selectedItemIndex = selectedIndex >= 0 ? selectedIndex : 0;
      const selectedItem = items[selectedItemIndex];
      if (selectedItem) {
        onItemClick(selectedItem, isCommandPressed);
      }
    }
  };

  const handleKeyUp = (e: React.KeyboardEvent) => {
    if (!e.metaKey && !e.ctrlKey) {
      setIsCommandPressed(false);
    }
  };

  usePreventOverflowHidden();

  const defaultRenderItem = (item: Record<string, unknown>, index: number, active: boolean, isSelected?: boolean) => (
    <div
      className={`${
        active ? 'bg-black text-white' : 'text-gray-900'
      } group flex w-full items-center rounded-md px-2 py-2 text-sm`}>
      <span className="mr-2 inline-flex items-center justify-center w-5 h-5 text-xs font-semibold border border-gray-300 rounded">
        {index}
      </span>
      <span className="flex items-center justify-between w-full">
        <span>{typeof item.name === 'string' ? item.name : 'Untitled'}</span>
        {isSelected ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-black"
            viewBox="0 0 20 20"
            fill="currentColor">
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
        ) : active && showShortcut ? (
          <span
            className="inline-flex items-center justify-center w-[3rem] h-5 text-xs font-semibold"
            title="Quick Send">
            {navigator.platform.includes('Mac') ? '⌘ ↩︎' : 'Ctrl ↩︎'}
          </span>
        ) : null}
      </span>
    </div>
  );

  return (
    <div
      ref={menuRef}
      className={classNames(`${className}`)}
      onMouseDown={e => {
        e.stopPropagation();
      }}
      onKeyDown={handleKeyDown}
      onKeyUp={handleKeyUp}>
      <Menu as="div" className="relative">
        {({ open, close }) => {
          // 保存 open/close 函数引用
          openMenuRef.current = () => {
            if (!open) {
              buttonRef.current?.click();
            }
          };
          closeMenuRef.current = close;

          return (
            <>
              <MenuButton
                ref={buttonRef}
                className={classNames(
                  'group inline-flex max-w-[12rem] justify-center rounded-md text-sm text-gray-400 px-2 py-1 text-sm font-medium hover:bg-black/10 focus:outline-none',
                  { 'bg-black/10': initOpen || open },
                )}
                onClick={e => {
                  e.stopPropagation();
                  if (e.isTrusted) {
                    onMainButtonClick?.(e);
                  }
                }}
                onMouseEnter={() => {
                  // 清除之前的关闭定时器
                  if (hoverTimeoutRef.current) {
                    clearTimeout(hoverTimeoutRef.current);
                  }
                  // 如果正在关闭过程中，不要重新打开
                  if (isClosingRef.current) {
                    return;
                  }
                  // 悬停时自动打开菜单
                  if (!initOpen) {
                    statusListener(true);
                  }
                }}
                onFocus={() => {
                  // 如果正在关闭过程中，不要重新打开
                  if (isClosingRef.current) {
                    return;
                  }
                  // 获得焦点时自动打开菜单
                  if (!initOpen) {
                    statusListener(true);
                  }
                }}
                onBlur={() => {
                  // 失去焦点时延迟关闭菜单（给用户时间移动到菜单上）
                  if (initOpen) {
                    hoverTimeoutRef.current = setTimeout(() => {
                      statusListener(false);
                    }, 50);
                  }
                }}
                onMouseLeave={() => {
                  // 延迟关闭菜单，给用户时间移动到菜单上
                  if (initOpen) {
                    hoverTimeoutRef.current = setTimeout(() => {
                      statusListener(false);
                    }, 50);
                  }
                }}>
                {showShortcut && (
                  <span
                    className="bg-gray-100 text-gray-600 rounded text-xs mr-1 flex-shrink-0"
                    style={{ marginRight: '4px', padding: '2px 6px' }}>
                    {shortcutKey}
                  </span>
                )}
                <div className="relative inline-block">
                  <span
                    className="truncate max-w-[6rem] text-left inline-flex items-center"
                    title={typeof displayName === 'string' ? displayName : 'Untitled'}>
                    {typeof displayName === 'string' ? displayName : 'Untitled'}
                  </span>
                  <div className="absolute left-1/2 -translate-x-1/2 -top-8 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50">
                    {hoverMessage || (typeof displayName === 'string' ? displayName : 'Untitled')}
                  </div>
                </div>
                {buttonDisplay ? (
                  <span className="-mr-1 h-5 w-5 ml-1 flex-shrink-0">{buttonDisplay}</span>
                ) : (
                  <ChevronDownIcon className="-mr-1 h-5 w-5 flex-shrink-0" />
                )}
              </MenuButton>

              <MenuItems
                className={`absolute ${
                  align === 'left' ? 'left-0' : 'right-0'
                } mt-0 min-w-[10rem] origin-top-right divide-y divide-gray-100 rounded bg-white shadow-lg ring-1 ring-black/5 focus:outline-none z-[9999]`}
                onMouseEnter={() => {
                  // 鼠标进入菜单区域时，清除关闭定时器
                  if (hoverTimeoutRef.current) {
                    clearTimeout(hoverTimeoutRef.current);
                  }
                  // 如果正在关闭过程中，不要干预
                  if (isClosingRef.current) {
                    return;
                  }
                }}
                onMouseLeave={() => {
                  // 鼠标离开菜单区域时，延迟关闭
                  hoverTimeoutRef.current = setTimeout(() => {
                    statusListener(false);
                  }, 50);
                }}>
                <div className="px-1 py-1">
                  {items.map((item, index) => (
                    <MenuItem key={item.id}>
                      {({ active }) => {
                        return (
                          <button
                            ref={el => (menuItemsRef.current[index] = el)}
                            className="w-full focus:outline-none"
                            onClick={e => {
                              // 清除悬停定时器，确保点击后菜单立即关闭
                              if (hoverTimeoutRef.current) {
                                clearTimeout(hoverTimeoutRef.current);
                              }

                              // 设置关闭标志，防止hover事件重新打开菜单
                              isClosingRef.current = true;

                              // 通知父组件关闭菜单
                              statusListener(false);

                              // 延迟重置关闭标志，给足够时间完成关闭操作
                              setTimeout(() => {
                                isClosingRef.current = false;
                              }, 33);

                              // 从实际的鼠标事件检测Command/Ctrl键
                              const actualCommandPressed = e.metaKey || e.ctrlKey;
                              onItemClick(item, actualCommandPressed);
                            }}>
                            {renderItem
                              ? renderItem(item, index, active, item.id === selectedId)
                              : defaultRenderItem(item, index, active, item.id === selectedId)}
                          </button>
                        );
                      }}
                    </MenuItem>
                  ))}
                </div>
              </MenuItems>
            </>
          );
        }}
      </Menu>
    </div>
  );
}

// 导出兼容性的BaseDropdown别名
export const BaseDropdown = Dropdown;

export default Dropdown;
