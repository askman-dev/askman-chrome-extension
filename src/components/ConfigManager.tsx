import React, { useState, useEffect, useRef } from 'react';
import * as TOML from '@iarna/toml';
import models from '@assets/conf/models.toml';
import { editor } from 'monaco-editor';

interface ConfigManagerProps {
  activeTab: string;
}

const ConfigManager: React.FC<ConfigManagerProps> = ({ activeTab }) => {
  const [activeModelTab, setActiveModelTab] = useState('用户值');
  const [userConfig, setUserConfig] = useState('');
  const [systemConfig, setSystemConfig] = useState('');
  const [mergedConfig, setMergedConfig] = useState('');
  const [error, setError] = useState<string | null>(null);
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const monacoRef = useRef<typeof import('monaco-editor') | null>(null);

  useEffect(() => {
    // 加载系统配置
    setSystemConfig(TOML.stringify(models));

    // 从 localStorage 加载用户配置
    const savedUserConfig = localStorage.getItem('userModelConfig') || '';
    setUserConfig(savedUserConfig);

    // 验证和合并配置
    validateAndMergeConfigs(savedUserConfig);

    // 动态加载 Monaco Editor
    import('monaco-editor').then(monaco => {
      monacoRef.current = monaco;
      initializeEditor();
    });

    return () => {
      if (editorRef.current) {
        editorRef.current.dispose();
      }
    };
  }, []);

  useEffect(() => {
    if (activeModelTab === '用户值' && monacoRef.current) {
      initializeEditor();
    }
  }, [activeModelTab]);

  const initializeEditor = () => {
    if (editorRef.current) {
      editorRef.current.dispose();
    }

    const container = document.getElementById('monaco-editor-container');
    if (container && monacoRef.current) {
      editorRef.current = monacoRef.current.editor.create(container, {
        value: userConfig,
        language: 'toml',
        minimap: { enabled: false },
        scrollBeyondLastLine: false,
      });

      editorRef.current.onDidChangeModelContent(() => {
        const newValue = editorRef.current.getValue();
        setUserConfig(newValue);
        validateAndMergeConfigs(newValue);
      });
    }
  };

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
      // 如果解析失败，设置具体的错误信息
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
          <div>
            <div id="monaco-editor-container" style={{ height: '400px' }}></div>
            <button
              className="mt-2 px-4 py-2 bg-blue-500 text-white rounded"
              onClick={handleSaveConfig}
              disabled={!!error}>
              保存配置
            </button>
            {error && <p className="text-red-500 mt-2">{error}</p>}
          </div>
        );
      case '系统值':
        return <pre className="h-96 overflow-auto p-4 bg-gray-100 rounded">{systemConfig}</pre>;
      case '预览':
        return <pre className="h-96 overflow-auto p-4 bg-gray-100 rounded">{mergedConfig}</pre>;
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
