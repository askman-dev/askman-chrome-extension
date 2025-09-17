import React, { useState, useEffect } from 'react';
import ConfigManager from '@src/components/config/ConfigManager';
import {
  USER_TOOLS_KEY,
  USER_MODELS_KEY,
  USER_CHAT_PRESETS_KEY,
  USER_PREFERENCES_KEY,
} from '@src/utils/StorageManager';
import { getVersion } from '@src/utils/version';
import ExternalLinksManager, { ExternalLinks } from '@src/utils/ExternalLinksManager';

const Options: React.FC = () => {
  const [activeTab, setActiveTab] = useState('Models');
  const [showWechatImage, setShowWechatImage] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [links, setLinks] = useState<ExternalLinks | null>(null);
  const version = getVersion();

  useEffect(() => {
    ExternalLinksManager.loadLinks()
      .then(setLinks)
      .catch(error => console.error('Failed to load external links:', error));
  }, []);

  const tabs = ['Models', 'System Prompt', 'Prompts', 'Preferences'];

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  const getConfigProps = () => {
    switch (activeTab) {
      case 'Models':
        return {
          configType: 'Models',
          systemConfigPath: '/assets/conf/models.toml',
          userConfigStorageKey: USER_MODELS_KEY,
          isEditable: true,
        };
      case 'System Prompt':
        return {
          configType: 'System Prompt',
          systemConfigPath: '/assets/conf/chat-presets.toml',
          userConfigStorageKey: USER_CHAT_PRESETS_KEY,
          isEditable: true,
        };
      case 'Prompts':
        return {
          configType: 'Prompts',
          systemConfigPath: '/assets/conf/shortcuts.toml',
          userConfigStorageKey: USER_TOOLS_KEY,
          isEditable: true,
        };
      case 'Preferences':
        return {
          configType: 'Preferences',
          systemConfigPath: '/assets/conf/preferences.toml',
          userConfigStorageKey: USER_PREFERENCES_KEY,
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
          Askman<span className="font-normal text-gray-500">(v{version})</span>
          <div className="flex items-center">
            <a
              href={links?.docs.issues}
              className="ml-2 bg-black font-normal text-white px-2 py-1 text-sm rounded"
              target="_blank"
              rel="noopener noreferrer">
              Roadmap
            </a>
            <div className="relative ml-2 flex items-center">
              <button
                className="bg-green-500 text-white px-2 py-1 text-sm rounded hover:bg-green-600"
                onMouseEnter={() => setShowWechatImage(true)}
                onMouseLeave={() => {
                  setShowWechatImage(false);
                  setImageLoaded(false);
                }}>
                WeChat: {links?.social.wechat_id}
              </button>
              {showWechatImage && (
                <div className="absolute left-0 top-full mt-2 z-50 w-[150px] h-[150px] bg-white rounded shadow-lg p-4">
                  {!imageLoaded && (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-2 border-green-500 border-t-transparent"></div>
                    </div>
                  )}
                  <img
                    src={links?.social.wechat_qr}
                    alt="WeChat QR Code"
                    className={`w-full h-full object-contain rounded transition-opacity duration-300 ${
                      imageLoaded ? 'opacity-100' : 'opacity-0'
                    }`}
                    onLoad={handleImageLoad}
                  />
                </div>
              )}
              <a
                href={links?.docs.home}
                className="ml-2 bg-blue-500 text-white px-2 py-1 text-sm rounded hover:bg-blue-600"
                target="_blank"
                rel="noopener noreferrer">
                文档
              </a>
            </div>
          </div>
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
