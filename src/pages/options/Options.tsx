import React, { useState } from 'react';
import ConfigManager from '@src/components/config/ConfigManager';

const Options: React.FC = () => {
  const [activeTab, setActiveTab] = useState('模型列表');

  const tabs = ['模型列表', '对话偏好', '配置文件', '站点智能'];

  const getConfigProps = () => {
    switch (activeTab) {
      case '模型列表':
        return {
          configType: '模型列表',
          systemConfigPath: '/assets/conf/models.toml',
          userConfigStorageKey: 'userModelConfig',
          isEditable: true,
        };
      case '对话偏好':
        return {
          configType: '对话偏好',
          systemConfigPath: '/assets/conf/chat-presets.toml',
          userConfigStorageKey: 'userChatConfig',
          isEditable: true,
        };
      case '配置文件':
        return {
          configType: '配置文件',
          systemConfigPath: '/assets/conf/default-tools.toml',
          userConfigStorageKey: 'userToolConfig',
          isEditable: false,
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
