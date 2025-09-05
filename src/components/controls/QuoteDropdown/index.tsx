import { Menu, MenuButton, MenuItem, MenuItems, Transition } from '@headlessui/react';
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
        <MenuButton
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
        </MenuButton>
        <Transition
          as={Fragment}
          enter="transition ease-out duration-100"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95">
          <MenuItems className="absolute left-0 w-36 mt-[-0.5rem] origin-top-right divide-y divide-gray-100 rounded bg-white shadow-lg ring-1 ring-black/5 focus:outline-none z-10">
            <div className="px-1 py-1">
              {quoteContexts.map((quote, index) => (
                <MenuItem key={quote.name}>
                  {({ active }) => (
                    <button
                      ref={el => (menuItemsRef.current[index] = el)}
                      onMouseDown={e => {
                        console.log('[QuoteDropdown] MouseDown事件:', quote.type);
                        // 阻止mousedown事件冒泡
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                      onClick={e => {
                        console.log('[QuoteDropdown] 点击引用项:', quote.type);
                        console.log('[QuoteDropdown] 点击事件详情:', e.type, e.isTrusted);

                        // 阻止事件冒泡和默认行为
                        e.preventDefault();
                        e.stopPropagation();

                        // Dynamically get fresh page data when clicked
                        let freshQuote: QuoteContext;
                        switch (quote.type) {
                          case 'page.title': {
                            const currentTitle = document.title;
                            console.log('[QuoteDropdown] 获取页面标题:', currentTitle);
                            freshQuote = {
                              type: 'page.title',
                              pageTitle: currentTitle,
                              name: 'Page.title',
                            };
                            break;
                          }
                          case 'page.url': {
                            const currentUrl = window.location.href;
                            console.log('[QuoteDropdown] 获取页面URL:', currentUrl);
                            freshQuote = {
                              type: 'page.url',
                              pageUrl: currentUrl,
                              name: 'Page.url',
                            };
                            break;
                          }
                          case 'page.content': {
                            const currentContent = document.body.innerText.slice(0, 200) + '...';
                            console.log('[QuoteDropdown] 获取页面内容 (前200字符):', currentContent);
                            freshQuote = {
                              type: 'page.content',
                              pageContent: document.body.innerText,
                              name: 'Page.content',
                            };
                            break;
                          }
                          case 'page.selection': {
                            const currentSelection = window.getSelection()?.toString().trim() || '';
                            console.log('[QuoteDropdown] 获取页面选择文本:', currentSelection);
                            freshQuote = {
                              type: 'page.selection',
                              selection: currentSelection,
                              name: 'Page.selection',
                            };
                            break;
                          }
                          default:
                            freshQuote = quote;
                        }

                        console.log('[QuoteDropdown] 发送引用数据:', freshQuote);
                        onItemClick(freshQuote);
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
                </MenuItem>
              ))}
            </div>
          </MenuItems>
        </Transition>
      </Menu>
    </button>
  );
}

// For backwards compatibility
export default QuoteDropdown;
