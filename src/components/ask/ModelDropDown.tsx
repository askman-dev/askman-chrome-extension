import React, { useEffect, useState, useRef } from 'react';
import configStorage from '@src/shared/storages/configStorage';
import { BaseDropdown } from '../base/BaseDropdown';

interface ModelDropdownProps {
  className?: string;
  onItemClick: (_model: string, _withCommand?: boolean) => void;
  statusListener: (_status: boolean) => void;
  initOpen: boolean;
}

interface ModelItem {
  id: string;
  name: string;
  shortName: string;
  provider: string;
}

export default function ModelDropdown({ className, onItemClick, statusListener, initOpen }: ModelDropdownProps) {
  const [models, setModels] = useState<ModelItem[]>([]);
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const [selectedModelName, setSelectedModelName] = useState<string>('free'); // 默认显示 free
  const baseDropdownRef = useRef<HTMLDivElement>(null);

  // 辅助函数：简化模型名称显示
  const simplifyModelName = (name: string): string => {
    if (!name) return name;
    const parts = name.split('/').filter(part => part.trim() !== '');
    if (parts.length === 0) return name;
    return parts[parts.length - 1] || parts[parts.length - 2] || name;
  };

  useEffect(() => {
    const fetchModels = async () => {
      const userModels = (await configStorage.getModelConfig()) || [];
      const modelArray: ModelItem[] = [];
      userModels.forEach(({ provider, config }) => {
        if (config.models) {
          config.models.forEach(m => {
            modelArray.push({
              id: provider + '/' + (m.name || m.id),
              name: provider + '/' + (m.name || m.id),
              shortName: m.name || m.id,
              provider,
            });
          });
        }
      });
      setModels(modelArray);

      const currentModel = await configStorage.getCurrentModel();
      if (currentModel) {
        setSelectedModel(currentModel);
        const model = modelArray.find(m => m.id === currentModel);
        if (model) {
          setSelectedModelName(model.name);
        }
      }
    };

    fetchModels().catch(error => {
      console.error('Error fetching models:', error);
    });
  }, []);

  const handleModelClick = async (model: ModelItem, isCommandPressed: boolean) => {
    // Command+Enter 不保存设置
    if (!isCommandPressed) {
      await configStorage.setCurrentModel(model.id);
      setSelectedModel(model.id);
      setSelectedModelName(model.name);
    }
    onItemClick(model.name, isCommandPressed);
  };

  const renderModelItem = (model: ModelItem, index: number, active: boolean) => (
    <button
      className={`${
        active ? 'bg-black text-white' : 'text-gray-900'
      } group flex w-full items-center rounded-md px-2 py-2 text-sm focus:outline-none`}
      onClick={e => {
        e.preventDefault();
        handleModelClick(model, e.metaKey || e.ctrlKey);
        statusListener(false);
      }}>
      <span className="mr-2 inline-flex items-center justify-center w-5 h-5 text-xs font-semibold border border-gray-300 rounded">
        {index}
      </span>
      <span className="whitespace-nowrap flex-1 flex justify-between items-center">
        <span>{model.shortName}</span>
        <span
          className={`ml-2 opacity-0 transition-all duration-100 ${active || 'group-hover:opacity-100'} ${
            active && 'opacity-100'
          }`}>
          [{model.provider}]
        </span>
      </span>
    </button>
  );

  return (
    <div ref={baseDropdownRef} className="relative">
      <BaseDropdown
        displayName={simplifyModelName(selectedModelName)}
        className={className}
        onItemClick={handleModelClick}
        statusListener={statusListener}
        initOpen={initOpen}
        items={models}
        selectedId={selectedModel}
        showShortcut={false}
        renderItem={renderModelItem}
        align="right"
      />
    </div>
  );
}
