// Prism feature exports
export { default as PrismInput } from './conversation/PrismInput';
export type { PrismInputRef, PrismInputProps } from './conversation/PrismInput';
export { default as PrismColumn } from './conversation/PrismColumn';
export { streamChatResponse } from './services/PrismChatService';
export { default as MultiColumnCanvas } from './canvas/MultiColumnCanvas';
export type { ChatColumn, CanvasMessage } from './canvas/types';

// Re-export input-related types for compatibility
export type { ToolsPromptInterface, SystemPresetInterface } from '@src/components/input';
