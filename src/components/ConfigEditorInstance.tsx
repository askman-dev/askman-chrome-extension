import React, { useState, useEffect } from 'react';
import TOMLEditor from './TOMLEditor';
import * as TOML from '@iarna/toml';
interface ConfigEditorInstanceProps {
  initialValue: string;
  readOnly: boolean;
  onSave?: (value: string) => void;
}

const ConfigEditorInstance: React.FC<ConfigEditorInstanceProps> = ({ initialValue, readOnly, onSave }) => {
  const [value, setValue] = useState(initialValue);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  const handleChange = (newValue: string) => {
    setValue(newValue);
    validateConfig(newValue);
  };

  const validateConfig = (config: string) => {
    try {
      const parsedConfig = TOML.parse(config);
      //   const stringifiedConfig = TOML.stringify(parsedConfig);
      if (!parsedConfig) {
        setError('配置格式不正确');
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
      value={value}
      onChange={handleChange}
      readOnly={readOnly}
      onSave={readOnly ? undefined : handleSave}
      error={error}
    />
  );
};

export default ConfigEditorInstance;
