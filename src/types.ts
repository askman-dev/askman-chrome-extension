import { HumanMessage } from '@langchain/core/messages';
import { TemplateDelegate } from 'third-party/kbn-handlebars';

export class HumanInvisibleMessage extends HumanMessage {
  isVisible = false;
}

export class AIInvisibleMessage extends HumanMessage {
  isVisible = false;
}

export interface AgentContext {
  selection?: string;
  pageUrl?: string;
  linkText?: string;
  linkUrl?: string;
}

export interface ChatMessageContext {
  userInput: string;
  toolPrompt: string;
  quoteText: string;
  pageUrl: string;
  pageTitle: string;
}

export enum CommandType {
  ChatPopupDisplay,
  ChatToolbarDisplay,
}

export interface TabMessage {
  cmd: CommandType;
  selectionText?: string; // tab 内选择的文字
  pageUrl?: string; // tab 对应的 url
  linkText?: string; // 被点击的链接文本
  linkUrl?: string; // 被点击的链接URL
}

export interface PromptTool {
  name: string;
  hbs: string;
}

export interface ToolsPromptInterface {
  name: string;
  template?: TemplateDelegate;
}
