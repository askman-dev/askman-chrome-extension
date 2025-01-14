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
  const [systemPresets, setSystemPresets] = useState<ToolsPromptInterface[]>([]);
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const [isOpened, setIsOpen] = useState(initOpen);
  const [showSystemPresets, setShowSystemPresets] = useState(false);
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

        // 获取系统预设
        const presets = await StorageManager.getSystemPresets();
        setSystemPresets(presets);

        // 获取当前选中的预设
        const currentPreset = await StorageManager.getCurrentSystemPreset();
        console.log('Current preset:', currentPreset); // 添加日志
        setSelectedPreset(currentPreset || 'system-init');
      } catch (error) {
        console.error('Error fetching tools and presets:', error);
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

  const handleSystemPresetClick = async (preset: ToolsPromptInterface) => {
    try {
      console.log('Handling system preset click:', preset.name);
      await StorageManager.setCurrentSystemPreset(preset.name);
      console.log('Current preset updated to:', preset.name);
      setSelectedPreset(preset.name);
      setIsOpen(false);
      setShowSystemPresets(false);
    } catch (error) {
      console.error('Error setting system preset:', error);
    }
  };

  // 在主菜单项中显示当前选中的预设名称
  const getSelectedPresetDisplayName = () => {
    if (!selectedPreset) return '';
    const preset = systemPresets.find(p => p.name === selectedPreset);
    return preset ? preset.name : '';
  };

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
            onMouseLeave={() => {
              setIsOpen(false);
              setShowSystemPresets(false);
            }}>
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

              {/* System Presets Menu Item */}
              <div className="relative">
                <div
                  className="flex w-full items-center rounded-md px-2 py-2 text-sm focus:outline-none cursor-pointer hover:bg-black hover:text-white"
                  onMouseEnter={() => setShowSystemPresets(true)}
                  onMouseLeave={e => {
                    const target = e.currentTarget;
                    const relatedTarget = e.relatedTarget as HTMLElement;
                    if (relatedTarget && target.nextElementSibling?.contains(relatedTarget)) {
                      return;
                    }
                    setShowSystemPresets(false);
                  }}>
                  <span className="mr-2 inline-flex items-center justify-center w-5 h-5 text-xs font-semibold border border-gray-300 rounded">
                    S
                  </span>
                  <span className="flex items-center">
                    System Prompt
                    {selectedPreset && (
                      <span className="ml-2 text-xs text-gray-500">({getSelectedPresetDisplayName()})</span>
                    )}
                  </span>
                  <ChevronDownIcon
                    className={`ml-auto h-5 w-5 transition-transform duration-200 ${
                      showSystemPresets ? 'rotate-180' : ''
                    }`}
                  />
                </div>

                {/* System Presets Submenu */}
                {showSystemPresets && (
                  <div
                    className="absolute left-0 w-full bg-gray-50 shadow-lg rounded-b-md"
                    onMouseEnter={() => {
                      console.log('Submenu container mouse enter');
                      setShowSystemPresets(true);
                    }}
                    onMouseLeave={() => {
                      console.log('Submenu container mouse leave');
                      setShowSystemPresets(false);
                    }}>
                    {systemPresets.map(preset => {
                      const isSelected = selectedPreset === preset.name;
                      return (
                        <div
                          key={preset.name}
                          className={`w-full text-left px-4 py-2 text-sm hover:bg-black hover:text-white cursor-pointer ${
                            isSelected ? 'bg-gray-100 text-gray-900 font-medium' : 'text-gray-900'
                          }`}
                          onClick={e => {
                            console.log('Preset clicked:', preset.name);
                            e.stopPropagation();
                            e.preventDefault();
                            e.nativeEvent.stopImmediatePropagation();
                            handleSystemPresetClick(preset);
                          }}
                          onMouseDown={e => {
                            console.log('Preset mouse down:', preset.name);
                            e.stopPropagation();
                            e.preventDefault();
                          }}
                          onMouseEnter={e => {
                            console.log('Mouse enter preset:', preset.name);
                            e.stopPropagation();
                            showToolPreview(e.currentTarget, preset.hbs);
                          }}
                          onMouseLeave={_e => {
                            console.log('Mouse leave preset:', preset.name);
                            hideToolPreview();
                          }}>
                          <span
                            className="flex items-center justify-between w-full"
                            onClick={e => {
                              console.log('Preset span clicked:', preset.name);
                              e.stopPropagation();
                              e.preventDefault();
                              handleSystemPresetClick(preset);
                            }}>
                            <span>{preset.name}</span>
                            {isSelected && (
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5 text-black"
                                viewBox="0 0 20 20"
                                fill="currentColor">
                                <path
                                  fillRule="evenodd"
                                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            )}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {showPreview && <ToolPreview content={previewContent} x={previewPos.x} y={previewPos.y} />}
            </div>
          </MenuItems>
        </Transition>
      </Menu>
    </div>
  );
}
