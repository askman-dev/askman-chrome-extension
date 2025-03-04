import React, { useEffect, useState, useRef } from 'react';
import { StorageManager, SystemPresetInterface } from '@src/utils/StorageManager';
import { ToolPreview } from '@src/components/features/controls/ToolPreview';
import { BaseDropdown } from '@src/components/common/Dropdown';
import { useToolPreview } from '@src/shared/hooks/useToolPreview';

interface SystemPromptDropdownProps {
  className: string;
  statusListener?: (_status: boolean) => void;
  initOpen?: boolean;
  onItemClick?: (_preset: SystemPresetInterface, _withCommand?: boolean) => void;
}

export function SystemPromptDropdown({
  className,
  statusListener = () => {},
  initOpen = false,
  onItemClick = () => {},
}: SystemPromptDropdownProps) {
  const [systemPresets, setSystemPresets] = useState<SystemPresetInterface[]>([]);
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const { showPreview, previewPos, previewContent, showToolPreview, hideToolPreview } = useToolPreview();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 获取系统预设列表和当前选中的预设
  useEffect(() => {
    const fetchPresets = async () => {
      try {
        // 获取预设列表
        const presets = await StorageManager.getSystemPresets();
        setSystemPresets(presets);

        // 获取当前选择的预设
        const currentPreset = await StorageManager.getCurrentSystemPreset();
        setSelectedPreset(currentPreset || 'system-init');
      } catch (error) {
        console.error('Error fetching system presets:', error);
      }
    };

    fetchPresets();
  }, []);

  // 处理预设点击事件
  const handlePresetClick = async (preset: SystemPresetInterface, isCommandPressed?: boolean) => {
    try {
      // 只有在非Command点击时才保存设置
      if (!isCommandPressed) {
        await StorageManager.setCurrentSystemPreset(preset.name);
        setSelectedPreset(preset.name);
      }
      hideToolPreview();
      statusListener(false);
      onItemClick(preset, isCommandPressed);
    } catch (error) {
      console.error('Error setting system preset:', error);
    }
  };

  // 渲染预设项
  const renderPresetItem = (preset: SystemPresetInterface, index: number, active: boolean) => (
    <button
      className={`${
        active ? 'bg-black text-white' : 'text-gray-900'
      } group flex w-full items-center rounded-md px-2 py-2 text-sm focus:outline-none`}
      onClick={e => {
        e.preventDefault();
        handlePresetClick(preset, e.metaKey || e.ctrlKey);
        statusListener(false);
      }}
      onMouseEnter={e => {
        if (dropdownRef.current) {
          showToolPreview(e.currentTarget, dropdownRef.current, 'left', preset.hbs);
        }
      }}
      onMouseLeave={hideToolPreview}>
      <span className="mr-2 inline-flex items-center justify-center w-5 h-5 text-xs font-semibold border border-gray-300 rounded">
        {index}
      </span>
      <span className="flex items-center justify-between w-full">
        <span>{preset.name}</span>
      </span>
    </button>
  );

  return (
    <div ref={dropdownRef} className="relative">
      <BaseDropdown
        displayName={selectedPreset === 'system-init' || !selectedPreset ? 'System Prompt' : selectedPreset}
        className={className}
        onItemClick={handlePresetClick}
        statusListener={statusListener}
        initOpen={initOpen}
        items={systemPresets.map(preset => ({
          id: preset.name,
          name: preset.name,
          ...preset,
        }))}
        selectedId={selectedPreset || undefined}
        showShortcut={true}
        shortcutKey="⌘ KK"
        renderItem={renderPresetItem}
      />
      {showPreview && <ToolPreview content={previewContent} x={previewPos.x} y={previewPos.y} />}
    </div>
  );
}

// 为了向后兼容
export default SystemPromptDropdown;
