import React, { useEffect, useState, useRef } from 'react';
import configStorage from '@src/shared/storages/configStorage';
import { BaseDropdown } from '@src/components/common/Dropdown';
import { QuoteDropdown } from './QuoteDropdown';
import { SystemPromptDropdown } from './SystemPromptDropdown';
import { ToolDropdown } from './ToolDropdown';
import { ToolPreview } from './ToolPreview';
// Icons removed for cleaner interface

interface ModelSelectorProps {
  className?: string;
  onItemClick: (_model: string, _isSonnetOrWithCommand?: boolean, _withCommand?: boolean) => void;
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
            const modelItem: ModelItem = {
              id: provider + '/' + (m.name || m.id),
              name: provider + '/' + (m.name || m.id),
              shortName: m.name || m.id,
              provider,
            };

            modelArray.push(modelItem);
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
      // 检查是否为 Sonnet 模型，由 PagePanel 决定是否显示 ModeToggle
      const isSonnet = name.toLowerCase().includes('sonnet');

      // 支持两种调用模式：
      // 1. PagePanel: onItemClick(model, isSonnet, withCommand) - 3个参数
      // 2. Prism: onItemClick(model, withCommand) - 2个参数
      if (onItemClick.length >= 3) {
        // 新接口：传递 isSonnet 信息
        onItemClick(id, isSonnet, isCommandPressed);
      } else {
        // 旧接口：直接传递 withCommand
        (onItemClick as (_id: string, _withCommand?: boolean) => void)(id, isCommandPressed);
      }
      statusListener(false);
    }
  };

  // 简化的模型渲染函数
  const renderModelItem = (item: Record<string, unknown>, index: number, active: boolean, isSelected?: boolean) => {
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
          <div className="flex items-center gap-2">
            <span
              className={`ml-2 text-xs opacity-0 transition-all duration-100 ${active || 'group-hover:opacity-100'} ${
                active && 'opacity-100'
              }`}>
              [{provider}]
            </span>
            {isSelected && (
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                />
              </svg>
            )}
          </div>
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
        hoverMessage={`Model [${simplifyModelName(selectedModelName)}]`}
        variant="button"
      />
    </div>
  );
}

// 导出所有控件组件
export { QuoteDropdown, SystemPromptDropdown, ToolDropdown, ToolPreview };
export { ModeToggle } from './ModeToggle';

// 为了兼容旧的导入方式，提供默认导出
export default ModelSelector;
