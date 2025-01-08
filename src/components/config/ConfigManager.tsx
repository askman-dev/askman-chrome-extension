import React, { useState, useEffect } from 'react';
import * as TOML from '@iarna/toml';
import ConfigEditorInstance from './ConfigEditorInstance';
import { StorageManager } from '../../utils/StorageManager';
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
  const [activeTab, setActiveTab] = useState('Preview');
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

      const savedUserObject = (await StorageManager.get(userConfigStorageKey)) || {};
      const savedUserConfig = TOML.stringify(savedUserObject);
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
    // Parse and save user tools
    try {
      const userConfigObj = TOML.parse(newConfig);
      StorageManager.save(userConfigStorageKey, userConfigObj);
      updateMergedConfig(newConfig, systemConfig);
      setUserConfig(newConfig);
    } catch (e) {
      console.error('Error saving user tools:', e);
    }
  };
  
  const renderActiveEditor = () => {
    // 生成一个包含所有相关信息的唯一 key
    const getEditorKey = (base: string) => {
      const key = `${configType}/${base}/${systemConfigPath}/${userConfigStorageKey}`;
      return key;
    };

    switch (activeTab) {
      case 'Preview':
        return (
          <ConfigEditorInstance
            key={getEditorKey('preview')}
            initialValue={mergedConfig}
            readOnly={true}
            filename={configType}
          />
        );
      case 'User Values':
        return (
          <ConfigEditorInstance
            key={getEditorKey('user')}
            initialValue={userConfig}
            readOnly={!isEditable}
            onSave={handleSaveUserConfig}
            filename={userConfigStorageKey}
          />
        );
      case 'System Values':
        return (
          <ConfigEditorInstance
            key={getEditorKey('system')}
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
        Here is the parameter configuration file. You can modify the “user values” to override the “system values.”
        <a className="pl-2" href="https://toml.io/cn/v1.0.0" target="_blank" rel="noreferrer noopener">
          🔗 Learn TOML syntax
        </a>
      </div>
      <div className="mb-4">
        {['Preview', 'User Values', 'System Values'].map(tab => (
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
