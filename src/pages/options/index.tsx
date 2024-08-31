import React from 'react';
import { createRoot } from 'react-dom/client';
import { install } from '@twind/core';
import defineConfig from '@root/twind.config';
import Options from './Options';

// Set up Twind
install(defineConfig);

function init() {
  const appContainer = document.querySelector('#app-container');
  if (!appContainer) {
    throw new Error('Can not find #app-container');
  }
  const root = createRoot(appContainer);
  root.render(<Options />);
}

init();
