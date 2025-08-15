import React from 'react';
import { createRoot } from 'react-dom/client';
import ThoughtPrism from '@pages/thought-prism/ThoughtPrism';
import '@pages/thought-prism/index.css';
import '@src/assets/style/tailwind.css';
import refreshOnUpdate from 'virtual:reload-on-update-in-view';

refreshOnUpdate('pages/thought-prism');

function init() {
  const appContainer = document.querySelector('#app-container');
  if (!appContainer) {
    throw new Error('Can not find #app-container');
  }
  const root = createRoot(appContainer);

  root.render(<ThoughtPrism />);
}

init();
