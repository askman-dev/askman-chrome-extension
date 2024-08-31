import React, { useState, useEffect } from 'react';
import * as TOML from '@iarna/toml';
import models from '@assets/conf/models.toml';
import ConfigEditorInstance from './ConfigEditorInstance';

const ConfigManager: React.FC = () => {
  const [activeModelTab, setActiveModelTab] = useState('用户值');
  const [systemConfig, setSystemConfig] = useState('');
  const [userConfig, setUserConfig] = useState('');
  const [mergedConfig, setMergedConfig] = useState('');

  useEffect(() => {
    const systemConfigStr = TOML.stringify(models);
    setSystemConfig(systemConfigStr);
    const savedUserConfig = localStorage.getItem('userModelConfig') || '';
    setUserConfig(savedUserConfig);
    updateMergedConfig(savedUserConfig);
  }, []);

  const updateMergedConfig = (userConfigStr: string) => {
    try {
      const userConfigObj = TOML.parse(userConfigStr);
      const mergedConfigObj = { ...models, ...userConfigObj };
      setMergedConfig(TOML.stringify(mergedConfigObj));
    } catch (e) {
      console.error('Error merging configs:', e);
    }
  };

  const handleSaveUserConfig = (newConfig: string) => {
    setUserConfig(newConfig);
    localStorage.setItem('userModelConfig', newConfig);
    updateMergedConfig(newConfig);
  };

  const renderActiveEditor = () => {
    switch (activeModelTab) {
      case '用户值':
        return <ConfigEditorInstance initialValue={userConfig} readOnly={false} onSave={handleSaveUserConfig} />;
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
      <div className="mb-4">
        {['用户值', '系统值', '预览'].map(tab => (
          <button
            key={tab}
            className={`mr-2 px-4 py-2 ${activeModelTab === tab ? 'bg-blue-500 text-white' : 'bg-gray-200'} rounded`}
            onClick={() => setActiveModelTab(tab)}>
            {tab}
          </button>
        ))}
      </div>
      {renderActiveEditor()}
    </div>
  );
};

export default ConfigManager;
