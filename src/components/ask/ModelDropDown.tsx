import React, { Fragment, useRef, useEffect } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/20/solid';
import classNames from 'classnames';

interface ModelDropdownProps {
  displayName: string;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  className?: string;
  onItemClick: (model: string) => void;
}

const models = [
  { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo' },
  { id: 'gpt-4', name: 'GPT-4' },
  { id: 'claude-v1', name: 'Claude v1' },
  { id: 'claude-instant-v1', name: 'Claude Instant v1' },
];

export default function ModelDropdown({ displayName, isOpen, setIsOpen, className, onItemClick }: ModelDropdownProps) {
  const menuItemsRef = useRef<(HTMLButtonElement | null)[]>([]);
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => menuItemsRef.current[0]?.focus(), 0);
    }
  }, [isOpen]);
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape' && isOpen) {
      e.preventDefault();
      e.stopPropagation();
      setIsOpen(false);
    }
  };

  return (
    <button
      className={classNames(`mr-2 ${className}`)}
      onKeyDown={handleKeyDown}
      aria-haspopup="true"
      aria-expanded={isOpen}
      type="button">
      <Menu as="div" className={classNames('relative inline-block text-left', className)}>
        <Menu.Button
          className="inline-flex w-full justify-center rounded-md text-gray-600 bg-white px-2 py-1 text-sm font-medium text-black hover:bg-black/10 focus:outline-none"
          onClick={() => setIsOpen(!isOpen)}>
          {displayName == 'free' ? 'Model' : displayName} ⌘ J
          <ChevronDownIcon className="-mr-1 h-5 w-5 text-gray-400" aria-hidden="true" />
        </Menu.Button>

        <Transition
          show={isOpen}
          as={Fragment}
          enter="transition ease-out duration-100"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95">
          <Menu.Items
            static
            className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
            <div className="py-1">
              {models.map((model, index) => (
                <Menu.Item key={model.id}>
                  {({ active }) => (
                    <button
                      ref={el => (menuItemsRef.current[index] = el)}
                      className={`${
                        active ? 'bg-violet-500 text-white' : 'text-gray-900'
                      } group flex w-full items-center rounded-md px-2 py-2 text-sm focus:outline-none`}
                      onClick={() => {
                        onItemClick(model.id);
                        setIsOpen(false);
                      }}>
                      {model.name}
                    </button>
                  )}
                </Menu.Item>
              ))}
            </div>
          </Menu.Items>
        </Transition>
      </Menu>
    </button>
  );
}
