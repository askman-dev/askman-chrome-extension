import React, { useState } from 'react';
import ConfigManager from '@root/src/components/config/ConfigManager';

const Options: React.FC = () => {
  const [activeTab, setActiveTab] = useState('模型列表');

  const tabs = ['模型列表', '对话偏好', '配置文件', '站点智能'];

  return (
    <div className="flex flex-col h-screen">
      {/* 顶部栏 */}
      <header className="flex justify-between items-center p-8 pl-16 pr-16 bg-gray-100 shadow">
        <h1 className="text-xl font-bold">
          问那个人 <span className="text-sm font-normal text-gray-500">v0.0.7</span>
        </h1>
        <button className="bg-blue-500 text-white px-4 py-2 rounded">问开发者</button>
      </header>

      {/* 主要内容区 */}
      <div className="flex flex-1 overflow-hidden">
        {/* 左侧导航栏 */}
        <nav className="w-48 bg-gray-200 p-4 pl-16">
          {tabs.map(tab => (
            <button
              key={tab}
              className={`w-full text-left p-2 mb-2 rounded ${
                activeTab === tab ? 'bg-blue-500 text-white' : 'hover:bg-gray-300'
              }`}
              onClick={() => setActiveTab(tab)}>
              {tab}
            </button>
          ))}
        </nav>

        {/* 右侧内容区 */}
        <main className="flex-1 p-6 bg-white overflow-auto">
          <ConfigManager activeTab={activeTab} />
        </main>
      </div>
    </div>
  );
};

export default Options;
