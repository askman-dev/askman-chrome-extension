import React, { useEffect, useState } from 'react';
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

export default function ToolDropdown({
  displayName,
  className,
  onItemClick,
  initOpen,
  statusListener,
}: ToolDropdownProps) {
  const [allTools, setAllTools] = useState<ToolsPromptInterface[]>([]);
  const { showPreview, previewPos, previewContent, showToolPreview, hideToolPreview } = useToolPreview();

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
        setAllTools([...tools, ...userTools]);
      } catch (error) {
        console.error('Error fetching tools:', error);
      }
    };

    fetchTools();
  }, []);

  const renderToolItem = (tool: ToolsPromptInterface, index: number, active: boolean) => (
    <button
      className={`${
        active ? 'bg-black text-white' : 'text-gray-900'
      } group flex w-full items-center rounded-md px-2 py-2 text-sm focus:outline-none`}
      onClick={_e => {
        onItemClick(tool, false);
        hideToolPreview();
        statusListener(false);
      }}
      onMouseDown={() => {
        onItemClick(tool, false);
        hideToolPreview();
        statusListener(false);
      }}
      onMouseEnter={e => showToolPreview(e.currentTarget, tool.hbs)}
      onMouseLeave={hideToolPreview}>
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
  );

  return (
    <>
      <BaseDropdown
        displayName={displayName}
        className={className}
        onItemClick={onItemClick}
        statusListener={statusListener}
        initOpen={initOpen}
        items={allTools}
        renderItem={renderToolItem}
      />
      {showPreview && <ToolPreview content={previewContent} x={previewPos.x} y={previewPos.y} />}
    </>
  );
}
