import React, { useState, useEffect } from 'react';
import models from '@assets/conf/models.toml';

interface ConfigManagerProps {
  activeTab: string;
}

const ConfigManager: React.FC<ConfigManagerProps> = ({ activeTab }) => {
  const [activeModelTab, setActiveModelTab] = useState('用户值');
  const [userConfig, setUserConfig] = useState('');
  const [systemConfig, setSystemConfig] = useState('');
  const [mergedConfig, setMergedConfig] = useState('');

  useEffect(() => {
    // 加载系统配置
    setSystemConfig(JSON.stringify(models, null, 2));

    // 从 localStorage 加载用户配置
    const savedUserConfig = localStorage.getItem('userModelConfig');
    if (savedUserConfig) {
      setUserConfig(savedUserConfig);
    }

    // 合并配置
    mergeConfigs();
  }, []);

  const mergeConfigs = () => {
    // 这里需要实现合并逻辑
    // 暂时只是占位
    setMergedConfig('Merged configuration will be shown here');
  };

  const handleUserConfigChange = (value: string) => {
    setUserConfig(value);
    localStorage.setItem('userModelConfig', value);
    mergeConfigs();
  };

  const renderModelContent = () => {
    switch (activeModelTab) {
      case '用户值':
        return (
          <div>
            <textarea
              className="w-full h-64 p-2 border rounded font-mono"
              value={userConfig}
              onChange={e => handleUserConfigChange(e.target.value)}
              placeholder="Enter your custom model configuration here"
            />
            <button
              className="mt-2 px-4 py-2 bg-blue-500 text-white rounded"
              onClick={() => localStorage.setItem('userModelConfig', userConfig)}>
              保存配置
            </button>
          </div>
        );
      case '系统值':
        return <pre className="w-full h-64 p-2 border rounded font-mono overflow-auto">{systemConfig}</pre>;
      case '预览':
        return <pre className="w-full h-64 p-2 border rounded font-mono overflow-auto">{mergedConfig}</pre>;
      default:
        return null;
    }
  };

  if (activeTab !== '模型列表') {
    return null;
  }

  return (
    <div>
      <h2 className="text-lg font-bold mb-4">模型列表</h2>
      <div className="mb-4">
        {['用户值', '系统值', '预览'].map(tab => (
          <button
            key={tab}
            className={`mr-2 px-4 py-2 rounded ${activeModelTab === tab ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            onClick={() => setActiveModelTab(tab)}>
            {tab}
          </button>
        ))}
      </div>
      {renderModelContent()}
    </div>
  );
};

export default ConfigManager;
