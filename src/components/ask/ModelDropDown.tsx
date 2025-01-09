import React, { Fragment, useRef, useEffect, useState } from 'react';
import { Menu, MenuButton, MenuItem, MenuItems, Transition } from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/20/solid';
import classNames from 'classnames';
import configStorage from '@src/shared/storages/configStorage';
import { usePreventOverflowHidden } from '@src/shared/hooks/usePreventOverflowHidden';

interface ModelDropdownProps {
  displayName: string;
  className?: string;
  onItemClick: (_model: string, _isCommandPressed: boolean) => void;
  statusListener: (_status: boolean) => void;
  initOpen: boolean;
}

export default function ModelDropdown({
  displayName,
  initOpen,
  className,
  onItemClick,
  statusListener,
}: ModelDropdownProps) {
  const menuItemsRef = useRef<(HTMLButtonElement | null)[]>([]);
  const [models, setModels] = useState([]);
  const [isOpened, setIsOpen] = useState(initOpen);
  const buttonRef = useRef<HTMLButtonElement>(null);
  let isCommandPressed = false;

  useEffect(() => {
    // console.log('[ModelDropdown] initOpen = ' + initOpen, 'isOpened = ' + isOpened);
    if (initOpen && !isOpened) {
      // console.log('[ModelDropdown] click menu button to open');
      buttonRef.current?.click();
    } else if (!initOpen && isOpened) {
      // console.log('[ModelDropdown] click menu button to close');
      buttonRef.current?.click();
    }
  }, [initOpen]);

  useEffect(() => {
    // console.log('[ModelDropdown] isOpened = ' + isOpened);
    statusListener(isOpened);
    if (isOpened) {
      setTimeout(() => menuItemsRef.current[0]?.focus(), 0);
    }
  }, [isOpened]);

  const handleKeyDown = (_e: React.KeyboardEvent) => {
    // if ((e.key === 'Escape' || e.key === 'Backspace') && isOpened) {
    //   console.log('[ModelDropdown] escape or backspace');
    //   e.preventDefault();
    //   e.stopPropagation();
    //   setIsOpen(false);
    // }
  };

  useEffect(() => {
    const fetchModels = async () => {
      const userModels = (await configStorage.getModelConfig()) || [];
      const modelArray = [];
      userModels.forEach(({ provider, config }) => {
        if (config.models) {
          config.models.forEach(m => {
            modelArray.push({
              name: provider + '/' + (m.name || m.id),
              config,
            });
          });
        }
      });
      setModels(modelArray);
      // modelArray.length && onItemClick(modelArray[0].name);
    };

    fetchModels();
  }, []);
  let closeDropdownTimer: any;

  usePreventOverflowHidden();

  return (
    <button
      className={classNames(`${className}`)}
      onKeyDown={handleKeyDown}
      aria-haspopup="true"
      aria-expanded={isOpened}
      type="button">
      <Menu
        as="div"
        className={classNames('relative inline-block text-left', className)}
        style={{ isolation: 'isolate' }}>
        <MenuButton
          ref={buttonRef}
          className="inline-flex w-full justify-center rounded-md text-gray-600 bg-white px-2 py-1 text-sm font-medium text-black hover:bg-black/10 focus:outline-none min-w-0"
          onClick={() => setIsOpen(!isOpened)}
          onMouseEnter={_e => {
            setIsOpen(true);
            // e.stopPropagation();
          }}
          onMouseLeave={_e => {
            // Add a small delay before closing to allow moving to menu items
            closeDropdownTimer = setTimeout(() => setIsOpen(false), 100);
          }}>
          {({ active }) => {
            setIsOpen(active);
            return (
              <>
                <span className="inline-block truncate max-w-[10rem] text-right" dir="rtl">
                  {displayName == 'free' ? 'Model' : displayName} ⌘ KK
                </span>
                <ChevronDownIcon
                  className="-mr-1 h-5 w-5 text-violet-200 hover:text-violet-100 flex-shrink-0"
                  aria-hidden="true"
                />
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
            className="absolute left-0 z-10 mt-0 min-w-[10rem] origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
            onMouseEnter={() => {
              clearTimeout(closeDropdownTimer);
              setIsOpen(true);
            }}
            onMouseLeave={() => setIsOpen(false)}>
            <div className="py-1">
              {models.map((model, index) => (
                <MenuItem key={model.id}>
                  {({ active }) => (
                    <button
                      ref={el => (menuItemsRef.current[index] = el)}
                      className={`${
                        active ? 'bg-black text-white' : 'text-gray-900'
                      } group flex w-full items-center rounded-md px-2 py-2 text-sm focus:outline-none`}
                      onClick={() => {
                        onItemClick(model.name, isCommandPressed);
                        setIsOpen(false);
                      }}
                      onMouseDown={() => {
                        onItemClick(model.name, isCommandPressed);
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
                      <span className="whitespace-nowrap">{model.name}</span>
                    </button>
                  )}
                </MenuItem>
              ))}
            </div>
          </MenuItems>
        </Transition>
      </Menu>
    </button>
  );
}
