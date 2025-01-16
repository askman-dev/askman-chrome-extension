import Highlight from 'react-highlight';
import 'highlight.js/styles/default.min.css';
import React from 'react';
import CopyButton, { useCopyButton } from './base/CopyButton';

interface AskCodeProps {
  code: string;
}

function AskCode(props: AskCodeProps) {
  const { code } = props;
  const { isVisible, handlers } = useCopyButton();

  if (!code || code.trim() === '') {
    return null;
  }

  return (
    <div className="relative rounded-md bg-gray-100 p-2" {...handlers}>
      <Highlight className="json">{code}</Highlight>
      {isVisible && <CopyButton text={code} className="top-2 right-2 bg-white hover:bg-gray-100" />}
    </div>
  );
}

export default AskCode;
