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
  const [activeTab, setActiveTab] = useState('用户值');
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
      case '用户值':
        return <ConfigEditorInstance initialValue={userConfig} readOnly={!isEditable} onSave={handleSaveUserConfig} />;
      case '系统值':
        return <ConfigEditorInstance initialValue={systemConfig} readOnly={true} />;
      case '预览':
        return <ConfigEditorInstance initialValue={mergedConfig} readOnly={true} />;
      default:
        return null;
    }
  };

  return (
    <div>
      <h2>{configType}</h2>
      <div className="mb-4">
        {['用户值', '系统值', '预览'].map(tab => (
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
