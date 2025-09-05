import React, { useEffect, useRef, useState } from 'react';
import * as monaco from 'monaco-editor-core';
import { editor } from 'monaco-editor';
import { createHighlighter, Highlighter } from 'shiki';
import { shikiToMonaco } from '@shikijs/monaco';
import classNames from 'classnames';

// 创建一个全局的 Shiki 高亮器实例
let globalHighlighter: Highlighter | null = null;
const getOrCreateHighlighter = async () => {
  if (!globalHighlighter) {
    globalHighlighter = await createHighlighter({
      themes: ['github-dark'],
      langs: ['toml'],
    });
  }
  return globalHighlighter;
};

interface TOMLEditorProps {
  value: string;
  onChange?: (_value: string) => void;
  readOnly?: boolean;
  onSave?: () => void;
  error?: string | null;
  filename: string;
}

const TOMLEditor: React.FC<TOMLEditorProps> = ({ value, onChange, readOnly = false, onSave, error, filename }) => {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const monacoRef = useRef<typeof monaco | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isEditorReady, setIsEditorReady] = useState(false);
  const valueRef = useRef(value);
  const [isModified, setIsModified] = useState(false);

  useEffect(() => {
    import('monaco-editor').then(monaco => {
      // @ts-expect-error 忽略类型不匹配的错误
      monacoRef.current = monaco;
      initializeEditor();
    });

    return () => {
      if (editorRef.current) {
        editorRef.current.dispose();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (isEditorReady && editorRef.current && value !== valueRef.current) {
      const currentPosition = editorRef.current.getPosition();
      const currentScrollTop = editorRef.current.getScrollTop();

      editorRef.current.setValue(value);
      valueRef.current = value;

      // Restore cursor position and scroll position
      editorRef.current.setPosition(currentPosition || { lineNumber: 1, column: 1 });
      editorRef.current.setScrollTop(currentScrollTop);
    }
  }, [value, isEditorReady]);

  const initializeEditor = async () => {
    if (!monacoRef.current || !containerRef.current) return;

    const monaco = monacoRef.current;
    monaco.languages.register({ id: 'toml' });

    // 使用全局高亮器实例
    const highlighter = await getOrCreateHighlighter();
    shikiToMonaco(highlighter, monaco);

    // @ts-expect-error 忽略类型不匹配的错误
    editorRef.current = monaco.editor.create(containerRef.current, {
      value: valueRef.current,
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
        if (newValue !== valueRef.current) {
          valueRef.current = newValue;
          onChange?.(newValue);
          setIsModified(true);
        }
      });
    }

    const handleResize = () => editorRef.current?.layout();
    window.addEventListener('resize', handleResize);

    setIsEditorReady(true);

    return () => window.removeEventListener('resize', handleResize);
  };

  // Add this function to reset the modified state
  const handleSave = () => {
    onSave?.();
    setIsModified(false);
  };

  return (
    <div className="bg-[#272822] p-4 pt-2 rounded-lg">
      <div className={classNames('flex items-center mb-2 h-6 px-2 rounded', isModified ? 'bg-orange-600' : '')}>
        <span className="text-white">
          {readOnly ? '[Read Only]' : '[Editable]'} {filename}
        </span>
        <div className="flex items-center ml-2">
          {!readOnly &&
            (isModified ? (
              <button
                className="relative cursor-pointer font-semibold text-blue-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-blue-600 focus-within:ring-offset-2 hover:text-blue-500"
                onClick={handleSave}
                disabled={!!error}>
                Save
              </button>
            ) : (
              <span className="text-gray-400">Unchanged</span>
            ))}
        </div>
      </div>
      <div ref={containerRef} style={{ height: '400px', border: '1px solid #3e3d32' }} />
      {error && <p className="text-red-500 mt-2">{error}</p>}
    </div>
  );
};

export default TOMLEditor;
