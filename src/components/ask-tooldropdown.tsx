import React, { useEffect, useState, useRef } from 'react';
import defaultTools from '@assets/conf/tools.toml';
import { ToolsPromptInterface } from '../types';
import { Handlebars } from '../../third-party/kbn-handlebars/src/handlebars';
import { StorageManager } from '../utils/StorageManager';
import { ToolPreview } from './tool-preview';
import { BaseDropdown } from './base/BaseDropdown';
import { useToolPreview } from '@src/shared/hooks/useToolPreview';

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
  displayName,
  className,
  onItemClick,
  initOpen,
  statusListener,
}: ToolDropdownProps) {
  const [allTools, setAllTools] = useState<ToolsPromptInterface[]>([]);
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const [selectedToolName, setSelectedToolName] = useState<string>(displayName);
  const { showPreview, previewPos, previewContent, showToolPreview, hideToolPreview } = useToolPreview();
  const baseDropdownRef = useRef<HTMLDivElement>(null);

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
    await StorageManager.setCurrentTool(tool.id);
    setSelectedTool(tool.id);
    setSelectedToolName(tool.name);
    onItemClick(tool, isCommandPressed);
    hideToolPreview();
  };

  const renderToolItem = (tool: ToolsPromptInterface, index: number, active: boolean) => (
    <button
      className={`${
        active ? 'bg-black text-white' : 'text-gray-900'
      } group flex w-full items-center rounded-md px-2 py-2 text-sm focus:outline-none`}
      onClick={e => {
        e.preventDefault();
        handleToolClick(tool, e.metaKey || e.ctrlKey);
        statusListener(false);
      }}
      onMouseEnter={e => {
        if (baseDropdownRef.current) {
          showToolPreview(e.currentTarget, baseDropdownRef.current, tool.hbs);
        }
      }}
      onMouseLeave={hideToolPreview}>
      <span className="mr-2 inline-flex items-center justify-center w-5 h-5 text-xs font-semibold border border-gray-300 rounded">
        {index}
      </span>
      <span className="whitespace-nowrap flex-1 flex justify-between items-center">
        <span>{tool.name}</span>
        <span
          className={`ml-2 opacity-0 transition-all duration-100 ${active || 'group-hover:opacity-100'} ${
            active && 'opacity-100'
          }`}>
          [{navigator.platform.includes('Mac') ? '⌘' : 'Ctrl'} + enter]
        </span>
      </span>
    </button>
  );

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
      />
      {showPreview && <ToolPreview content={previewContent} x={previewPos.x} y={previewPos.y} />}
    </div>
  );
}
