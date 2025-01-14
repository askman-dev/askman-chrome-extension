import { HumanMessage, SystemMessage } from '@langchain/core/messages';

export class SystemInvisibleMessage extends SystemMessage {
  isVisible = false;
}

export class HumanInvisibleMessage extends HumanMessage {
  isVisible = false;
}

export type HumanAskMessageFields = {
  content: string;
  name: string;
  rendered?: string;
};
export class HumanAskMessage extends HumanMessage {
  rendered?: string;

  constructor(fields: HumanAskMessageFields) {
    super({ content: fields.content, name: fields.name });
    this.rendered = fields.rendered;
  }
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

/* eslint-disable no-unused-vars */
export enum CommandType {
  ChatPopupDisplay,
  ChatToolbarDisplay,
  OpenOptionsPage,
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
  id: string;
  name: string;
  hbs: string;
  template: any;
}
