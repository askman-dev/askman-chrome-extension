import React from 'react';
import { createRoot } from 'react-dom/client';
import { install, defineConfig } from '@twind/core';
import presetAutoprefix from '@twind/preset-autoprefix';
import presetTailwind from '@twind/preset-tailwind';
import Options from './Options';

// Set up Twind
install(
  defineConfig({
    presets: [presetAutoprefix(), presetTailwind()],
    // You can add more configuration here if needed
  }),
);

function init() {
  const appContainer = document.querySelector('#app-container');
  if (!appContainer) {
    throw new Error('Can not find #app-container');
  }
  const root = createRoot(appContainer);
  root.render(<Options />);
}

init();
