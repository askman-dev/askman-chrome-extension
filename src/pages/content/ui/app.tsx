import { useRef, useState, useEffect } from 'react';
import { useDebounceFn } from 'ahooks';
import AskButton from '@src/components/dialog/DialogTrigger';
import AskPanel from '@src/features/page-assistant/PagePanel';
import { CommandType, TabMessage } from '@root/src/types';
import { QuoteAgent, QuoteContext } from '@root/src/agents/quote';
import { PageChatService, PageChatContext } from '@src/features/page-assistant/PageChatService';
import { PageGithubAgent } from '@root/src/agents/page-github/script';
import PageGithubReadmeToolDropdown from '@root/src/agents/page-github/component';
import { createPortal } from 'react-dom';
import { PageStackoverflowAgent } from '@root/src/agents/page-stackoverflow/script';
import PageStackoverflowToolDropdown from '@root/src/agents/page-stackoverflow/component';
import { StorageManager } from '@src/utils/StorageManager';
import { BlockConfig } from '@src/utils/BlockConfig';
import Notification from '@src/components/common/Notification';

const ASK_BUTTON_OFFSET_X = 5; // 按钮距离左侧的偏移量

const tabChatContext = new PageChatService();

// 模拟键盘事件
function simulateKeyPress(key: string, ctrlKey = false, metaKey = false) {
  const event = new KeyboardEvent('keydown', {
    key,
    code: 'Key' + key.toUpperCase(),
    keyCode: key.toUpperCase().charCodeAt(0),
    which: key.toUpperCase().charCodeAt(0),
    ctrlKey,
    metaKey,
    bubbles: true,
    composed: true, // 允许事件穿过 Shadow DOM 边界
    cancelable: true,
  });

  // 直接向活动元素发送事件
  const target = document.activeElement || document.body;
  target.dispatchEvent(event);
}

export default function App() {
  const [askButtonVisible, setAskButtonVisible] = useState<boolean>(false);
  const [askPanelVisible, setAskPanelVisible] = useState<boolean>(false);
  const [showDoubleClickHint, setShowDoubleClickHint] = useState<boolean>(false);
  const targetDom = useRef<HTMLElement>(null);
  const [pageActionButton, setPageActionButton] = useState<HTMLDivElement>(null);
  const [preferences, setPreferences] = useState({ ASK_BUTTON: false, ASK_BUTTON_BLOCK_PAGE: [] });
  const [askPanelQuotes, setAskPanelQuotes] = useState<Promise<QuoteContext>[]>([]);
  const [parentRect, setParentRect] = useState<DOMRect>();
  const blockConfig = useRef<BlockConfig>(null);

  // 初始化配置
  useEffect(() => {
    const initBlockConfig = async () => {
      blockConfig.current = BlockConfig.getInstance();
      await blockConfig.current.initialize();
    };
    initBlockConfig();
  }, []);

  // 加载用户偏好设置
  useEffect(() => {
    StorageManager.getUserPreferences().then(prefs => {
      setPreferences(prefs);
    });
  }, []);

  // 检查当前页面是否在屏蔽列表中
  const isCurrentPageBlocked = () => {
    const currentUrl = window.location.href;
    const currentDomain = window.location.hostname;

    return preferences.ASK_BUTTON_BLOCK_PAGE.some(pattern => {
      // 检查完整 URL 匹配
      if (pattern.startsWith('http') && currentUrl.startsWith(pattern)) {
        return true;
      }
      // 检查域名匹配
      if (!pattern.includes('/') && currentDomain.includes(pattern)) {
        return true;
      }
      // 检查通配符模式
      if (pattern.includes('*')) {
        const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
        return regex.test(currentUrl);
      }
      return false;
    });
  };

  const { run: handleMouseOver } = useDebounceFn(
    (e: MouseEvent) => {
      // 如果按钮功能被禁用或当前页面在屏蔽列表中，直接返回
      if (!preferences.ASK_BUTTON || isCurrentPageBlocked()) {
        setAskButtonVisible(false);
        return false;
      }

      const domEl: HTMLElement = (e.target as HTMLElement).closest('pre');
      const highlightEl: HTMLElement = (e.target as HTMLElement).closest('div.highlight');
      const btnEl: HTMLElement = (e.target as HTMLElement).closest('#askman-chrome-extension-content-view-root');

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
    }
    if (quote) {
      setAskPanelQuotes([quote]);
    }
  }

  const onBackgroundMessage = function (message: TabMessage, _sender, sendResponse) {
    if (message.cmd === CommandType.ChatPopupDisplay) {
      const currentUrl = window.location.href;
      const fromShortcut = message.fromShortcut || false;

      // 在黑名单中的网站，快捷键触发时才需要特殊处理
      if (fromShortcut && blockConfig.current?.isShortcutDisabled(currentUrl)) {
        // 只有快捷键触发时才发送模拟按键
        const isMac = navigator.platform.includes('Mac');
        simulateKeyPress('i', !isMac, isMac);
        return;
      }

      // 其他情况（鼠标点击或非黑名单网站）正常显示对话框
      if (askPanelVisible) {
        setAskPanelVisible(false);
      } else {
        const selection = document.getSelection()?.toString().trim() || '';
        showChat(selection);
      }
    }
    // Handle agent tool commands
    else if (message.cmd === CommandType.GetPageText) {
      console.log('[Content Script] GetPageText command received:', message);
      try {
        // Get all visible text content from the page
        const bodyText = document.body.innerText || document.body.textContent || '';
        console.log('[Content Script] Page text extracted, length:', bodyText.length);
        const response = { success: true, data: { text: bodyText.trim() } };
        console.log('[Content Script] Sending response:', { success: true, textLength: bodyText.trim().length });
        sendResponse(response);
      } catch (error) {
        console.error('[Content Script] Error getting page text:', error);
        const errorResponse = { success: false, error: error.message };
        console.log('[Content Script] Sending error response:', errorResponse);
        sendResponse(errorResponse);
      }
      return true; // Keep message channel open for async response
    } else if (message.cmd === CommandType.GetPageLinks) {
      try {
        // Get all links from the page
        const links = Array.from(document.querySelectorAll('a[href]'))
          .map(link => {
            const anchor = link as HTMLAnchorElement;
            return {
              text: anchor.textContent?.trim() || '',
              href: anchor.href,
              title: anchor.title || '',
            };
          })
          .filter(link => link.text || link.title); // Only include links with text or title

        sendResponse({ success: true, data: { links } });
      } catch (error) {
        console.error('Error getting page links:', error);
        sendResponse({ success: false, error: error.message });
      }
      return true; // Keep message channel open for async response
    } else if (message.cmd === CommandType.ScrollPage) {
      try {
        const { x = 0, y = 0 } = (message.data as { x?: number; y?: number }) || {};
        // Scroll the page by the specified offset
        window.scrollBy(x, y);
        sendResponse({ success: true, data: { scrolled: { x, y } } });
      } catch (error) {
        console.error('Error scrolling page:', error);
        sendResponse({ success: false, error: error.message });
      }
      return true; // Keep message channel open for async response
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
    if (PageStackoverflowAgent.isSupport(window.location.href)) {
      console.log('stackoverflow 支持', pageActionButton);
      const e = PageStackoverflowAgent.findActionButtonContainer(document);
      setPageActionButton(e);
    }

    return () => {
      document.body.removeEventListener('mouseover', handleMouseOver);
      document.body.removeEventListener('selectionchange', handleSelectionChange);
      window.removeEventListener('scroll', hideAskButton);
      chrome.runtime.onMessage.removeListener(onBackgroundMessage);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
      {!askPanelVisible && showDoubleClickHint && (
        <Notification
          message="Press Command+I/Ctrl+I again within 1s to open AskMan"
          onClose={() => {
            setShowDoubleClickHint(false);
          }}
        />
      )}
      {PageStackoverflowAgent.isSupport(window.location.href) &&
        pageActionButton &&
        createPortal(
          <PageStackoverflowToolDropdown
            className={''}
            onItemClick={e => {
              showChat(e.text);
            }}
          />,
          pageActionButton,
        )}
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
      <PageChatContext.Provider value={tabChatContext}>
        {parentRect && (
          <AskButton
            visible={askButtonVisible}
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
              cursor: 'auto',
            }}
          />
        ) : null}
      </PageChatContext.Provider>
    </>
  );
}
