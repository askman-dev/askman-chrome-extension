import React, { useEffect, useState } from 'react';
import { StorageManager, SystemPresetInterface } from '../utils/StorageManager';
import { ToolPreview } from './tool-preview';
import { BaseDropdown } from './base/BaseDropdown';
import { useToolPreview } from '@src/shared/hooks/useToolPreview';

interface SystemPromptDropdownProps {
  className: string;
  statusListener?: (_status: boolean) => void;
  initOpen?: boolean;
}

export default function SystemPromptDropdown({
  className,
  statusListener = () => {},
  initOpen = false,
}: SystemPromptDropdownProps) {
  const [systemPresets, setSystemPresets] = useState<SystemPresetInterface[]>([]);
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const { showPreview, previewPos, previewContent, showToolPreview, hideToolPreview } = useToolPreview();

  useEffect(() => {
    console.log('[SystemPromptDropdown] Component mounted');
    const fetchPresets = async () => {
      try {
        const presets = await StorageManager.getSystemPresets();
        setSystemPresets(presets);

        const currentPreset = await StorageManager.getCurrentSystemPreset();
        console.log('[SystemPromptDropdown] Current preset:', currentPreset);
        setSelectedPreset(currentPreset || 'system-init');
      } catch (error) {
        console.error('Error fetching presets:', error);
      }
    };

    fetchPresets();
  }, []);

  useEffect(() => {
    console.log('[SystemPromptDropdown] Props changed:', { initOpen });
  }, [initOpen]);

  const handleSystemPresetClick = async (preset: SystemPresetInterface) => {
    try {
      console.log('[SystemPromptDropdown] Handling preset click:', preset.name);
      await StorageManager.setCurrentSystemPreset(preset.name);
      console.log('[SystemPromptDropdown] Preset updated to:', preset.name);
      setSelectedPreset(preset.name);
      hideToolPreview();
      statusListener(false);
    } catch (error) {
      console.error('Error setting system preset:', error);
    }
  };

  const renderSystemPresetItem = (preset: SystemPresetInterface, index: number, active: boolean) => (
    <button
      className={`${
        active ? 'bg-black text-white' : 'text-gray-900'
      } group flex w-full items-center rounded-md px-2 py-2 text-sm focus:outline-none`}
      onClick={() => handleSystemPresetClick(preset)}
      onMouseEnter={e => showToolPreview(e.currentTarget, preset.hbs)}
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
    <>
      <BaseDropdown
        displayName={selectedPreset === 'system-init' || !selectedPreset ? 'System Prompt' : selectedPreset}
        className={className}
        onItemClick={handleSystemPresetClick}
        statusListener={statusListener}
        initOpen={initOpen}
        items={systemPresets.map(preset => ({
          id: preset.name,
          name: preset.name,
          ...preset,
        }))}
        selectedId={selectedPreset || undefined}
        showShortcut={false}
        renderItem={renderSystemPresetItem}
      />
      {showPreview && <ToolPreview content={previewContent} x={previewPos.x} y={previewPos.y} />}
    </>
  );
}
