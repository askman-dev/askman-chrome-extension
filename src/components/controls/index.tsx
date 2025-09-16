import React, { useEffect, useState, useRef } from 'react';
import configStorage from '@src/shared/storages/configStorage';
import { BaseDropdown } from '@src/components/common/Dropdown';
import { QuoteDropdown } from './QuoteDropdown';
import { SystemPromptDropdown } from './SystemPromptDropdown';
import { ToolDropdown } from './ToolDropdown';
import { ToolPreview } from './ToolPreview';
import { ChatBubbleOvalLeftIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/20/solid';

interface ModelSelectorProps {
  className?: string;
  onItemClick: (_model: string, _isAgentModel: boolean, _withCommand?: boolean) => void;
  statusListener: (_status: boolean) => void;
  initOpen: boolean;
}

interface ModelItem {
  id: string;
  name: string;
  shortName: string;
  provider: string;
  group: 'agent' | 'chat';
}

export function ModelSelector({ className, onItemClick, statusListener, initOpen }: ModelSelectorProps) {
  const [models, setModels] = useState<ModelItem[]>([]);
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const [selectedModelName, setSelectedModelName] = useState<string>('free'); // 默认显示 free
  const [isAgentMode, setIsAgentMode] = useState<boolean>(false); // 记录当前模式
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
            const baseModelItem: ModelItem = {
              id: provider + '/' + (m.name || m.id),
              name: provider + '/' + (m.name || m.id),
              shortName: m.name || m.id,
              provider,
              group: 'chat',
            };

            // Sonnet 检测 - 自动生成 agent 版本
            if (baseModelItem.name.toLowerCase().includes('sonnet')) {
              // 添加 agent 版本
              modelArray.push({
                id: baseModelItem.id + ':agent',
                name: baseModelItem.name,
                shortName: baseModelItem.shortName,
                provider: baseModelItem.provider,
                group: 'agent',
              });
            }

            // 添加原始 chat 版本
            modelArray.push(baseModelItem);
          });
        }
      });

      // 按组排序：agent 模型在前，chat 模型在后
      const agentModels = modelArray.filter(m => m.group === 'agent');
      const chatModels = modelArray.filter(m => m.group === 'chat');
      const sortedModels = [...agentModels, ...chatModels];

      setModels(sortedModels);

      const currentModel = await configStorage.getCurrentModel();
      if (currentModel) {
        setSelectedModel(currentModel);
        const model = sortedModels.find(m => m.id === currentModel);
        if (model) {
          setSelectedModelName(model.name);
          // 初始化时设置模式状态
          setIsAgentMode(model.group === 'agent');
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
    const group = item.group as string;

    if (id && name) {
      if (!isCommandPressed) {
        configStorage.setCurrentModel(id).then(() => {
          setSelectedModel(id);
          setSelectedModelName(name);
        });
      }
      // 更新内部模式状态
      setIsAgentMode(group === 'agent');

      onItemClick(id, group === 'agent', isCommandPressed);
      statusListener(false);
    }
  };

  // 支持分组渲染的函数
  const renderGroupedItems = (item: Record<string, unknown>, index: number, active: boolean, isSelected?: boolean) => {
    const shortName = item.shortName as string;
    const provider = item.provider as string;
    const group = item.group as string;

    if (!shortName) return <div>Invalid model</div>;

    // 检查是否需要显示组标题
    const isFirstInGroup = index === 0 || (models[index - 1] && models[index - 1].group !== group);
    const agentModels = models.filter(m => m.group === 'agent');
    const chatModels = models.filter(m => m.group === 'chat');

    // 计算在组内的索引
    let groupIndex;
    if (group === 'agent') {
      groupIndex = agentModels.findIndex(m => m.id === item.id);
    } else {
      groupIndex = chatModels.findIndex(m => m.id === item.id);
    }

    // 为 agent 模型使用字母编号，chat 模型使用数字编号
    const displayIndex = group === 'agent' ? String.fromCharCode(97 + groupIndex) : groupIndex;

    return (
      <div>
        {/* 组标题 */}
        {isFirstInGroup && (
          <>
            {group === 'agent' && agentModels.length > 0 && (
              <div className="px-2 py-1 text-xs font-semibold text-gray-400 uppercase tracking-wider text-left">
                AGENT MODELS
              </div>
            )}
            {group === 'chat' && chatModels.length > 0 && (
              <>
                {agentModels.length > 0 && <div className="my-1 border-t border-gray-200" />}
                <div className="px-2 py-1 text-xs font-semibold text-gray-400 uppercase tracking-wider text-left">
                  CHAT MODELS
                </div>
              </>
            )}
          </>
        )}

        {/* 模型项 */}
        <div
          className={`${
            active ? 'bg-black text-white' : 'text-gray-900'
          } group flex w-full items-center rounded-md px-2 py-2 text-sm cursor-pointer`}>
          <span className="mr-2 inline-flex items-center justify-center w-5 h-5 text-xs font-semibold border border-gray-300 rounded">
            {displayIndex}
          </span>
          <span className="whitespace-nowrap flex-1 flex justify-between items-center">
            <span>{shortName}</span>
            <div className="flex items-center gap-2">
              {group === 'chat' && (
                <span
                  className={`ml-2 text-xs opacity-0 transition-all duration-100 ${
                    active || 'group-hover:opacity-100'
                  } ${active && 'opacity-100'}`}>
                  [{provider}]
                </span>
              )}
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
      </div>
    );
  };

  return (
    <div ref={baseDropdownRef} className="relative">
      <BaseDropdown
        displayName=""
        buttonDisplay={
          <div className="flex items-center gap-1.5">
            {isAgentMode ? (
              <ChatBubbleLeftRightIcon className="h-3.5 w-3.5 text-gray-500" />
            ) : (
              <ChatBubbleOvalLeftIcon className="h-3.5 w-3.5 text-gray-500" />
            )}
            <span>{simplifyModelName(selectedModelName)}</span>
          </div>
        }
        className={className}
        onItemClick={handleModelClick}
        statusListener={statusListener}
        initOpen={initOpen}
        items={models}
        selectedId={selectedModel}
        showShortcut={false}
        renderItem={renderGroupedItems}
        align="right"
        hoverMessage={`Model [${simplifyModelName(selectedModelName)}]`}
        variant="icon-text"
      />
    </div>
  );
}

// 导出所有控件组件
export { QuoteDropdown, SystemPromptDropdown, ToolDropdown, ToolPreview };

// 为了兼容旧的导入方式，提供默认导出
export default ModelSelector;
