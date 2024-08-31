import React, { useState, useEffect, useRef } from 'react';
import * as TOML from '@iarna/toml';
import models from '@assets/conf/models.toml';
import { editor } from 'monaco-editor';
import { createHighlighter } from 'shiki';
import { shikiToMonaco } from '@shikijs/monaco';
import * as monaco from 'monaco-editor-core';

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
  const [isEditorReady, setIsEditorReady] = useState(false);
  // const [setHighlighter] = useState<Awaited<ReturnType<typeof createHighlighter>> | null>(null);
  const highlighterRef = useRef<Awaited<ReturnType<typeof createHighlighter>> | null>(null);
  const [highlighterError, setHighlighterError] = useState<string | null>(null);

  useEffect(() => {
    console.log('Starting to create highlighter...');

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

    const handleResize = () => {
      if (editorRef.current) {
        editorRef.current.layout();
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (editorRef.current) {
        editorRef.current.dispose();
      }
    };
  }, []);

  useEffect(() => {
    if (isEditorReady && activeTab === '模型列表' && activeModelTab === '用户值' && highlighterRef.current) {
      console.log('Initializing editor...');
      initializeEditor();
    }
  }, [isEditorReady, activeTab, activeModelTab]);

  const initializeEditor = () => {
    if (editorRef.current) {
      editorRef.current.dispose();
    }

    // 注册语言
    monaco.languages.register({ id: 'toml' });
    createHighlighter({
      themes: ['github-dark'],
      langs: ['toml'],
    })
      .then(hl => {
        console.log('Highlighter created successfully:', hl);
        // setHighlighter(hl);
        highlighterRef.current = hl;
        console.log('Highlighter object:', highlighterRef.current);
        if (highlighterRef.current && typeof highlighterRef.current.getLoadedThemes === 'function') {
          console.log('Highlighter is properly initialized, applying to Monaco...');
          // 注册 Shiki 主题并提供语法高亮
          shikiToMonaco(highlighterRef.current, monaco);

          const container = document.getElementById('monaco-editor-container');
          if (container) {
            editorRef.current = monaco.editor.create(container, {
              value: userConfig,
              language: 'toml',
              theme: 'vs-dark', // 使用暗色主题
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              fontSize: 14, // 设置字体大小
              lineHeight: 20, // 设置行高
            });

            // 自定义编辑器样式
            const style = document.createElement('style');
            style.textContent = `
              .monaco-editor .margin {
                background-color: #272822 !important;
              }
              .monaco-editor .monaco-editor-background {
                background-color: #272822 !important;
              }
            `;
            document.head.appendChild(style);

            editorRef.current.onDidChangeModelContent(() => {
              const newValue = editorRef.current?.getValue() || '';
              setUserConfig(newValue);
              validateAndMergeConfigs(newValue);
            });
          }
        } else {
          console.error('Highlighter is not properly initialized');
          if (highlighterError) {
            console.error('Highlighter creation error:', highlighterError);
          }
        }
        setIsEditorReady(true);
      })
      .catch(error => {
        console.error('Error creating highlighter:', error);
        setHighlighterError(error.message);
      });
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
          <div className="bg-[#272822] p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-white">user-models.toml</span>
              <span className="text-blue-600">
                <a href="https://toml.io/cn/v1.0.0" target="_blank" rel="noreferrer noopener">
                  学习 TOML 语法
                </a>
              </span>
            </div>
            <div id="monaco-editor-container" style={{ height: '400px', border: '1px solid #3e3d32' }}></div>
            <button
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
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
