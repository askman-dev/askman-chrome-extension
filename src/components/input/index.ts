// PrismInput has been moved to src/features/prism/conversation/PrismInput
// For backward compatibility, re-export from new location
export { default as AdvancedInput, PrismInput } from '@src/features/prism/conversation/PrismInput';
export type { PrismInputRef as AdvancedInputRef, PrismInputRef } from '@src/features/prism/conversation/PrismInput';

// Re-export types that are commonly used with input components
export type { ToolsPromptInterface } from '@src/types';
export type { SystemPresetInterface } from '@src/utils/StorageManager';
