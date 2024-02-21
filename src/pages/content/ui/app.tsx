import { useRef, useState, useEffect } from 'react';
import { useDebounceFn } from 'ahooks';
import AskButton from '@src/components/ask-button';
import AskPanel from '@root/src/components/ask-panel';
import { CommandType, TabMessage } from '@root/src/types';

const ASK_BUTTON_OFFSET_X = 6; // 按钮距离左侧的偏移量

export default function App() {
  const [askButtonVisible, setAskButtonVisible] = useState<boolean>(false);
  const [askPanelVisible, setAskPanelVisible] = useState<boolean>(false);
  const targetDom = useRef<HTMLElement>(null);
  const [currentCodeSnippnet, setCurrentCodeSnippnet] = useState<string>('');
  const [parentRect, setParentRect] = useState<DOMRect>();
  const { run: handleMouseOver } = useDebounceFn(
    (e: MouseEvent) => {
      const domEl: HTMLElement = (e.target as HTMLElement).closest('pre');

      if (domEl?.tagName === 'PRE' || domEl?.contentEditable === 'true') {
        targetDom.current = domEl;

        // calculate position
        const rect = domEl.getBoundingClientRect();
        setParentRect(rect);
        setAskButtonVisible(true);
      }

      return false;
    },
    {
      leading: true,
      wait: 50,
    },
  );
  const { run: handleSelectionChange } = useDebounceFn(
    () => {
      const selection = document.getSelection();
      if (targetDom.current && selection && selection.anchorNode) {
        targetDom.current = selection.anchorNode.parentElement as HTMLElement;
        // calculate position
        const rect = targetDom.current.getBoundingClientRect();
        setParentRect(rect);
        setAskButtonVisible(true);
      }
    },
    {
      leading: true,
      wait: 50,
    },
  );

  const { run: hideAskButton } = useDebounceFn(
    () => {
      setAskButtonVisible(false);
    },
    {
      leading: true,
      wait: 50,
    },
  );

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const onBackgroundMessage = function (message: TabMessage, sender, sendResponse) {
    if (message.cmd === CommandType.ChatPopupDisplay) {
      if (currentCodeSnippnet == '...') {
        setCurrentCodeSnippnet('');
        setAskPanelVisible(false);
        return;
      }
      setCurrentCodeSnippnet('...');
      setAskPanelVisible(true);
    }
  };

  chrome.runtime.onMessage.addListener(onBackgroundMessage);

  useEffect(() => {
    document.body.addEventListener('mouseover', handleMouseOver);
    document.body.addEventListener('selectionchange', handleSelectionChange);
    window.addEventListener('scroll', hideAskButton);

    return () => {
      document.body.removeEventListener('mouseover', handleMouseOver);
      document.body.removeEventListener('selectionchange', handleSelectionChange);
      window.removeEventListener('scroll', hideAskButton);
    };
  });

  const handleAsk = () => {
    console.log('🚀 ~ handleAsk ~ targetDom.current:', targetDom.current);

    if (targetDom.current) {
      // get text
      const text = targetDom.current.textContent;
      setCurrentCodeSnippnet(text);
      setAskPanelVisible(true);
    }
  };

  return (
    <>
      <AskPanel
        visible={askPanelVisible}
        code={currentCodeSnippnet}
        style={{
          // left: parentRect.left + parentRect.width + ASK_BUTTON_OFFSET_X,
          // top: parentRect.top,
          right: 10,
          top: 10,
        }}
      />
      {parentRect && (
        <AskButton
          visible={askButtonVisible}
          style={{
            left: parentRect.left + parentRect.width + ASK_BUTTON_OFFSET_X,
            top: parentRect.top,
          }}
          onClick={handleAsk}
        />
      )}
    </>
  );
}
