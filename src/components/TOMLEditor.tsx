import React, { useEffect, useRef, useState } from 'react';
import { editor } from 'monaco-editor';
import { createHighlighter } from 'shiki';
import { shikiToMonaco } from '@shikijs/monaco';

interface TOMLEditorProps {
  value: string;
  onChange?: (value: string) => void;
  readOnly?: boolean;
  onSave?: () => void;
  error?: string | null;
}

const TOMLEditor: React.FC<TOMLEditorProps> = ({ value, onChange, readOnly = false, onSave, error }) => {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const [isEditorReady, setIsEditorReady] = useState(false);

  useEffect(() => {
    import('monaco-editor').then(monaco => {
      initializeEditor(monaco);
    });

    return () => {
      if (editorRef.current) {
        editorRef.current.dispose();
      }
    };
  }, []);

  useEffect(() => {
    if (isEditorReady && editorRef.current) {
      editorRef.current.setValue(value);
    }
  }, [value, isEditorReady]);

  const initializeEditor = async (monaco: typeof import('monaco-editor')) => {
    monaco.languages.register({ id: 'toml' });
    const highlighter = await createHighlighter({
      themes: ['github-dark'],
      langs: ['toml'],
    });

    shikiToMonaco(highlighter, monaco);

    const container = document.getElementById('monaco-editor-container');
    if (container) {
      editorRef.current = monaco.editor.create(container, {
        value,
        language: 'toml',
        theme: 'vs-dark',
        minimap: { enabled: false },
        scrollBeyondLastLine: false,
        fontSize: 14,
        lineHeight: 20,
        readOnly,
      });

      if (!readOnly) {
        editorRef.current.onDidChangeModelContent(() => {
          const newValue = editorRef.current?.getValue() || '';
          onChange?.(newValue);
        });
      }

      const handleResize = () => editorRef.current?.layout();
      window.addEventListener('resize', handleResize);

      setIsEditorReady(true);

      return () => window.removeEventListener('resize', handleResize);
    }
  };

  return (
    <div className="bg-[#272822] p-4 pt-2 rounded-lg">
      <div className="flex items-center justify-between mb-2 h-8">
        <span className="text-white">
          models.toml
          <a className="text-white pl-2" href="https://toml.io/cn/v1.0.0" target="_blank" rel="noreferrer noopener">
            学习 TOML 语法 🔗
          </a>
        </span>
        <div className="flex items-center">
          {!readOnly && onSave && (
            <button className="px-4 py-2 bg-blue-500 text-white rounded" onClick={onSave} disabled={!!error}>
              保存配置
            </button>
          )}
        </div>
      </div>
      <div id="monaco-editor-container" style={{ height: '400px', border: '1px solid #3e3d32' }} />
      {error && <p className="text-red-500 mt-2">{error}</p>}
    </div>
  );
};

export default TOMLEditor;
