import React, { useState } from 'react';
import ConfigManager from '@src/components/config/ConfigManager';
import { USER_TOOLS_KEY, USER_MODELS_KEY, USER_CHAT_PRESETS_KEY } from '@src/utils/StorageManager';

const Options: React.FC = () => {
  const [activeTab, setActiveTab] = useState('配置模型');

  const tabs = ['配置模型', '配置对话', '配置工具', '站点智能（即将到来）'];

  const getConfigProps = () => {
    switch (activeTab) {
      case '配置模型':
        return {
          configType: '配置模型',
          systemConfigPath: '/assets/conf/models.toml',
          userConfigStorageKey: USER_MODELS_KEY,
          isEditable: true,
        };
      case '配置对话':
        return {
          configType: '配置对话',
          systemConfigPath: '/assets/conf/chat-presets.toml',
          userConfigStorageKey: USER_CHAT_PRESETS_KEY,
          isEditable: true,
        };
      case '配置工具':
        return {
          configType: '配置工具',
          systemConfigPath: '/assets/conf/tools.toml',
          userConfigStorageKey: USER_TOOLS_KEY,
          isEditable: true,
        };
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* 顶部栏 */}
      <header className="flex justify-between items-center p-8 pl-16 pr-16 mb-4 bg-white shadow">
        <h1 className="text-xl font-bold flex items-center">
          问那个人<span className="font-normal text-gray-500">(v0.0.7)</span>
          <a
            href="https://support.qq.com/product/667701"
            className="ml-2 bg-black font-normal text-white px-2 py-1 text-sm rounded"
            target="_blank"
            rel="noopener noreferrer">
            联系作者
          </a>
        </h1>
      </header>

      {/* 主要内容区 */}
      <div className="flex flex-1 overflow-hidden">
        {/* 左侧导航栏 */}
        <nav className="w-72 p-4 pl-16 text-lg">
          {tabs.map(tab => (
            <button
              key={tab}
              className={`w-full text-left p-2 mb-2 rounded ${
                activeTab === tab ? 'bg-gray-200 text-black font-bold' : 'hover:bg-gray-300'
              }`}
              onClick={() => setActiveTab(tab)}>
              {tab}
            </button>
          ))}
        </nav>

        {/* 右侧内容区 */}
        <main className="flex-1 p-6 mr-16 bg-white overflow-auto shadow">
          {getConfigProps() && <ConfigManager {...getConfigProps()} />}
        </main>
      </div>
    </div>
  );
};

export default Options;
