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

export class AIReasoningMessage extends AIMessage {
  reasoning: string = '';
  content: string = '';
  isReasoning = true;
  isInterrupted = false;
  interruptedAt: Date | null = null;

  constructor() {
    super('');
  }

  // Update reasoning text (gray phase)
  updateReasoning(text: string) {
    this.reasoning = text;
  }

  // Update content text (normal phase)
  updateContent(text: string) {
    this.content = text;
    // Don't switch phases - keep both reasoning and content visible
  }

  // Get display text for UI (show both reasoning and content)
  getDisplayText(): string {
    if (this.reasoning && this.content) {
      return `${this.reasoning}\n\n${this.content}`;
    }
    return this.content || this.reasoning;
  }

  // Check if we have reasoning content
  hasReasoning(): boolean {
    return Boolean(this.reasoning);
  }

  // Check if we have final content
  hasContent(): boolean {
    return Boolean(this.content);
  }

  // Mark message as interrupted and preserve existing content
  markAsInterrupted(): void {
    const currentContent = this.getDisplayText();
    const timestamp = new Date();

    // Preserve existing content and add interruption marker
    if (currentContent) {
      // If we have reasoning but no content, add marker to reasoning
      if (this.reasoning && !this.content) {
        this.reasoning = `${this.reasoning}\n\n[已中断]`;
      }
      // If we have content, add marker to content
      else if (this.content) {
        this.content = `${this.content}\n\n[已中断]`;
      }
    } else {
      // No existing content, just show interruption marker
      this.content = '[已中断]';
    }

    this.isInterrupted = true;
    this.interruptedAt = timestamp;
  }

  // Check if message was interrupted
  isMessageInterrupted(): boolean {
    return this.isInterrupted;
  }

  // Get interruption timestamp
  getInterruptedAt(): Date | null {
    return this.interruptedAt;
  }
}

// Tool execution progress message types
export class AIToolPendingMessage extends AIMessage {
  toolName: string;
  toolInput?: unknown;
  isToolPending = true;

  constructor(toolName: string, input?: unknown) {
    super(`🔄 Preparing ${toolName}`);
    this.toolName = toolName;
    this.toolInput = input;
  }
}

export class AIToolExecutingMessage extends AIMessage {
  toolName: string;
  isToolExecuting = true;

  constructor(toolName: string) {
    super(`⚡ Executing ${toolName}...`);
    this.toolName = toolName;
  }
}

export class AIToolResultMessage extends AIMessage {
  toolName: string;
  result: unknown;
  isToolResult = true;

  constructor(toolName: string, result: unknown) {
    super(`✓ ${toolName} completed`);
    this.toolName = toolName;
    this.result = result;
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
  // Agent tools
  GetPageText,
  GetPageLinks,
  ScrollPage,
}
export interface TabMessage {
  cmd: CommandType;
  selectionText?: string; // tab 内选择的文字
  pageUrl?: string; // tab 对应的 url
  fromShortcut?: boolean; // 是否由快捷键触发
  linkText?: string; // 被点击的链接文本
  linkUrl?: string; // 被点击的链接URL
  data?: unknown; // 用于传递工具调用的数据，如滚动偏移量
  timestamp?: number; // 用于工具调用的时间戳
}

export interface PromptTool {
  name: string;
  hbs: string;
}

export interface ShortcutInterface {
  id: string;
  name: string;
  hbs: string;
  template: unknown;
}

// @deprecated Use ShortcutInterface instead
export interface ToolsPromptInterface extends ShortcutInterface {}

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
