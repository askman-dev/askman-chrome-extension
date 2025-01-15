import React, { useEffect, useState, useRef } from 'react';
import configStorage from '@src/shared/storages/configStorage';
import { BaseDropdown } from '../base/BaseDropdown';

interface ModelDropdownProps {
  displayName: string;
  className?: string;
  onItemClick: (_model: string, _isCommandPressed: boolean) => void;
  statusListener: (_status: boolean) => void;
  initOpen: boolean;
}

interface ModelItem {
  id: string;
  name: string;
  shortName: string;
  provider: string;
}

export default function ModelDropdown({
  displayName,
  initOpen,
  className,
  onItemClick,
  statusListener,
}: ModelDropdownProps) {
  const [models, setModels] = useState<ModelItem[]>([]);
  const baseDropdownRef = useRef<HTMLDivElement>(null);

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
    };

    fetchModels().catch(error => {
      console.error('Error fetching models:', error);
    });
  }, []);

  const renderModelItem = (model: ModelItem, index: number, active: boolean) => (
    <button
      className={`${
        active ? 'bg-black text-white' : 'text-gray-900'
      } flex w-full items-center rounded-md px-2 py-2 text-sm focus:outline-none group`}
      onMouseDown={() => {
        onItemClick(model.name, false);
        statusListener(false);
      }}>
      <span className="mr-2 inline-flex items-center justify-center w-5 h-5 text-xs font-semibold border border-gray-300 rounded">
        {index}
      </span>
      <span className="whitespace-nowrap flex-1 flex justify-between items-center">
        <span>{model.shortName}</span>
        <span className="text-gray-400 ml-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          [{model.provider}]
        </span>
      </span>
    </button>
  );

  return (
    <div ref={baseDropdownRef} className="relative">
      <BaseDropdown
        displayName={displayName}
        className={className}
        onItemClick={model => {
          onItemClick(model.name, false);
        }}
        statusListener={statusListener}
        initOpen={initOpen}
        items={models}
        shortcutKey="⌘ KK"
        renderItem={renderModelItem}
        align="right"
      />
    </div>
  );
}
