import { Menu, Transition } from '@headlessui/react';
import { useEffect, useState, Fragment, forwardRef, Ref } from 'react';
import { ChevronDownIcon, BookOpenIcon } from '@heroicons/react/20/solid';
import classNames from 'classnames';
import defaultTools from '@assets/conf/default-tools.toml';
import { ToolsPromptInterface } from '../types';
import Handlebars from '../../third-party/kbn-handlebars';

interface ToolDropdownProps {
  className: string;
  onItemClick: (tool: ToolsPromptInterface) => void;
}

const CustomToolButton = forwardRef(function (props: { onClick: (e) => void }, ref: Ref<HTMLButtonElement>) {
  return (
    <button
      className="inline-flex w-full justify-center rounded-md border-black border-1 border-solid bg-white px-2 py-1 text-xs font-medium text-black hover:bg-black/5 focus:outline-none"
      ref={ref}
      {...props}
    />
  );
});
CustomToolButton.displayName = 'CustomToolButton';

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

export default function ToolDropdown({ className, onItemClick }: ToolDropdownProps) {
  // className = "fixed top-36 w-56 text-right"
  const [open, setOpen] = useState(false);
  useEffect(() => {
    function handleClickOutside() {
      setOpen(false);
    }

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);
  return (
    <div className={classNames(`mr-2 ${className}`)}>
      <Menu as="div" className="relative" 
      // onMouseOver={() => setOpen(true)}
      >
        <div>
          <Menu.Button
            className="inline-flex w-full justify-center rounded-md text-gray-600 bg-white px-2 py-1 text-sm font-medium text-black hover:bg-black/10 focus:outline-none"
            onClick={e => {
              setOpen(!open);
              e.stopPropagation();
            }}>
             Tool ⌘ K
            <ChevronDownIcon className="-mr-1 ml-2 h-5 w-5 text-violet-200 hover:text-violet-100" aria-hidden="true" />
          </Menu.Button>
        </div>
        <Transition
          show={open}
          as={Fragment}
          enter="transition ease-out duration-100"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95">
          <Menu.Items
            className="absolute right-0 mt-2 w-36 origin-top-right divide-y divide-gray-100 rounded bg-white shadow-lg ring-1 ring-black/5 focus:outline-none z-10"
            static>
            <div className="px-1 py-1 ">
              {tools.map(tool => (
                <Menu.Item key={tool.name}>
                  {({ active }) => (
                    <button
                      onClick={() => {
                        onItemClick(tool);
                        setOpen(false);
                      }}
                      className={`${
                        active ? 'bg-violet-500 text-white' : 'text-gray-900'
                      } group flex w-full items-center rounded-md px-2 py-2 text-sm`}>
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
    </div>
  );
}
