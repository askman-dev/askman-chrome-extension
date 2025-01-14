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
  renderItem?: (_item: any, _index: number, _active: boolean) => React.ReactElement;
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
}: BaseDropdownProps) {
  const [isOpened, setIsOpen] = useState(initOpen);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuItemsRef = useRef<(HTMLButtonElement | null)[]>([]);
  let isCommandPressed = false;
  let closeDropdownTimer: any;

  useEffect(() => {
    if (initOpen && !isOpened) {
      buttonRef.current?.click();
    } else if (!initOpen && isOpened) {
      buttonRef.current?.click();
    }
  }, [initOpen]);

  useEffect(() => {
    statusListener(isOpened);
    if (isOpened) {
      setTimeout(() => menuItemsRef.current[0]?.focus(), 0);
    }
  }, [isOpened]);

  const handleKeyDown = (_e: React.KeyboardEvent) => {
    // Keyboard navigation logic can be added here
  };

  usePreventOverflowHidden();

  const defaultRenderItem = (item: any, index: number, active: boolean) => (
    <button
      ref={el => (menuItemsRef.current[index] = el)}
      className={`${
        active ? 'bg-black text-white' : 'text-gray-900'
      } group flex w-full items-center rounded-md px-2 py-2 text-sm focus:outline-none`}
      onClick={() => {
        onItemClick(item, isCommandPressed);
        setIsOpen(false);
      }}
      onMouseDown={() => {
        onItemClick(item, isCommandPressed);
        setIsOpen(false);
      }}
      onKeyDown={e => {
        if (e.key === 'Enter') {
          isCommandPressed = e.metaKey || e.ctrlKey;
        }
      }}>
      <span className="mr-2 inline-flex items-center justify-center w-5 h-5 text-xs font-semibold border border-gray-300 rounded">
        {index}
      </span>
      {item.name}
      {active ? (
        <>
          <div className="grow"></div>
          <span
            className="inline-flex items-center justify-center w-[3rem] h-5 text-xs font-semibold"
            title="Quick Send">
            {navigator.platform.includes('Mac') ? '⌘ ↩︎' : 'Ctrl ↩︎'}
          </span>
        </>
      ) : null}
    </button>
  );

  return (
    <div className={classNames(`${className}`)} onKeyDown={handleKeyDown} aria-haspopup="true" aria-expanded={isOpened}>
      <Menu as="div" className="relative" style={{ isolation: 'isolate' }}>
        <MenuButton
          ref={buttonRef}
          className="inline-flex w-full justify-center rounded-md text-sm text-gray-600 bg-white px-2 py-1 text-sm font-medium text-black hover:bg-black/10 focus:outline-none min-w-0"
          onMouseEnter={() => {
            setIsOpen(true);
          }}
          onMouseLeave={() => {
            closeDropdownTimer = setTimeout(() => setIsOpen(false), 100);
          }}>
          {({ active }) => {
            setIsOpen(active);
            return (
              <>
                <span className="truncate max-w-[8rem] text-right" dir="rtl">
                  {displayName}
                </span>{' '}
                {shortcutKey}
                <ChevronDownIcon className="-mr-1 h-5 w-5 text-violet-200" />
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
            className="absolute left-0 mt-0 min-w-[16rem] origin-top-right divide-y divide-gray-100 rounded bg-white shadow-lg ring-1 ring-black/5 focus:outline-none z-10"
            onMouseEnter={() => {
              clearTimeout(closeDropdownTimer);
              setIsOpen(true);
            }}
            onMouseLeave={() => setIsOpen(false)}>
            <div className="px-1 py-1">
              {items.map((item, index) => (
                <MenuItem key={item.id}>
                  {({ active }) =>
                    renderItem ? renderItem(item, index, active) : defaultRenderItem(item, index, active)
                  }
                </MenuItem>
              ))}
            </div>
          </MenuItems>
        </Transition>
      </Menu>
    </div>
  );
}
