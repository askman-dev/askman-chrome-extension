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
    const fetchModels = async () => {
      console.log('Fetching models...');
      const userModels = (await configStorage.getModelConfig()) || [];
      console.log('Raw models:', userModels);
      const modelArray = [];
      userModels.forEach(({ provider, config }) => {
        console.log('Processing provider:', provider, 'config:', config);
        if (config.models) {
          config.models.forEach(m => {
            console.log('Processing model:', m);
            modelArray.push({
              name: provider + '/' + (m.name || m.id),
              shortName: m.name || m.id,
              provider,
              config,
            });
          });
        }
      });
      console.log('Processed models:', modelArray);
      setModels(modelArray);
    };

    fetchModels().catch(error => {
      console.error('Error fetching models:', error);
    });
  }, []);

  useEffect(() => {
    console.log('Models state updated:', models);
  }, [models]);

  useEffect(() => {
    console.log('ModelDropdown useEffect[initOpen]:', { initOpen, isOpened, buttonRef: buttonRef.current });
    if (initOpen && !isOpened) {
      console.log('Attempting to open dropdown');
      buttonRef.current?.click();
    } else if (!initOpen && isOpened) {
      console.log('Attempting to close dropdown');
      buttonRef.current?.click();
    }
  }, [initOpen]);

  useEffect(() => {
    console.log('ModelDropdown useEffect[isOpened]:', { isOpened });
    statusListener(isOpened);
    if (isOpened) {
      setTimeout(() => {
        console.log('Attempting to focus first item');
        menuItemsRef.current[0]?.focus();
      }, 0);
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
                <span className="inline-block truncate max-w-[8rem] text-right" dir="rtl">
                  {typeof displayName === 'string' ? displayName : 'Model'} ⌘ KK
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
                      } flex w-full items-center rounded-md px-2 py-2 text-sm focus:outline-none group`}
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
                      <span className="whitespace-nowrap flex-1 flex justify-between items-center">
                        <span>{model.shortName}</span>
                        <span className="text-gray-400 ml-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          [{model.provider}]
                        </span>
                      </span>
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
