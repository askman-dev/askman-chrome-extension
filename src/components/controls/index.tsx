import React, { useEffect, useState, useRef } from 'react';
import configStorage from '@src/shared/storages/configStorage';
import { BaseDropdown } from '@src/components/common/Dropdown';
import { QuoteDropdown } from './QuoteDropdown';
import { SystemPromptDropdown } from './SystemPromptDropdown';
import { ToolDropdown } from './ToolDropdown';
import { ToolPreview } from './ToolPreview';

interface ModelSelectorProps {
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

export function ModelSelector({ className, onItemClick, statusListener, initOpen }: ModelSelectorProps) {
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

  // 修改以符合BaseDropdown期望的类型
  const handleModelClick = (item: Record<string, unknown>, isCommandPressed: boolean) => {
    // 安全地访问属性
    const id = item.id as string;
    const name = item.name as string;

    if (id && name) {
      if (!isCommandPressed) {
        configStorage.setCurrentModel(id).then(() => {
          setSelectedModel(id);
          setSelectedModelName(name);
        });
      }
      onItemClick(name, isCommandPressed);
      statusListener(false);
    }
  };

  // 修改以符合BaseDropdown期望的类型
  const renderModelItem = (item: Record<string, unknown>, index: number, active: boolean) => {
    const shortName = item.shortName as string;
    const provider = item.provider as string;

    if (!shortName) return <div>Invalid model</div>;

    return (
      <div
        className={`${
          active ? 'bg-black text-white' : 'text-gray-900'
        } group flex w-full items-center rounded-md px-2 py-2 text-sm cursor-pointer`}>
        <span className="mr-2 inline-flex items-center justify-center w-5 h-5 text-xs font-semibold border border-gray-300 rounded">
          {index}
        </span>
        <span className="whitespace-nowrap flex-1 flex justify-between items-center">
          <span>{shortName}</span>
          <span
            className={`ml-2 opacity-0 transition-all duration-100 ${active || 'group-hover:opacity-100'} ${
              active && 'opacity-100'
            }`}>
            [{provider}]
          </span>
        </span>
      </div>
    );
  };

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

// 导出所有控件组件
export { QuoteDropdown, SystemPromptDropdown, ToolDropdown, ToolPreview };

// 为了兼容旧的导入方式，提供默认导出
export default ModelSelector;
