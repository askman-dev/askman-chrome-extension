import React, { Fragment, useRef, useEffect, useState } from 'react';
import { Menu, MenuButton, MenuItem, MenuItems, Transition } from '@headlessui/react';
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
}: DropdownProps) {
  const [isOpened, setIsOpen] = useState(initOpen);
  const [isCommandPressed, setIsCommandPressed] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuItemsRef = useRef<(HTMLButtonElement | null)[]>([]);
  const menuRef = useRef<HTMLDivElement>(null);

  const selectedIndex = selectedId ? items.findIndex(item => item.id === selectedId) : 0;

  useEffect(() => {
    if (initOpen && !isOpened) {
      buttonRef.current?.click();
    } else if (!initOpen && isOpened) {
      buttonRef.current?.click();
    }
  }, [initOpen, isOpened]);

  useEffect(() => {
    statusListener(isOpened);
    if (isOpened) {
      const targetIndex = selectedIndex >= 0 ? selectedIndex : 0;
      setTimeout(() => menuItemsRef.current[targetIndex]?.focus(), 0);
    }
  }, [isOpened, selectedIndex, statusListener]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Command 或 Ctrl 按下
    if (e.metaKey || e.ctrlKey) {
      setIsCommandPressed(true);
    }

    // ESC 键处理
    if (e.key === 'Escape' && isOpened) {
      e.preventDefault();
      e.stopPropagation();
      setIsOpen(false);
      statusListener(false);
      return;
    }

    // Enter 时直接发送
    if (e.key === 'Enter') {
      e.preventDefault();
      e.stopPropagation();
      const selectedItemIndex = selectedIndex >= 0 ? selectedIndex : 0;
      const selectedItem = items[selectedItemIndex];
      if (selectedItem) {
        onItemClick(selectedItem, isCommandPressed);
        statusListener(false);
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

  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      if (!isOpened) return;

      const isClickInMenu = menuRef.current?.contains(e.target as Node);
      const isClickInButton = buttonRef.current?.contains(e.target as Node);

      if (isClickInMenu || isClickInButton) {
        e.preventDefault();
        e.stopPropagation();
        return;
      }

      setIsOpen(false);
    };

    document.addEventListener('mousedown', handleMouseDown, false);
    return () => document.removeEventListener('mousedown', handleMouseDown, false);
  }, [isOpened]);

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
        <MenuButton
          ref={buttonRef}
          className={classNames(
            'group inline-flex max-w-[12rem] justify-center rounded-md text-sm text-gray-600 px-2 py-1 text-sm font-medium text-black hover:bg-black/10 focus:outline-none',
            { 'bg-black/10': initOpen || isOpened },
          )}
          onClick={e => {
            e.stopPropagation();
            // const target = e.target as Element;
            // const currentTarget = e.currentTarget as Element;
            // 区分真实点击和虚拟点击
            if (e.isTrusted) {
              // console.log('[BaseDropdown] MenuButton real click - target:', target.tagName, 'currentTarget:', currentTarget.tagName);
              // 调用外部传入的点击处理函数
              onMainButtonClick?.(e);
            }
          }}
          onMouseEnter={() => {
            setIsOpen(true);
          }}
          onMouseLeave={() => {
            setIsOpen(false);
          }}>
          {({ active }) => {
            console.log('[Dropdown] Menu.Button render with active:', active, 'current isOpened:', isOpened);
            setIsOpen(active);
            return (
              <>
                <div className="relative inline-block">
                  <span
                    className="truncate max-w-[6rem] text-right inline-flex items-center"
                    dir="rtl"
                    title={typeof displayName === 'string' ? displayName : 'Untitled'}>
                    {typeof displayName === 'string' ? displayName : 'Untitled'}
                  </span>
                  <div className="absolute left-1/2 -translate-x-1/2 -top-8 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-20">
                    {typeof displayName === 'string' ? displayName : 'Untitled'}
                  </div>
                </div>
                {showShortcut && <span className="flex-shrink-0 pl-1">{shortcutKey}</span>}
                {buttonDisplay ? (
                  <span className="-mr-1 h-5 w-5 ml-1 text-violet-200 flex-shrink-0">{buttonDisplay}</span>
                ) : (
                  <ChevronDownIcon className="-mr-1 h-5 w-5 text-violet-200 flex-shrink-0" />
                )}
              </>
            );
          }}
        </MenuButton>

        <Transition
          as={Fragment}
          enter="transition ease-out duration-50"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-35"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95">
          <MenuItems
            static
            className={`absolute ${
              align === 'left' ? 'left-0' : 'right-0'
            } mt-0 min-w-[10rem] origin-top-right divide-y divide-gray-100 rounded bg-white shadow-lg ring-1 ring-black/5 focus:outline-none z-10`}
            onKeyDown={e => {
              if (e.key === 'Escape') {
                e.preventDefault();
                e.stopPropagation();
                setIsOpen(false);
                statusListener(false);
              }
            }}
            onMouseEnter={() => {
              setIsOpen(true);
            }}
            onMouseLeave={() => setIsOpen(false)}>
            <div className="px-1 py-1">
              {items.map((item, index) => (
                <MenuItem key={item.id}>
                  {({ active }) => {
                    return (
                      <button
                        ref={el => (menuItemsRef.current[index] = el)}
                        className="w-full focus:outline-none"
                        onClick={() => {
                          onItemClick(item, isCommandPressed);
                          statusListener(false);
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
        </Transition>
      </Menu>
    </div>
  );
}

// 导出兼容性的BaseDropdown别名
export const BaseDropdown = Dropdown;

export default Dropdown;
