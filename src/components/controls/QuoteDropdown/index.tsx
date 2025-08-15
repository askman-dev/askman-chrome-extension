import { Menu, Transition } from '@headlessui/react';
import { Fragment, useEffect, useRef } from 'react';
import { ChevronDownIcon } from '@heroicons/react/20/solid';
import classNames from 'classnames';
import { QuoteContext } from '@src/agents/quote';
import { useState } from 'react';

interface QuoteDropdownProps {
  className: string;
  style?: React.CSSProperties;
  onItemClick: (_tool: QuoteContext) => void;
  statusListener: (_status: boolean) => void;
  initOpen: boolean;
}

const getQuoteContexts = (): QuoteContext[] => [
  { type: 'page.title', pageTitle: document.title, name: 'Page.title' },
  { type: 'page.url', pageUrl: window.location.href, name: 'Page.url' },
  { type: 'page.content', pageContent: document.body.innerText, name: 'Page.content' },
  { type: 'page.selection', selection: window.getSelection()?.toString().trim() || '', name: 'Page.selection' },
];

export function QuoteDropdown({ className, style, onItemClick, initOpen, statusListener }: QuoteDropdownProps) {
  const menuItemsRef = useRef<(HTMLButtonElement | null)[]>([]);
  const [isOpened, setIsOpen] = useState(initOpen);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const quoteContexts = getQuoteContexts();

  // 同步下拉菜单的打开状态
  useEffect(() => {
    if (initOpen && !isOpened) {
      buttonRef.current?.click();
    } else if (!initOpen && isOpened) {
      buttonRef.current?.click();
    }
  }, [initOpen, isOpened]);

  // 通知状态变化并聚焦第一个选项
  useEffect(() => {
    statusListener(isOpened);
    if (isOpened) {
      setTimeout(() => menuItemsRef.current[0]?.focus(), 0);
    }
  }, [isOpened, statusListener]);

  return (
    <button
      className={classNames(`${className} h-0`)}
      aria-haspopup="true"
      aria-expanded={isOpened}
      type="button"
      style={style}>
      <Menu as="div" className="relative h-0">
        <Menu.Button
          ref={buttonRef}
          className="inline-flex w-full justify-center rounded-md text-gray-600 bg-white text-sm font-medium text-black hover:bg-black/10 focus:outline-none h-0 invisible pointer-events-none"
          title="Content"
          onClick={() => {
            setIsOpen(!isOpened);
          }}>
          {({ active }) => {
            setIsOpen(active);
            return (
              <>
                Content
                <ChevronDownIcon className="-mr-1 h-5 w-5 text-violet-200 hover:text-violet-100" aria-hidden="true" />
              </>
            );
          }}
        </Menu.Button>
        <Transition
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
                        statusListener(false);
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

// For backwards compatibility
export default QuoteDropdown;
