import React, { useState } from 'react';
import ConfigManager from '@src/components/config/ConfigManager';

const Options: React.FC = () => {
  const [activeTab, setActiveTab] = useState('配置模型');

  const tabs = ['配置模型', '配置对话', '配置工具', '站点智能（即将到来）'];

  const getConfigProps = () => {
    switch (activeTab) {
      case '配置模型':
        return {
          configType: '配置模型',
          systemConfigPath: '/assets/conf/models.toml',
          userConfigStorageKey: 'models.toml',
          isEditable: true,
        };
      case '配置对话':
        return {
          configType: '配置对话',
          systemConfigPath: '/assets/conf/chat-presets.toml',
          userConfigStorageKey: 'chat-presets.toml',
          isEditable: true,
        };
      case '配置工具':
        return {
          configType: '配置工具',
          systemConfigPath: '/assets/conf/default-tools.toml',
          userConfigStorageKey: 'tools.toml',
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
        <h1 className="text-xl font-bold">
          问那个人 <span className="text-lg font-normal text-gray-500">v0.0.7</span>
        </h1>
        <button className="bg-black text-white px-4 py-2 rounded">联系作者</button>
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
