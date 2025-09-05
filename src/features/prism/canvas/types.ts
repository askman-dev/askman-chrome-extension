/**
 * 画布对话系统的核心类型定义
 *
 * 基于 Vercel AI SDK 的 Message 结构
 * 支持树状对话结构和固定网格布局
 */

import type { ToolsPromptInterface } from '@src/components/input';
// import type { CoreMessage } from 'ai';

// ================================
// 基础数据结构（扩展 Vercel AI SDK）
// ================================

/**
 * 画布对话消息（基于 Vercel AI SDK 的 CoreMessage 结构）
 */
export interface CanvasMessage {
  // 基础消息字段（来自 CoreMessage）
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string | Array<unknown>;
  createdAt?: Date;

  // 树状结构字段
  parentId?: string; // 父消息ID（用于构建对话树）
  children?: string[]; // 子消息ID列表（用于构建对话树）

  // 画布扩展元数据
  canvasMetadata?: {
    isEditing?: boolean; // 是否处于编辑状态
    isStreaming?: boolean; // 是否正在流式响应
    tokens?: number; // AI响应的token数
    model?: string; // 使用的AI模型
    [key: string]: unknown;
  };
}

// ================================
// 多列画布状态定义
// ================================

/**
 * 对话列定义
 */
export interface ChatColumn {
  id: string;
  messages: CanvasMessage[];
  position?: { x: number; y: number }; // 可选，在MultiColumnCanvas中动态计算
  width?: number; // 可选，使用常量配置
  parentColumnId?: string; // 父列ID（分叉来源）
  branchPoint?: string; // 分叉点消息ID
  isActive: boolean; // 是否为当前激活列
  metadata: {
    title?: string;
    createdAt: Date;
    lastActivity: Date;
  };
}

/**
 * 列间连接关系
 */
export interface ColumnConnection {
  id: string;
  fromColumnId: string;
  toColumnId: string;
  fromMessageId: string;
  type: 'branch' | 'reference';
}

/**
 * 多列画布状态
 */
export interface MultiColumnState {
  columns: ChatColumn[];
  activeColumnId?: string;
  connections: ColumnConnection[];
  viewport: ViewportState;
  isLoading: boolean;
  lastUpdated: number;
}

/**
 * 视口状态
 */
export interface ViewportState {
  zoom: number; // 缩放比例 (0.5 - 2.0)
  offsetX: number; // 水平偏移
  offsetY: number; // 垂直偏移
}

/**
 * 画布整体状态（向后兼容）
 */
export interface CanvasState {
  messages: CanvasMessage[]; // 所有消息
  activeMessageId?: string; // 当前激活消息
  selectedMessageIds: string[]; // 选中的消息列表
  isLoading: boolean; // 是否处于加载状态
  lastUpdated: number; // 最后更新时间
}

// ================================
// Hook 接口定义
// ================================

/**
 * useCanvasState Hook 的输入输出接口
 */
export interface CanvasStateHookReturn {
  // 状态
  state: CanvasState;

  // 消息操作
  addMessage: (_role: CanvasMessage['role'], _content: string, _parentId?: string) => string;
  updateMessage: (_messageId: string, _updates: Partial<CanvasMessage>) => void;
  removeMessage: (_messageId: string) => void;

  // 选择操作
  selectMessage: (_messageId: string, _multiSelect?: boolean) => void;
  clearSelection: () => void;
  setActiveMessage: (_messageId: string) => void;

  // 实用方法
  getMessage: (_messageId: string) => CanvasMessage | undefined;
  getMessageChildren: (_messageId: string) => CanvasMessage[];
  getMessageParent: (_messageId: string) => CanvasMessage | undefined;
}

/**
 * useCanvasNavigation Hook 的输入输出接口
 */
export interface CanvasNavigationHookReturn {
  // 状态
  viewport: ViewportState;

  // 导航操作
  pan: (_deltaX: number, _deltaY: number) => void;
  zoom: (_factor: number) => void;
  resetView: () => void;
}

// ================================
// 事件系统接口定义
// ================================

/**
 * 画布事件类型
 */
export type CanvasEventType =
  | 'message:created'
  | 'message:updated'
  | 'message:deleted'
  | 'message:selected'
  | 'viewport:changed';

/**
 * 画布事件数据
 */
export interface CanvasEvent<T = unknown> {
  type: CanvasEventType;
  data: T;
  timestamp: number;
}

/**
 * 事件监听器类型
 */
export type CanvasEventListener<T = unknown> = (_event: CanvasEvent<T>) => void;

// ================================
// 组件Props接口定义
// ================================

/**
 * MultiColumnCanvas 主组件的 Props
 */
export interface MultiColumnCanvasProps {
  columns?: ChatColumn[];
  initialColumns?: ChatColumn[];
  onColumnCreate?: (_column: ChatColumn) => void;
  onColumnUpdate?: (_columnId: string, _updates: Partial<ChatColumn>) => void;
  onColumnDelete?: (_columnId: string) => void;
  onBranchCreate?: (_fromColumnId: string, _fromMessageId: string) => void;
  onMessageCreate?: (
    _columnId: string,
    _content: string,
    _parentId?: string,
    _options?: { tool?: ToolsPromptInterface; systemPrompt?: string; model?: string },
  ) => void;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * ChatColumn 组件的 Props
 */
export interface ChatColumnProps {
  column: ChatColumn;
  isActive?: boolean;
  isFocused?: boolean;
  onSelect?: (_columnId: string) => void;
  onDoubleClick?: () => void;
  onBranch?: (_messageId: string) => void;
  onMessageCreate?: (
    _content: string,
    _parentId?: string,
    _options?: { tool?: ToolsPromptInterface; systemPrompt?: string; model?: string },
  ) => void;
  onExitFocus?: () => void; // 退出聚焦模式的回调
  width?: number;
  className?: string;
  highlightedMessageId?: string | null; // 高亮的消息ID（用于显示分叉源）
}

// ================================
// 网格布局系统类型定义
// ================================

/**
 * 网格坐标位置
 */
export interface GridPosition {
  row: number;
  col: number;
}

/**
 * 网格数据结构
 */
export interface GridData {
  grid: (Column | null)[][];
  positions: Map<string, GridPosition>;
  dimensions: { rows: number; cols: number };
}

/**
 * 简化的列定义（兼容ChatColumn）
 */
export interface Column {
  id: string;
  messages: CanvasMessage[];
  parentColumnId?: string;
  branchPoint?: string;
  metadata: {
    title?: string;
    createdAt: Date;
    lastActivity: Date;
  };
}

/**
 * 抽取行结构（布局算法中间状态）
 */
export interface ExtractedRow {
  parentColumn: Column;
  branchColumns: Column[];
  originalPosition: number;
}

/**
 * ChatCanvas 主组件的 Props（向后兼容）
 */
export interface ChatCanvasProps {
  initialMessages?: CanvasMessage[]; // 初始消息数据
  onMessageCreate?: (_message: CanvasMessage) => void;
  onMessageUpdate?: (_message: CanvasMessage) => void;
  onMessageDelete?: (_messageId: string) => void;
  onAIRequest?: (_prompt: string, _context: CanvasMessage[]) => Promise<string>;
  className?: string;
  style?: React.CSSProperties;
}
