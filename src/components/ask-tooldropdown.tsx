import React, { useEffect, useRef, useState } from 'react';
import { Menu, MenuButton, MenuItem, MenuItems, Transition } from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/20/solid';
import classNames from 'classnames';
import defaultTools from '@assets/conf/tools.toml';
import { ToolsPromptInterface } from '../types';
import { Handlebars } from '../../third-party/kbn-handlebars/src/handlebars';
import { StorageManager } from '../utils/StorageManager';
import { ToolPreview } from './tool-preview';
import { usePreventOverflowHidden } from '@src/shared/hooks/usePreventOverflowHidden';

interface ToolDropdownProps {
  displayName: string;
  className: string;
  onItemClick: (_tool: ToolsPromptInterface, _withCommand?: boolean) => void;
  statusListener: (_status: boolean) => void;
  initOpen: boolean;
}

const tools: ToolsPromptInterface[] = [];

for (const k in defaultTools) {
  try {
    tools.push({
      name: defaultTools[k].name,
      hbs: defaultTools[k].hbs,
      template: Handlebars.compileAST(defaultTools[k].hbs),
    });
  } catch (e) {
    console.error('Cannot parse default tools', e);
  }
}

function useToolPreview() {
  const [showPreview, setShowPreview] = useState(false);
  const [previewPos, setPreviewPos] = useState({ x: 0, y: 0 });
  const [previewContent, setPreviewContent] = useState('');

  const showToolPreview = (element: HTMLElement, content: string) => {
    const buttonRect = element.getBoundingClientRect();
    const parentRect = element.parentElement?.getBoundingClientRect() || { left: 0, top: 0 };

    setPreviewPos({
      x: buttonRect.left - parentRect.left + buttonRect.width,
      y: buttonRect.top - parentRect.top,
    });
    setPreviewContent(content);
    setShowPreview(true);
  };

  const hideToolPreview = () => {
    setShowPreview(false);
  };

  return {
    showPreview,
    previewPos,
    previewContent,
    showToolPreview,
    hideToolPreview,
  };
}

export default function ToolDropdown({
  displayName,
  className,
  onItemClick,
  initOpen,
  statusListener,
}: ToolDropdownProps) {
  const [allTools, setAllTools] = useState<ToolsPromptInterface[]>([]);
  const [isOpened, setIsOpen] = useState(initOpen);
  const { showPreview, previewPos, previewContent, showToolPreview, hideToolPreview } = useToolPreview();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuItemsRef = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    const fetchTools = async () => {
      try {
        // 获取用户工具
        const userToolSettings = await StorageManager.getUserTools();
        const userTools = Object.values(userToolSettings).map(tool => ({
          name: tool.name,
          hbs: tool.hbs,
          template: Handlebars.compileAST(tool.hbs),
        }));
        setAllTools([...tools, ...userTools]);
      } catch (error) {
        console.error('Error fetching tools:', error);
      }
    };

    fetchTools();
  }, []);

  useEffect(() => {
    // console.log('[ToolDropdown] initOpen = ' + initOpen, 'isOpened = ' + isOpened);
    if (initOpen && !isOpened) {
      // console.log('[ToolDropdown] click menu button to open');
      buttonRef.current?.click();
    } else if (!initOpen && isOpened) {
      // console.log('[ToolDropdown] click menu button to close');
      buttonRef.current?.click();
    }
  }, [initOpen]);

  useEffect(() => {
    // console.log('[ToolDropdown] isOpened = ' + isOpened);
    statusListener(isOpened);
    if (isOpened) {
      setTimeout(() => menuItemsRef.current[0]?.focus(), 0);
    }
  }, [isOpened]);

  const handleKeyDown = (_e: React.KeyboardEvent) => {
    // if ((e.key === 'Escape' || e.key === 'Backspace') && isOpened) {
    //   console.log('[ToolDropdown] escape or backspace');
    //   e.preventDefault();
    //   e.stopPropagation();
    //   setIsOpen(false);
    // }
  };

  const handleActiveItemChange = (element: HTMLElement | null, index: number) => {
    requestAnimationFrame(() => {
      if (element && index >= 0 && index < allTools.length) {
        showToolPreview(element, allTools[index].hbs);
      }
    });
  };

  const handleBlur = (e: React.FocusEvent) => {
    if (!e.currentTarget.contains(e.relatedTarget)) {
      hideToolPreview();
    }
  };
  let isCommandPressed = false;
  let closeDropdownTimer: any;

  usePreventOverflowHidden();

  return (
    <div
      className={classNames(`${className}`)}
      onKeyDown={handleKeyDown}
      onBlur={handleBlur}
      aria-haspopup="true"
      aria-expanded={isOpened}>
      <Menu as="div" className="relative" onKeyDown={handleKeyDown} style={{ isolation: 'isolate' }}>
        <MenuButton
          ref={buttonRef}
          className="inline-flex w-full justify-center rounded-md text-sm text-gray-600 bg-white px-2 py-1 text-sm font-medium text-black hover:bg-black/10 focus:outline-none min-w-0"
          title="Use framework"
          onMouseEnter={_e => {
            setIsOpen(true);
          }}
          onMouseLeave={_e => {
            closeDropdownTimer = setTimeout(() => setIsOpen(false), 100);
          }}>
          {({ active }) => {
            setIsOpen(active);
            return (
              <>
                {displayName} ⌘ K
                <ChevronDownIcon className="-mr-1 h-5 w-5 text-violet-200" />
              </>
            );
          }}
        </MenuButton>
        <Transition
          as={React.Fragment}
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
              {/* Existing Tools */}
              {allTools.map((tool, index) => (
                <MenuItem key={tool.name}>
                  {({ active }) => (
                    <button
                      ref={el => {
                        menuItemsRef.current[index] = el;
                        if (el && active) {
                          handleActiveItemChange(el, index);
                        }
                      }}
                      onClick={() => {
                        onItemClick(tool, isCommandPressed);
                        setIsOpen(false);
                      }}
                      onMouseDown={() => {
                        onItemClick(tool, isCommandPressed);
                        setIsOpen(false);
                      }}
                      onMouseEnter={e => {
                        showToolPreview(e.currentTarget, tool.hbs);
                      }}
                      onMouseLeave={hideToolPreview}
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          isCommandPressed = e.metaKey || e.ctrlKey;
                        }
                      }}
                      className={`${
                        active ? 'bg-black text-white' : 'text-gray-900'
                      } group flex w-full items-center rounded-md px-2 py-2 text-sm focus:outline-none`}>
                      <span className="mr-2 inline-flex items-center justify-center w-5 h-5 text-xs font-semibold border border-gray-300 rounded">
                        {index}
                      </span>
                      {tool.name}
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
                  )}
                </MenuItem>
              ))}
            </div>
          </MenuItems>
        </Transition>
      </Menu>
      {showPreview && <ToolPreview content={previewContent} x={previewPos.x} y={previewPos.y} />}
    </div>
  );
}
