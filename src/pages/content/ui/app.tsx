import { useRef, useState, useEffect } from 'react';
import { useDebounceFn } from 'ahooks';
import AskButton from '@src/components/ask-button';
import AskPanel from '@root/src/components/ask-panel';
import { CommandType, TabMessage } from '@root/src/types';
import { QuoteAgent, QuoteContext } from '@root/src/agents/quote';
import { ChatCoreContext, ChatPopupContext } from '@root/src/chat/chat';
import { PageGithubAgent } from '@root/src/agents/page.github';
import PageGithubReadmeToolDropdown from '@src/components/page-github-readme';
import { createPortal } from 'react-dom';

const ASK_BUTTON_OFFSET_X = 5; // 按钮距离左侧的偏移量

const tabChatContext = new ChatCoreContext();

export default function App() {
  const [askButtonVisible, setAskButtonVisible] = useState<boolean>(false);
  const [askPanelVisible, setAskPanelVisible] = useState<boolean>(false);
  const targetDom = useRef<HTMLElement>(null);
  const [pageActionButton, setPageActionButton] = useState<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [currentCodeSnippnet, setCurrentCodeSnippnet] = useState<string>('');
  const [askPanelQuotes, setAskPanelQuotes] = useState<Promise<QuoteContext>[]>([]);
  const [parentRect, setParentRect] = useState<DOMRect>();
  const { run: handleMouseOver } = useDebounceFn(
    (e: MouseEvent) => {
      const domEl: HTMLElement = (e.target as HTMLElement).closest('pre');
      const highlightEl: HTMLElement = (e.target as HTMLElement).closest('div.highlight');
      const btnEl: HTMLElement = (e.target as HTMLElement).closest('#askman-chrome-extension-content-view-root');
      // console.log(domEl, btnEl, e.target)
      if (domEl?.tagName === 'PRE' || domEl?.contentEditable === 'true' || highlightEl) {
        if (domEl) targetDom.current = domEl;
        else if (highlightEl) targetDom.current = highlightEl;

        // calculate position
        const rect = domEl ? domEl.getBoundingClientRect() : highlightEl.getBoundingClientRect();
        setParentRect(rect);
        setAskButtonVisible(true);
      } else if (btnEl == null) {
        setAskButtonVisible(false);
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

    // 为每个站点选择合适的 agent
    if (PageGithubAgent.isSupport(window.location.href)) {
      console.log('github 支持', pageActionButton);
      const e = PageGithubAgent.findActionButtonContainer(document);
      setPageActionButton(e);
    }

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
      setAskButtonVisible(false);
    }
  };

  return (
    <>
      {PageGithubAgent.isSupport(window.location.href) &&
        pageActionButton &&
        createPortal(
          <PageGithubReadmeToolDropdown
            className={''}
            onItemClick={e => {
              showChat(e.text);
            }}
          />,
          pageActionButton,
        )}
      <ChatPopupContext.Provider value={tabChatContext}>
        {askPanelVisible ? (
          <AskPanel
            visible={askPanelVisible}
            onHide={() => setAskPanelVisible(false)}
            code={''}
            onKeyDown={e => {
              if (e.key === 'Escape') {
                setAskPanelVisible(false);
              }
            }}
            quotes={askPanelQuotes}
            style={{
              // left: parentRect.left + parentRect.width + ASK_BUTTON_OFFSET_X,
              // top: parentRect.top,
              right: 10,
              top: 10,
            }}
          />
        ) : null}

        {parentRect && (
          <AskButton
            visible={true || askButtonVisible}
            className="fixed"
            style={{
              left: parentRect.left + parentRect.width - ASK_BUTTON_OFFSET_X,
              top: parentRect.top,
            }}
            primary
            onClick={handleAsk}>
            Ask
          </AskButton>
        )}
      </ChatPopupContext.Provider>
    </>
  );
}
