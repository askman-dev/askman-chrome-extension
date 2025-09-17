import React, { useEffect, useState, useRef } from 'react';
import defaultShortcuts from '@assets/conf/shortcuts.toml';
import { ShortcutInterface } from '@src/types';
import { Handlebars } from '@src/../third-party/kbn-handlebars/src/handlebars';
import { StorageManager } from '@src/utils/StorageManager';
import { ShortcutPreview } from '@src/components/controls/ShortcutPreview';
import { Dropdown } from '@src/components/common/Dropdown';
import { useToolPreview } from '@src/shared/hooks/useToolPreview';

interface ShortcutSenderProps {
  className: string;
  onItemClick: (_shortcut: Record<string, unknown>, _withCommand?: boolean) => void;
  statusListener: (_status: boolean) => void;
  initOpen: boolean;
  buttonDisplay?: string;
}

const shortcuts: ShortcutInterface[] = [];

for (const k in defaultShortcuts) {
  try {
    shortcuts.push({
      id: defaultShortcuts[k].name,
      name: defaultShortcuts[k].name,
      hbs: defaultShortcuts[k].hbs,
      template: Handlebars.compileAST(defaultShortcuts[k].hbs),
    });
  } catch (e) {
    console.error('Cannot parse default shortcuts', e);
  }
}

export { shortcuts };

export function ShortcutSender({
  className,
  onItemClick,
  initOpen,
  statusListener,
  buttonDisplay,
}: ShortcutSenderProps) {
  const [allShortcuts, setAllShortcuts] = useState<ShortcutInterface[]>([]);
  const [selectedShortcut, setSelectedShortcut] = useState<string | null>(null);
  const [selectedShortcutName, setSelectedShortcutName] = useState<string>('No Context'); // 默认显示 No Context
  const { showPreview, previewPos, previewContent, showToolPreview, hideToolPreview } = useToolPreview();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleMainButtonClick = (_e: React.MouseEvent) => {
    // 直接使用当前选中的快捷键或第一个快捷键
    const targetShortcut = selectedShortcut ? allShortcuts.find(s => s.id === selectedShortcut) : allShortcuts[0];

    if (targetShortcut) {
      // 将 ShortcutInterface 转为 Record<string, unknown> 以匹配参数类型
      handleShortcutClick(targetShortcut as unknown as Record<string, unknown>, _e.metaKey || _e.ctrlKey);
    }
  };

  useEffect(() => {
    const fetchShortcuts = async () => {
      try {
        const userShortcutSettings = await StorageManager.getUserShortcuts();
        const userShortcuts = Object.values(userShortcutSettings).map(shortcut => ({
          id: shortcut.name,
          name: shortcut.name,
          hbs: shortcut.hbs,
          template: Handlebars.compileAST(shortcut.hbs),
        }));
        const allShortcutsList = [...shortcuts, ...userShortcuts];
        setAllShortcuts(allShortcutsList);

        // 获取当前选中的快捷键
        const currentShortcut = await StorageManager.getCurrentShortcut();
        setSelectedShortcut(currentShortcut || null);

        // 更新按钮显示的文字
        if (currentShortcut) {
          const shortcut = allShortcutsList.find(s => s.id === currentShortcut);
          if (shortcut) {
            setSelectedShortcutName(shortcut.name);
          }
        }
      } catch (error) {
        console.error('Error fetching shortcuts:', error);
      }
    };

    fetchShortcuts();
  }, []);

  const handleShortcutClick = (item: Record<string, unknown>, isCommandPressed: boolean) => {
    // 通过类型保护确保必要属性存在
    if (!('id' in item && 'name' in item && 'hbs' in item && 'template' in item)) {
      return;
    }

    const shortcutId = String(item.id);
    const shortcutName = String(item.name);

    // TODO: Use cmd to pin the shortcut, it's not working now
    if (isCommandPressed) {
      StorageManager.setCurrentShortcut(shortcutId).then(() => {
        setSelectedShortcut(shortcutId);
        setSelectedShortcutName(shortcutName);
      });
    }

    onItemClick(item, isCommandPressed);
    hideToolPreview();
    statusListener(false); // Explicitly notify parent of status change
  };

  const renderShortcutItem = (item: Record<string, unknown>, index: number, active: boolean) => {
    // 通过类型保护确保必要属性存在
    if (!('name' in item)) {
      return <div>Invalid shortcut</div>;
    }

    const shortcutName = String(item.name);

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
          <span>{shortcutName}</span>
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

  // 快捷键下拉菜单
  return (
    <div ref={dropdownRef} className="relative">
      <Dropdown
        displayName={selectedShortcutName === 'No Context' ? '' : selectedShortcutName}
        className={className}
        onItemClick={handleShortcutClick}
        statusListener={statusListener}
        initOpen={initOpen}
        items={allShortcuts}
        selectedId={selectedShortcut}
        shortcutKey={navigator.platform.includes('Mac') ? '⌘ K' : 'Ctrl K'}
        renderItem={renderShortcutItem}
        align="right"
        buttonDisplay={buttonDisplay}
        onMainButtonClick={handleMainButtonClick}
        hoverMessage={`Send with Context [${selectedShortcut ? selectedShortcutName : '快捷键'}]`}
        hasBackground={false}
      />
      {showPreview && <ShortcutPreview content={previewContent} x={previewPos.x} y={previewPos.y} />}
    </div>
  );
}

export default ShortcutSender;
