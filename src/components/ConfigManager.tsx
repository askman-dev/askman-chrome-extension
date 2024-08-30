import React, { useState } from 'react';
// import configStorage from '@src/shared/storages/configStorage';

interface ConfigManagerProps {
  activeTab: string;
}

const ConfigManager: React.FC<ConfigManagerProps> = ({ activeTab }) => {
  const [configFile, setConfigFile] = useState('');

  const handleConfigFileChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setConfigFile(e.target.value);
  };

  const handleSaveConfig = () => {
    console.log('Saving config:', configFile);
  };

  if (activeTab === '配置文件') {
    return (
      <div>
        <h2 className="text-lg font-bold mb-2">配置文件</h2>
        <p className="text-sm text-gray-600 mb-2">config.toml</p>
        <textarea
          className="w-full h-64 p-2 bg-gray-200 rounded resize-none font-mono mb-4"
          value={configFile}
          onChange={handleConfigFileChange}
          placeholder="Enter your config.toml here"
        />
        <div className="flex justify-end">
          <button className="px-4 py-2 bg-gray-700 text-white rounded" onClick={handleSaveConfig}>
            加载配置
          </button>
        </div>
      </div>
    );
  }

  // Placeholder for other tabs
  return <div>Content for {activeTab}</div>;
};

export default ConfigManager;
