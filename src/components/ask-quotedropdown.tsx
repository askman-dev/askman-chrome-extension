import { Menu, Transition } from '@headlessui/react';
import { Fragment, useEffect, useRef } from 'react';
import { ChevronDownIcon } from '@heroicons/react/20/solid';
import classNames from 'classnames';
import { QuoteContext } from '../agents/quote';

interface QuoteDropdownProps {
  className: string;
  style?: React.CSSProperties; // 添加 style 属性
  onItemClick: (_tool: QuoteContext) => void;
  isOpen: boolean;
  setIsOpen: (_isOpen: boolean) => void;
}

const getQuoteContexts = (): QuoteContext[] => [
  { type: 'title', pageTitle: document.title, name: 'title' },
  { type: 'url', pageUrl: window.location.href, name: 'url' },
  { type: 'content', pageContent: document.body.innerText, name: 'content' },
  { type: 'selection', selection: window.getSelection()?.toString().trim() || '', name: 'selection' },
  {
    type: 'page',
    pageTitle: document.title,
    pageUrl: window.location.href,
    pageContent: document.body.innerText,
    selection: window.getSelection()?.toString().trim() || '',
    name: 'page',
  },
];

export default function QuoteDropdown({ className, style, onItemClick, isOpen, setIsOpen }: QuoteDropdownProps) {
  const menuItemsRef = useRef<(HTMLButtonElement | null)[]>([]);
  const quoteContexts = getQuoteContexts();
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
    } else if (e.key === 'Backspace' && isOpen) {
      e.preventDefault();
      e.stopPropagation();
      setIsOpen(false);
    }
  };

  return (
    <button
      className={classNames(`${className} h-0`)}
      onKeyDown={handleKeyDown}
      aria-haspopup="true"
      aria-expanded={isOpen}
      type="button"
      style={style}>
      <Menu as="div" className="relative h-0">
        <Menu.Button
          className="inline-flex w-full justify-center rounded-md text-gray-600 bg-white text-sm font-medium text-black hover:bg-black/10 focus:outline-none h-0 invisible pointer-events-none"
          title="Content"
          onClick={e => {
            setIsOpen(!isOpen);
            e.stopPropagation();
          }}>
          Content
          <ChevronDownIcon className="-mr-1 h-5 w-5 text-violet-200 hover:text-violet-100" aria-hidden="true" />
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
            className="absolute left-0 w-36 mt-[-0.5rem] origin-top-right divide-y divide-gray-100 rounded bg-white shadow-lg ring-1 ring-black/5 focus:outline-none z-10">
            <div className="px-1 py-1">
              {quoteContexts.map((quote, index) => (
                <Menu.Item key={quote.name}>
                  {({ active }) => (
                    <button
                      ref={el => (menuItemsRef.current[index] = el)}
                      onClick={() => {
                        onItemClick(quote);
                        setIsOpen(false);
                      }}
                      onMouseDown={() => {
                        onItemClick(quote);
                        setIsOpen(false);
                      }}
                      onKeyDown={e => {
                        if (e.key === 'Escape') {
                          handleKeyDown(e);
                        }
                      }}
                      className={`${
                        active ? 'bg-black text-white' : 'text-gray-900'
                      } group flex w-full items-center rounded-md px-2 py-2 text-sm focus:outline-none`}>
                      <span className="mr-2 inline-flex items-center justify-center w-5 h-5 text-xs font-semibold border border-gray-300 rounded">
                        {index}
                      </span>
                      {quote.name}
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
