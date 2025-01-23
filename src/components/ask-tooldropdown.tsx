import React, { useEffect, useState, useRef } from 'react';
import defaultTools from '@assets/conf/tools.toml';
import { ToolsPromptInterface } from '../types';
import { Handlebars } from '../../third-party/kbn-handlebars/src/handlebars';
import { StorageManager } from '../utils/StorageManager';
import { ToolPreview } from './tool-preview';
import { BaseDropdown } from './base/BaseDropdown';
import { useToolPreview } from '@src/shared/hooks/useToolPreview';

interface ToolDropdownProps {
  className: string;
  onItemClick: (_tool: ToolsPromptInterface, _withCommand?: boolean) => void;
  statusListener: (_status: boolean) => void;
  initOpen: boolean;
  buttonDisplay?: string;
}

const tools: ToolsPromptInterface[] = [];

for (const k in defaultTools) {
  try {
    tools.push({
      id: defaultTools[k].name,
      name: defaultTools[k].name,
      hbs: defaultTools[k].hbs,
      template: Handlebars.compileAST(defaultTools[k].hbs),
    });
  } catch (e) {
    console.error('Cannot parse default tools', e);
  }
}

export { tools };

export default function ToolDropdown({
  className,
  onItemClick,
  initOpen,
  statusListener,
  buttonDisplay,
}: ToolDropdownProps) {
  const [allTools, setAllTools] = useState<ToolsPromptInterface[]>([]);
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const [selectedToolName, setSelectedToolName] = useState<string>('Frame'); // 默认显示 Frame
  const { showPreview, previewPos, previewContent, showToolPreview, hideToolPreview } = useToolPreview();
  const baseDropdownRef = useRef<HTMLDivElement>(null);

  const handleMainButtonClick = (_e: React.MouseEvent) => {
    // 直接使用当前选中的工具或第一个工具
    const targetTool = selectedTool ? allTools.find(t => t.id === selectedTool) : allTools[0];

    if (targetTool) {
      console.log('[AskToolDropdown] main button clicked, sending tool:', targetTool.name);
      handleToolClick(targetTool, _e.metaKey || _e.ctrlKey);
    }
  };

  useEffect(() => {
    const fetchTools = async () => {
      try {
        const userToolSettings = await StorageManager.getUserTools();
        const userTools = Object.values(userToolSettings).map(tool => ({
          id: tool.name,
          name: tool.name,
          hbs: tool.hbs,
          template: Handlebars.compileAST(tool.hbs),
        }));
        const allToolsList = [...tools, ...userTools];
        setAllTools(allToolsList);

        // 获取当前选中的工具
        const currentTool = await StorageManager.getCurrentTool();
        setSelectedTool(currentTool || null);

        // 更新按钮显示的文字
        if (currentTool) {
          const tool = allToolsList.find(t => t.id === currentTool);
          if (tool) {
            setSelectedToolName(tool.name);
          }
        }
      } catch (error) {
        console.error('Error fetching tools:', error);
      }
    };

    fetchTools();
  }, []);

  const handleToolClick = async (tool: ToolsPromptInterface, isCommandPressed: boolean) => {
    // TODO: Use cmd to pin the tool, it's not working now
    if (isCommandPressed) {
      await StorageManager.setCurrentTool(tool.id);
      setSelectedTool(tool.id);
      setSelectedToolName(tool.name);
    }
    onItemClick(tool, isCommandPressed);
    hideToolPreview();
  };

  const renderToolItem = (tool: ToolsPromptInterface, index: number, active: boolean) => {
    return (
      <button
        className={`${
          active ? 'bg-black text-white' : 'text-gray-900'
        } group flex w-full items-center rounded-md px-2 py-2 text-sm focus:outline-none`}
        onMouseEnter={e => {
          // e.current is any item of dropdown menu
          // baseDropdownRef is the outsite button of the dropdown menu
          if (baseDropdownRef.current) {
            showToolPreview(e.currentTarget, baseDropdownRef.current, 'right', tool.hbs);
          }
        }}
        onMouseLeave={hideToolPreview}
        onClick={e => {
          e.preventDefault();
          handleToolClick(tool, e.metaKey || e.ctrlKey);
          statusListener(false);
        }}>
        <span className="mr-2 inline-flex items-center justify-center w-5 h-5 text-xs font-semibold border border-gray-300 rounded">
          {index}
        </span>
        <span className="whitespace-nowrap flex-1 flex justify-between items-center">
          <span>{tool.name}</span>
          <span
            className={`ml-2 opacity-0 transition-all duration-100 ${active || 'group-hover:opacity-100'} ${
              active && 'opacity-100'
            }`}>
            [{navigator.platform.includes('Mac') ? '⌘' : 'Ctrl'} + Enter to Pin]
          </span>
        </span>
      </button>
    );
  };

  return (
    <div ref={baseDropdownRef} className="relative">
      <BaseDropdown
        displayName={selectedToolName}
        className={className}
        onItemClick={handleToolClick}
        statusListener={statusListener}
        initOpen={initOpen}
        items={allTools}
        selectedId={selectedTool}
        shortcutKey={navigator.platform.includes('Mac') ? '⌘ K' : 'Ctrl K'}
        renderItem={renderToolItem}
        align="right"
        buttonDisplay={buttonDisplay}
        onMainButtonClick={handleMainButtonClick}
      />
      {showPreview && <ToolPreview content={previewContent} x={previewPos.x} y={previewPos.y} />}
    </div>
  );
}
