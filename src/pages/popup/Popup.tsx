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
        <div className="logo-container">
          <img src={logo} className="logo" alt="logo" />
          <span className="app-title">Askman</span>
        </div>
        <div className="instructions">
          <p>After installation, please refresh your tag page first. Then click the action button to start chatting.</p>
          <p className="note">Note: Chat is not available on new tabs, settings pages, or browser system pages.</p>
        </div>
        <button
          className="action-button"
          style={{
            backgroundColor: theme === 'light' ? '#fff' : '#000',
            color: theme === 'light' ? '#000' : '#fff',
            border: '1px solid #000',
          }}
          onClick={() => window.open('https://github.com/askman-dev/askman-chrome-extension/discussions', '_blank')}>
          Feedback
        </button>
      </header>
    </div>
  );
};

export default withErrorBoundary(withSuspense(Popup, <div> Loading ... </div>), <div> Error Occur </div>);
