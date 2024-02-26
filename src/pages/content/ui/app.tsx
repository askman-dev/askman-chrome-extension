import { useRef, useState, useEffect } from 'react';
import { useDebounceFn } from 'ahooks';
import AskButton from '@src/components/ask-button';
import AskPanel from '@root/src/components/ask-panel';
import { CommandType, TabMessage } from '@root/src/types';
import { QuoteAgent, QuoteContext } from '@root/src/agents/quote';
import { ChatCore } from '@root/src/chat/chat';

const ASK_BUTTON_OFFSET_X = 6; // 按钮距离左侧的偏移量

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function getQuotes(): Promise<void> {
  return new Promise(resolve => {
    chrome.runtime.sendMessage({ cmd: CommandType.ChatPopupDisplay }, () => {
      resolve();
    });
  });
}

const chat = new ChatCore();

export default function App() {
  const [askButtonVisible, setAskButtonVisible] = useState<boolean>(false);
  const [askPanelVisible, setAskPanelVisible] = useState<boolean>(false);
  const targetDom = useRef<HTMLElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [currentCodeSnippnet, setCurrentCodeSnippnet] = useState<string>('');
  const [askPanelQuotes, setAskPanelQuotes] = useState<Promise<QuoteContext>[]>([]);
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

  function showChat(quoteText?: string) {
    setAskPanelVisible(true);
    chat.init();
    let quote = null;
    if (quoteText) {
      quote = QuoteAgent.getQuoteBySelection(window.location.href, quoteText);
    } else {
      quote = QuoteAgent.getQuoteByDocument(window.location.href, document);
    }
    if (quote) {
      setAskPanelQuotes([quote]);
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const onBackgroundMessage = function (message: TabMessage, sender, sendResponse) {
    if (message.cmd === CommandType.ChatPopupDisplay) {
      if (askPanelVisible) {
        setAskPanelVisible(false);
        return;
      }
      console.log('收到后台消息 ', message);
      showChat();
      return;
    }
  };

  useEffect(() => {
    document.body.addEventListener('mouseover', handleMouseOver);
    document.body.addEventListener('selectionchange', handleSelectionChange);
    window.addEventListener('scroll', hideAskButton);
    chrome.runtime.onMessage.addListener(onBackgroundMessage);

    return () => {
      document.body.removeEventListener('mouseover', handleMouseOver);
      document.body.removeEventListener('selectionchange', handleSelectionChange);
      window.removeEventListener('scroll', hideAskButton);
      chrome.runtime.onMessage.removeListener(onBackgroundMessage);
    };
  });

  const handleAsk = () => {
    console.log('🚀 ~ handleAsk ~ targetDom.current:', targetDom.current);

    if (targetDom.current) {
      // get text
      const text = targetDom.current.textContent;
      // setCurrentCodeSnippnet(text);
      // setAskPanelVisible(true);
      // setAskPanelQuotes([QuoteAgent.getQuoteBySelection(window.location.href, text)]);
      // setAskPanelVisible(true);
      showChat(text);
    }
  };

  return (
    <>
      <AskPanel
        visible={askPanelVisible}
        code={''}
        quotes={askPanelQuotes}
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
