import React, { useState, useEffect } from 'react';
import * as TOML from '@iarna/toml';
import ConfigEditorInstance from './ConfigEditorInstance';

interface ConfigManagerProps {
  configType: string;
  systemConfigPath: string;
  userConfigStorageKey: string;
  isEditable: boolean;
}

const ConfigManager: React.FC<ConfigManagerProps> = ({
  configType,
  systemConfigPath,
  userConfigStorageKey,
  isEditable,
}) => {
  const [activeTab, setActiveTab] = useState('预览');
  const [systemConfig, setSystemConfig] = useState('');
  const [userConfig, setUserConfig] = useState('');
  const [mergedConfig, setMergedConfig] = useState('');

  useEffect(() => {
    loadConfigs();
  }, [systemConfigPath, userConfigStorageKey]);

  const loadConfigs = async () => {
    try {
      const systemConfigResponse = await fetch(systemConfigPath);
      const systemConfigStr = await systemConfigResponse.text();
      setSystemConfig(systemConfigStr);

      const savedUserConfig = localStorage.getItem(userConfigStorageKey) || '';
      setUserConfig(savedUserConfig);

      updateMergedConfig(savedUserConfig, systemConfigStr);
    } catch (e) {
      console.error('Error loading configs:', e);
    }
  };

  const updateMergedConfig = (userConfigStr: string, systemConfigStr: string) => {
    try {
      const userConfigObj = TOML.parse(userConfigStr);
      const systemConfigObj = TOML.parse(systemConfigStr);
      const mergedConfigObj = { ...systemConfigObj, ...userConfigObj };
      setMergedConfig(TOML.stringify(mergedConfigObj));
    } catch (e) {
      console.error('Error merging configs:', e);
    }
  };

  const handleSaveUserConfig = (newConfig: string) => {
    setUserConfig(newConfig);
    localStorage.setItem(userConfigStorageKey, newConfig);
    updateMergedConfig(newConfig, systemConfig);
  };

  const renderActiveEditor = () => {
    switch (activeTab) {
      case '预览':
        return (
          <ConfigEditorInstance
            key={configType + '/preview'}
            initialValue={mergedConfig}
            readOnly={true}
            filename={configType}
          />
        );
      case '用户值':
        return (
          <ConfigEditorInstance
            key={configType + '/user'}
            initialValue={userConfig}
            readOnly={!isEditable}
            onSave={handleSaveUserConfig}
            filename={userConfigStorageKey}
          />
        );
      case '系统值':
        return (
          <ConfigEditorInstance
            key={configType + '/system'}
            initialValue={systemConfig}
            readOnly={true}
            filename={systemConfigPath}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-2">{configType}</h2>
      <div className="text-lg mb-4">
        这里是参数配置文件。你可以修改「用户值」来覆盖「系统值」。
        <a className="pl-2" href="https://toml.io/cn/v1.0.0" target="_blank" rel="noreferrer noopener">
          🔗 学习 TOML 语法
        </a>
      </div>
      <div className="mb-4">
        {['预览', '用户值', '系统值'].map(tab => (
          <button
            key={tab}
            className={`mr-2 px-4 py-2 ${activeTab === tab ? 'bg-blue-500 text-white' : 'bg-gray-200'} rounded`}
            onClick={() => setActiveTab(tab)}>
            {tab}
          </button>
        ))}
      </div>
      {renderActiveEditor()}
    </div>
  );
};

export default ConfigManager;
