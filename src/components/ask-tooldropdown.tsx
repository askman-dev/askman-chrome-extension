import { Menu, Transition } from '@headlessui/react';
import { useEffect, useState, Fragment, forwardRef , Ref } from 'react';
import { ChevronDownIcon } from '@heroicons/react/20/solid';
import classNames from 'classnames';
import defaultTools from '@assets/conf/default-tools.toml';
import Handlebars, { TemplateDelegate } from 'kbn-handlebars';
interface ToolDropdownProps {
  className: string;
  onItemClick: (tool: ToolsPromptInterface) => void;
}

export interface ToolsPromptInterface {
  name: string;
  template: TemplateDelegate;
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
    <div className={classNames(`mr-1 ${className}`)}>
      <Menu as="div" className="relative" onMouseOver={() => setOpen(true)}>
        <div>
          <Menu.Button
            className="inline-flex w-full justify-center rounded-md border-black border-1 border-solid bg-white px-2 py-1 text-xs font-medium text-black hover:bg-black/30 focus:outline-none"
            onClick={e => {
              setOpen(!open);
              e.stopPropagation();
            }}>
            工具
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
            className="absolute right-0 mt-2 w-56 origin-top-right divide-y divide-gray-100 rounded bg-white shadow-lg ring-1 ring-black/5 focus:outline-none"
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
                      {active ? (
                        <EditActiveIcon className="mr-2 h-5 w-5" aria-hidden="true" />
                      ) : (
                        <EditInactiveIcon className="mr-2 h-5 w-5" aria-hidden="true" />
                      )}
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

function EditInactiveIcon(props) {
  return (
    <svg {...props} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M4 13V16H7L16 7L13 4L4 13Z" fill="#EDE9FE" stroke="#A78BFA" strokeWidth="2" />
    </svg>
  );
}

function EditActiveIcon(props) {
  return (
    <svg {...props} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M4 13V16H7L16 7L13 4L4 13Z" fill="#8B5CF6" stroke="#C4B5FD" strokeWidth="2" />
    </svg>
  );
}
