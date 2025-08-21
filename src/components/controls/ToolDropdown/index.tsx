import React, { useEffect, useState, useRef } from 'react';
import defaultTools from '@assets/conf/tools.toml';
import { ToolsPromptInterface } from '@src/types';
import { Handlebars } from '@src/../third-party/kbn-handlebars/src/handlebars';
import { StorageManager } from '@src/utils/StorageManager';
import { ToolPreview } from '@src/components/controls/ToolPreview';
import { Dropdown } from '@src/components/common/Dropdown';
import { useToolPreview } from '@src/shared/hooks/useToolPreview';

interface ToolDropdownProps {
  className: string;
  onItemClick: (_tool: Record<string, unknown>, _withCommand?: boolean) => void;
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

export function ToolDropdown({ className, onItemClick, initOpen, statusListener, buttonDisplay }: ToolDropdownProps) {
  const [allTools, setAllTools] = useState<ToolsPromptInterface[]>([]);
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const [selectedToolName, setSelectedToolName] = useState<string>('Send'); // 默认显示 Send
  const { showPreview, previewPos, previewContent, showToolPreview, hideToolPreview } = useToolPreview();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleMainButtonClick = (_e: React.MouseEvent) => {
    // 直接使用当前选中的工具或第一个工具
    const targetTool = selectedTool ? allTools.find(t => t.id === selectedTool) : allTools[0];

    if (targetTool) {
      console.log('[AskToolDropdown] main button clicked, sending tool:', targetTool.name);
      // 将 ToolsPromptInterface 转为 Record<string, unknown> 以匹配参数类型
      handleToolClick(targetTool as unknown as Record<string, unknown>, _e.metaKey || _e.ctrlKey);
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

  const handleToolClick = (item: Record<string, unknown>, isCommandPressed: boolean) => {
    // 通过类型保护确保必要属性存在
    if (!('id' in item && 'name' in item && 'hbs' in item && 'template' in item)) {
      return;
    }

    const toolId = String(item.id);
    const toolName = String(item.name);

    // TODO: Use cmd to pin the tool, it's not working now
    if (isCommandPressed) {
      StorageManager.setCurrentTool(toolId).then(() => {
        setSelectedTool(toolId);
        setSelectedToolName(toolName);
      });
    }

    onItemClick(item, isCommandPressed);
    hideToolPreview();
    statusListener(false); // Explicitly notify parent of status change
  };

  const renderToolItem = (item: Record<string, unknown>, index: number, active: boolean) => {
    // 通过类型保护确保必要属性存在
    if (!('name' in item)) {
      return <div>Invalid tool</div>;
    }

    const toolName = String(item.name);

    return (
      <div
        className={`${
          active ? 'bg-black text-white' : 'text-gray-900'
        } group flex w-full items-center rounded-md px-2 py-2 text-sm cursor-pointer`}
        onMouseEnter={e => {
          if (
            Object.prototype.hasOwnProperty.call(item, 'hbs') &&
            typeof item.hbs === 'string' &&
            dropdownRef.current
          ) {
            showToolPreview(e.currentTarget, dropdownRef.current, 'right', item.hbs as string);
          }
        }}
        onMouseLeave={hideToolPreview}>
        <span className="mr-2 inline-flex items-center justify-center w-5 h-5 text-xs font-semibold border border-gray-300 rounded">
          {index + 1}
        </span>
        <span className="whitespace-nowrap flex-1 flex justify-between items-center">
          <span>{toolName}</span>
          <span
            className={`ml-2 opacity-0 transition-all duration-100 ${active || 'group-hover:opacity-100'} ${
              active && 'opacity-100'
            }`}>
            [{navigator.platform.includes('Mac') ? '⌘' : 'Ctrl'} + Enter to Pin]
          </span>
        </span>
      </div>
    );
  };

  // 工具下拉菜单
  return (
    <div ref={dropdownRef} className="relative">
      <Dropdown
        displayName={selectedTool ? selectedToolName : '工具'}
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
        hoverMessage={`Send with Context [${selectedTool ? selectedToolName : '工具'}]`}
      />
      {showPreview && <ToolPreview content={previewContent} x={previewPos.x} y={previewPos.y} />}
    </div>
  );
}

export default ToolDropdown;
