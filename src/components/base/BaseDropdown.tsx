import React, { Fragment, useRef, useEffect, useState } from 'react';
import { Menu, MenuButton, MenuItem, MenuItems, Transition } from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/20/solid';
import classNames from 'classnames';
import { usePreventOverflowHidden } from '@src/shared/hooks/usePreventOverflowHidden';

export interface BaseDropdownProps {
  displayName: string;
  className?: string;
  onItemClick: (_item: any, _isCommandPressed: boolean) => void;
  statusListener: (_status: boolean) => void;
  initOpen: boolean;
  items: Array<{
    id: string;
    name: string;
    shortName?: string;
  }>;
  shortcutKey?: string;
  renderItem?: (_item: any, _index: number, _active: boolean, _isSelected?: boolean) => React.ReactElement;
  selectedId?: string;
  showShortcut?: boolean;
  align?: 'left' | 'right';
}

export function BaseDropdown({
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
}: BaseDropdownProps) {
  const [isOpened, setIsOpen] = useState(initOpen);
  const [isCommandPressed, setIsCommandPressed] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuItemsRef = useRef<(HTMLButtonElement | null)[]>([]);
  let closeDropdownTimer: any;
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
  }, [isOpened, selectedIndex]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.metaKey) {
      setIsCommandPressed(true);
    }
  };

  const handleKeyUp = (e: React.KeyboardEvent) => {
    if (!e.metaKey) {
      setIsCommandPressed(false);
    }
  };

  usePreventOverflowHidden();

  const defaultRenderItem = (item: any, index: number, active: boolean, isSelected?: boolean) => (
    <div
      className={`${
        active ? 'bg-black text-white' : 'text-gray-900'
      } group flex w-full items-center rounded-md px-2 py-2 text-sm`}>
      <span className="mr-2 inline-flex items-center justify-center w-5 h-5 text-xs font-semibold border border-gray-300 rounded">
        {index}
      </span>
      <span className="flex items-center justify-between w-full">
        <span>{item.name}</span>
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
      if (!isOpened) {
        return;
      }

      const isClickInMenu = menuRef.current?.contains(e.target as Node);
      const isClickInButton = buttonRef.current?.contains(e.target as Node);

      if (isClickInMenu || isClickInButton) {
        e.preventDefault();
        e.stopPropagation();
        return;
      }

      setIsOpen(false);
    };

    document.addEventListener('mousedown', handleMouseDown, true);
    return () => document.removeEventListener('mousedown', handleMouseDown, true);
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
          className="group inline-flex max-w-[12rem] justify-center rounded-md text-sm text-gray-600 bg-white px-2 py-1 text-sm font-medium text-black hover:bg-black/10 focus:outline-none"
          onMouseEnter={() => {
            setIsOpen(true);
          }}
          onMouseLeave={() => {
            closeDropdownTimer = setTimeout(() => {
              setIsOpen(false);
            }, 100);
          }}>
          {({ active }) => {
            setIsOpen(active);
            return (
              <>
                <div className="relative inline-block">
                  <span
                    className="truncate max-w-[6rem] text-right inline-block"
                    dir="rtl"
                    title={typeof displayName === 'string' ? displayName : 'Untitled'}>
                    {typeof displayName === 'string' ? displayName : 'Untitled'}
                  </span>
                  <div className="absolute left-1/2 transform -translate-x-1/2 -top-8 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 transition-opacity group-hover:opacity-100 pointer-events-none whitespace-nowrap z-20">
                    {typeof displayName === 'string' ? displayName : 'Untitled'}
                  </div>
                </div>
                {showShortcut && <span className="flex-shrink-0 pl-1">{shortcutKey}</span>}
                <ChevronDownIcon className="-mr-1 h-5 w-5 text-violet-200 flex-shrink-0" />
              </>
            );
          }}
        </MenuButton>

        <Transition
          as={Fragment}
          enter="transition ease-out duration-100"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95">
          <MenuItems
            static
            className={`absolute ${
              align === 'left' ? 'left-0' : 'right-0'
            } mt-0 min-w-[16rem] origin-top-right divide-y divide-gray-100 rounded bg-white shadow-lg ring-1 ring-black/5 focus:outline-none z-10`}
            onMouseEnter={() => {
              clearTimeout(closeDropdownTimer);
              setIsOpen(true);
            }}
            onMouseLeave={() => setIsOpen(false)}>
            <div className="px-1 py-1">
              {items.map((item, index) => (
                <MenuItem key={item.id}>
                  {({ active }) => (
                    <button
                      ref={el => (menuItemsRef.current[index] = el)}
                      className="w-full focus:outline-none"
                      onClick={() => {
                        onItemClick(item, isCommandPressed);
                        statusListener(false);
                      }}
                      autoFocus={index === selectedIndex}>
                      {renderItem
                        ? renderItem(item, index, active, item.id === selectedId)
                        : defaultRenderItem(item, index, active, item.id === selectedId)}
                    </button>
                  )}
                </MenuItem>
              ))}
            </div>
          </MenuItems>
        </Transition>
      </Menu>
    </div>
  );
}
