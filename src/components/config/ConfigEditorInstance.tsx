import React, { useState, useEffect } from 'react';
import TOMLEditor from './TOMLEditor';
import * as TOML from '@iarna/toml';
interface ConfigEditorInstanceProps {
  initialValue: string;
  readOnly: boolean;
  filename: string;
  onSave?: (_value: string) => void;
}

const ConfigEditorInstance: React.FC<ConfigEditorInstanceProps> = ({ initialValue, readOnly, onSave, filename }) => {
  const [value, setValue] = useState(initialValue);
  const [error, setError] = useState<string | null>(null);
  const [editorKey, setEditorKey] = useState(0);

  useEffect(() => {
    setValue(initialValue);
    setEditorKey(k => k + 1);
  }, [initialValue, filename]);

  const handleChange = (newValue: string) => {
    setValue(newValue);
    validateConfig(newValue);
  };

  const validateConfig = (config: string) => {
    try {
      const parsedConfig = TOML.parse(config);
      if (!parsedConfig) {
        setError('The configuration format is incorrect.');
      } else {
        setError(null);
      }
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const handleSave = () => {
    if (onSave) {
      onSave(value);
    }
  };

  return (
    <TOMLEditor
      key={`${filename}-${editorKey}`}
      filename={filename}
      value={value}
      onChange={handleChange}
      readOnly={readOnly}
      onSave={readOnly ? undefined : handleSave}
      error={error}
    />
  );
};

export default ConfigEditorInstance;
