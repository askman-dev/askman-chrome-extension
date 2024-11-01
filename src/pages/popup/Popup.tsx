import React from 'react';
import logo from '@assets/img/logo.svg';
import '@pages/popup/Popup.css';
import useStorage from '@src/shared/hooks/useStorage';
import exampleThemeStorage from '@src/shared/storages/exampleThemeStorage';
import withSuspense from '@src/shared/hoc/withSuspense';
import withErrorBoundary from '@src/shared/hoc/withErrorBoundary';

const Popup = () => {
  const theme = useStorage(exampleThemeStorage);

  return (
    <div
      className="App"
      style={{
        backgroundColor: theme === 'light' ? '#fff' : '#000',
      }}>
      <header className="App-header" style={{ color: theme === 'light' ? '#000' : '#fff' }}>
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Please first open a page, such as
          <a href="https://github.com/askman-dev/askman-chrome-extension" target="_blank" rel="noreferrer">
            github.com
          </a>
          <br />
          1. Use Command + I to activate Ask Man. <br />
          2. Or select <span>Ask That Man</span> from the right-click menu.
        </p>
        <button
          style={{
            backgroundColor: theme === 'light' ? '#fff' : '#000',
            color: theme === 'light' ? '#000' : '#fff',
            border: '1px solid #000',
            borderRadius: '4px',
          }}
          onClick={exampleThemeStorage.toggle}>
          Let&apos;s try
        </button>
      </header>
    </div>
  );
};

export default withErrorBoundary(withSuspense(Popup, <div> Loading ... </div>), <div> Error Occur </div>);
