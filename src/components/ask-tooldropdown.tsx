import React, { useEffect, useRef, useState } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/20/solid';
import classNames from 'classnames';
import defaultTools from '@assets/conf/tools.toml';
import { ToolsPromptInterface } from '../types';
import { Handlebars } from '../../third-party/kbn-handlebars/src/handlebars';
import { StorageManager } from '../utils/StorageManager';
import { ToolPreview } from './tool-preview';

interface ToolDropdownProps {
  displayName: string;
  className: string;
  onItemClick: (tool: ToolsPromptInterface, withCommand?: boolean) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
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

export default function ToolDropdown({ displayName, className, onItemClick, isOpen, setIsOpen }: ToolDropdownProps) {
  const [allTools, setAllTools] = useState<ToolsPromptInterface[]>([]);
  const { showPreview, previewPos, previewContent, showToolPreview, hideToolPreview } = useToolPreview();

  useEffect(() => {
    const fetchUserTools = async () => {
      const userToolSettings = await StorageManager.getUserTools();
      // Convert UserToolsObject to ToolsPromptInterface[]
      const userTools = Object.values(userToolSettings).map(tool => ({
        name: tool.name,
        hbs: tool.hbs,
        template: Handlebars.compileAST(tool.hbs),
      }));
      setAllTools([...tools, ...userTools]);
    };

    fetchUserTools();
  }, []);

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
    } else if (e.key === 'Backspace' && isOpen) {
      e.preventDefault();
      e.stopPropagation();
      setIsOpen(false);
    }
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
  return (
    <button
      className={classNames(`${className}`)}
      onKeyDown={handleKeyDown}
      onBlur={handleBlur}
      aria-haspopup="true"
      aria-expanded={isOpen}
      type="button">
      <Menu as="div" className="relative" onKeyDown={handleKeyDown}>
        <Menu.Button
          className="inline-flex w-full justify-center rounded-md text-gray-600 bg-white px-2 py-1 text-sm font-medium hover:bg-black/10 focus:outline-none"
          title="Use framework"
          onClick={e => {
            setIsOpen(!isOpen);
            e.stopPropagation();
          }}>
          {displayName} ⌘ K
          <ChevronDownIcon className="-mr-1 h-5 w-5 text-violet-200 hover:text-violet-100" aria-hidden="true" />
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
            className="absolute left-0 mt-2 min-w-[10rem] origin-top-right divide-y divide-gray-100 rounded bg-white shadow-lg ring-1 ring-black/5 focus:outline-none z-10">
            <div className="px-1 py-1">
              {allTools.map((tool, index) => (
                <Menu.Item key={tool.name}>
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
                            className="inline-flex items-center justify-center w-[2rem] h-5 text-xs font-semibold border border-gray-300 rounded"
                            title="Quick Send">
                            {navigator.platform.includes('Mac') ? '⌘ ↩︎' : 'Ctrl ↩︎'}
                          </span>
                        </>
                      ) : null}
                    </button>
                  )}
                </Menu.Item>
              ))}

              {showPreview && <ToolPreview content={previewContent} x={previewPos.x} y={previewPos.y} />}
            </div>
          </Menu.Items>
        </Transition>
      </Menu>
    </button>
  );
}
