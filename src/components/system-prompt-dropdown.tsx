import React, { Fragment, useEffect, useState } from 'react';
import { Menu, MenuButton, MenuItem, MenuItems, Transition } from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/20/solid';
import { StorageManager, SystemPresetInterface } from '../utils/StorageManager';
import { ToolPreview } from './tool-preview';

interface SystemPromptDropdownProps {
  className: string;
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

export default function SystemPromptDropdown({ className }: SystemPromptDropdownProps) {
  const [systemPresets, setSystemPresets] = useState<SystemPresetInterface[]>([]);
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const { showPreview, previewPos, previewContent, showToolPreview, hideToolPreview } = useToolPreview();

  useEffect(() => {
    const fetchPresets = async () => {
      try {
        // 获取系统预设
        const presets = await StorageManager.getSystemPresets();
        setSystemPresets(presets);

        // 获取当前选中的预设
        const currentPreset = await StorageManager.getCurrentSystemPreset();
        console.log('Current preset:', currentPreset);
        setSelectedPreset(currentPreset || 'system-init');
      } catch (error) {
        console.error('Error fetching presets:', error);
      }
    };

    fetchPresets();
  }, []);

  const handleSystemPresetClick = async (preset: SystemPresetInterface) => {
    try {
      console.log('Handling system preset click:', preset.name);
      await StorageManager.setCurrentSystemPreset(preset.name);
      console.log('Current preset updated to:', preset.name);
      setSelectedPreset(preset.name);
      setIsOpen(false);
    } catch (error) {
      console.error('Error setting system preset:', error);
    }
  };

  return (
    <div className={className}>
      <Menu as="div">
        <MenuButton
          className="inline-flex w-full justify-center rounded-md text-gray-600 bg-white px-2 py-1 text-sm font-medium text-black hover:bg-black/10 focus:outline-none min-w-0"
          onMouseEnter={() => setIsOpen(true)}
          onMouseLeave={e => {
            const target = e.currentTarget;
            const relatedTarget = e.relatedTarget as HTMLElement;
            if (relatedTarget && target.nextElementSibling?.contains(relatedTarget)) {
              return;
            }
            setIsOpen(false);
          }}>
          <span>{selectedPreset === 'system-init' || !selectedPreset ? 'System Prompt' : selectedPreset}</span>
          <ChevronDownIcon className="ml-2 -mr-1 h-5 w-5" aria-hidden="true" />
        </MenuButton>
        {isOpen && (
          <Transition
            as={Fragment}
            show={isOpen}
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
                setIsOpen(true);
              }}
              onMouseLeave={() => {
                setIsOpen(false);
              }}>
              <div className="px-1 py-1">
                {systemPresets.map((preset, index) => {
                  const isSelected = selectedPreset === preset.name;
                  return (
                    <MenuItem key={preset.name}>
                      {({ active }) => (
                        <button
                          className={`${
                            active ? 'bg-black text-white' : 'text-gray-900'
                          } group flex w-full items-center rounded-md px-2 py-2 text-sm focus:outline-none`}
                          onClick={e => {
                            e.stopPropagation();
                            e.preventDefault();
                            handleSystemPresetClick(preset);
                          }}
                          onMouseEnter={e => {
                            showToolPreview(e.currentTarget, preset.hbs);
                          }}
                          onMouseLeave={() => {
                            hideToolPreview();
                          }}>
                          <span className="mr-2 inline-flex items-center justify-center w-5 h-5 text-xs font-semibold border border-gray-300 rounded">
                            {index}
                          </span>
                          <span className="flex items-center justify-between w-full">
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
                        </button>
                      )}
                    </MenuItem>
                  );
                })}
              </div>
            </MenuItems>
          </Transition>
        )}
      </Menu>
      {showPreview && <ToolPreview content={previewContent} x={previewPos.x} y={previewPos.y} />}
    </div>
  );
}
