import { HumanMessage, SystemMessage, AIMessage } from '@langchain/core/messages';

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

export class AIThinkingMessage extends AIMessage {
  isThinking = true;

  constructor() {
    super('');
  }
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
  mentions: MentionInfo[];
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
  fromShortcut?: boolean; // 是否由快捷键触发
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
  template: unknown;
}

/* eslint-disable no-unused-vars */
export enum MentionType {
  UNPROCESSED = 'unprocessed', // mention 未被任何 tool 处理
  TOOL_PROCESSED = 'tool_processed', // mention 已经被 tool 处理
  REFERENCE_PROCESSED = 'reference_processed', // mention 被作为 reference 处理
}

export interface MentionInfo {
  type: MentionType;
  content: string;
  quoteMark: string; // 用于标记该 mention 在文本中的位置
  processedBy?: string; // 处理该 mention 的 tool 名称
}
