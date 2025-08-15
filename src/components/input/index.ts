// AdvancedInput has been moved to src/features/prism/PrismInput
// For backward compatibility, re-export from new location
export { default as AdvancedInput, PrismInput } from '@src/features/prism/PrismInput';
export type { PrismInputRef as AdvancedInputRef, PrismInputRef } from '@src/features/prism/PrismInput';

// Re-export types that are used by the input component
export type { ToolsPromptInterface } from '@src/types';

// Re-export the correct system preset interface from StorageManager
export type { SystemPresetInterface } from '@src/utils/StorageManager';

// Re-export controls
export { ToolDropdown, SystemPromptDropdown, ModelSelector } from '../controls';
export { ModelSelector as default } from '../controls';
