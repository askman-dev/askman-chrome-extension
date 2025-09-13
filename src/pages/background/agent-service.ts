import { PageChatService } from '@src/features/page-assistant/PageChatService';

let pageChatService: PageChatService | null = null;

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.cmd === 'ASK_AGENT') {
    if (!pageChatService) {
      pageChatService = new PageChatService();
      pageChatService.setOnDataListener(parts => {
        chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
          if (tabs[0]) {
            chrome.tabs.sendMessage(tabs[0].id, { cmd: 'AGENT_STREAM', data: parts });
          }
        });
      });
    }

    const { userPrompt, pageContext, quotes } = message.data;
    pageChatService.askWithAgent(userPrompt, pageContext, quotes);
    sendResponse({ success: true });
    return true;
  }
});
