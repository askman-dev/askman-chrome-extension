import React from 'react';
import '@pages/panel/Panel.css';
import ConfigManager from '@src/components/ConfigManager';

const Panel: React.FC = () => {
  return (
    <div className="container">
      <h1>Dev Tools Panel</h1>
      <ConfigManager />
    </div>
  );
};

export default Panel;
