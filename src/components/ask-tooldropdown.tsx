import React, { useEffect, useRef } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { ChevronDownIcon, BookOpenIcon } from '@heroicons/react/20/solid';
import classNames from 'classnames';
import defaultTools from '@assets/conf/default-tools.toml';
import { ToolsPromptInterface } from '../types';
import { Handlebars } from '../../third-party/kbn-handlebars/src/handlebars';

interface ToolDropdownProps {
  className: string;
  onItemClick: (tool: ToolsPromptInterface) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const tools: ToolsPromptInterface[] = [];

for (const k in defaultTools) {
  try {
    tools.push({
      name: defaultTools[k].name,
      template: Handlebars.compileAST(defaultTools[k].hbs),
    });
  } catch (e) {
    console.error('Cannot parse default tools', e);
  }
}

export default function ToolDropdown({ className, onItemClick, isOpen, setIsOpen }: ToolDropdownProps) {
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
      <Menu as="div" className="relative">
        <Menu.Button
          className="inline-flex w-full justify-center rounded-md text-gray-600 bg-white px-2 py-1 text-sm font-medium text-black hover:bg-black/10 focus:outline-none"
          onClick={e => {
            setIsOpen(!isOpen);
            e.stopPropagation();
          }}>
          Tool ⌘ K
          <ChevronDownIcon className="-mr-1 ml-2 h-5 w-5 text-violet-200 hover:text-violet-100" aria-hidden="true" />
        </Menu.Button>
        <Transition
          show={isOpen}
          as={React.Fragment}
          enter="transition ease-out duration-100"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95">
          <Menu.Items
            static
            className="absolute right-0 mt-2 w-36 origin-top-right divide-y divide-gray-100 rounded bg-white shadow-lg ring-1 ring-black/5 focus:outline-none z-10">
            <div className="px-1 py-1">
              {tools.map((tool, index) => (
                <Menu.Item key={tool.name}>
                  {({ active }) => (
                    <button
                      ref={el => (menuItemsRef.current[index] = el)}
                      onClick={() => {
                        onItemClick(tool);
                        setIsOpen(false);
                      }}
                      className={`${
                        active ? 'bg-violet-500 text-white' : 'text-gray-900'
                      } group flex w-full items-center rounded-md px-2 py-2 text-sm focus:outline-none`}>
                      <BookOpenIcon className="mr-2 h-5 w-5 color-gray" aria-hidden="true" />
                      {tool.name}
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
