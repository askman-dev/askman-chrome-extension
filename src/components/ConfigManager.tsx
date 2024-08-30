import React, { useState, useEffect } from 'react';
import chatPresets from '@assets/conf/chat-presets.toml';
import models from '@assets/conf/models.toml';
// import configStorage from '@src/shared/storages/configStorage';

interface ConfigManagerProps {
  activeTab: string;
}

const ConfigManager: React.FC<ConfigManagerProps> = ({ activeTab }) => {
  const [configFile, setConfigFile] = useState('');
  const [chatPresetsContent, setChatPresetsContent] = useState('');
  const [modelsContent, setModelsContent] = useState('');

  useEffect(() => {
    const chatPresetsText = Object.entries(chatPresets)
      .map(
        ([key, value]) =>
          `[${key}]\n${Object.entries(value)
            .map(([k, v]) => `${k} = "${v}"`)
            .join('\n')}`,
      )
      .join('\n\n');
    setChatPresetsContent(chatPresetsText);

    const modelsText = Object.entries(models)
      .map(([provider, config]) => {
        let providerText = `[${provider}]\n`;
        Object.entries(config).forEach(([key, value]) => {
          if (key === 'models') {
            providerText += 'models = [\n';
            if (Array.isArray(value)) {
              value.forEach(model => {
                if (typeof model === 'string') {
                  providerText += `  "${model}",\n`;
                } else if (typeof model === 'object') {
                  providerText += `  { name = "${model.name}", max_tokens = ${model.max_tokens} },\n`;
                }
              });
            }
            providerText += ']\n';
          } else {
            providerText += `${key} = "${value}"\n`;
          }
        });
        return providerText;
      })
      .join('\n');

    setModelsContent(modelsText);
  }, []);

  const handleConfigFileChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setConfigFile(e.target.value);
  };

  const handleSaveConfig = () => {
    console.log('Saving config:', configFile);
  };

  const renderContent = () => {
    switch (activeTab) {
      case '配置文件':
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
      case '对话偏好':
        return (
          <div>
            <h2 className="text-lg font-bold mb-2">对话偏好</h2>
            <p className="text-sm text-gray-600 mb-2">chat-presets.toml</p>
            <textarea
              className="w-full h-64 p-2 bg-gray-200 rounded resize-none font-mono mb-4"
              value={chatPresetsContent}
              readOnly
              placeholder="Loading chat-presets.toml..."
            />
          </div>
        );
      case '模型列表':
        return (
          <div>
            <h2 className="text-lg font-bold mb-2">模型列表</h2>
            <p className="text-sm text-gray-600 mb-2">models.toml</p>
            <textarea
              className="w-full h-64 p-2 bg-gray-200 rounded resize-none font-mono mb-4"
              value={modelsContent}
              readOnly
              placeholder="Loading models.toml..."
            />
          </div>
        );
      default:
        return <div>Content for {activeTab}</div>;
    }
  };

  return renderContent();
};

export default ConfigManager;
