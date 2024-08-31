import React, { useState, useEffect } from 'react';
import * as TOML from '@iarna/toml';
import models from '@assets/conf/models.toml';
import TOMLEditor from './TOMLEditor';

interface ConfigManagerProps {
  activeTab: string;
}

const ConfigManager: React.FC<ConfigManagerProps> = ({ activeTab }) => {
  const [activeModelTab, setActiveModelTab] = useState('用户值');
  const [userConfig, setUserConfig] = useState('');
  const [systemConfig, setSystemConfig] = useState('');
  const [mergedConfig, setMergedConfig] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setSystemConfig(TOML.stringify(models));
    const savedUserConfig = localStorage.getItem('userModelConfig') || '';
    setUserConfig(savedUserConfig);
    validateAndMergeConfigs(savedUserConfig);
  }, []);

  const validateAndMergeConfigs = (userConfigStr: string) => {
    try {
      const userConfigObj = TOML.parse(userConfigStr) as Record<string, unknown>;
      setError(null);

      const systemConfigObj = models as Record<string, unknown>;
      const mergedObj = Object.keys(userConfigObj).reduce(
        (acc, key) => {
          if (typeof userConfigObj[key] === 'object' && userConfigObj[key] !== null) {
            if (typeof systemConfigObj[key] === 'object' && systemConfigObj[key] !== null) {
              acc[key] = { ...(systemConfigObj[key] as object), ...(userConfigObj[key] as object) };
            } else {
              acc[key] = userConfigObj[key];
            }
          } else {
            acc[key] = userConfigObj[key];
          }
          return acc;
        },
        { ...systemConfigObj } as Record<string, unknown>,
      );

      setMergedConfig(TOML.stringify(mergedObj as TOML.JsonMap));
    } catch (err) {
      if (err instanceof Error) {
        setError(`TOML 格式错误: ${err.message}`);
      } else {
        setError('无效的 TOML 格式');
      }
    }
  };

  const handleSaveConfig = () => {
    if (!error) {
      localStorage.setItem('userModelConfig', userConfig);
      alert('配置已保存');
    } else {
      alert('无法保存：配置中存在错误');
    }
  };

  const renderModelContent = () => {
    switch (activeModelTab) {
      case '用户值':
        return (
          <TOMLEditor
            value={userConfig}
            onChange={newValue => {
              setUserConfig(newValue);
              validateAndMergeConfigs(newValue);
            }}
            onSave={handleSaveConfig}
            error={error}
          />
        );
      case '系统值':
        return <TOMLEditor value={systemConfig} readOnly={true} />;
      case '预览':
        return <TOMLEditor value={mergedConfig} readOnly={true} />;
      default:
        return null;
    }
  };

  if (activeTab !== '模型列表') {
    return null;
  }

  return (
    <div>
      <h2 className="text-lg font-bold mb-4">模型列表</h2>
      <div className="mb-4">
        {['用户值', '系统值', '预览'].map(tab => (
          <button
            key={tab}
            className={`mr-2 px-4 py-2 rounded ${activeModelTab === tab ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            onClick={() => setActiveModelTab(tab)}>
            {tab}
          </button>
        ))}
      </div>
      {renderModelContent()}
    </div>
  );
};

export default ConfigManager;
