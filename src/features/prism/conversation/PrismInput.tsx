/**
 * 调用方：thought-prism页面、Prism聊天界面
 * 依赖：TextareaAutosize、ShortcutSender、SystemPromptDropdown、ModelSelector
 */

/* eslint-disable react/prop-types */
import React, { useRef, useCallback, useImperativeHandle } from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import { ShortcutSender, SystemPromptDropdown, ModelSelector } from '@src/components/controls';
import type { ShortcutInterface } from '@src/types';
import type { SystemPresetInterface } from '@src/utils/StorageManager';

export interface PrismInputProps {
  className?: string;
  value?: string;
  placeholder?: string;
  minRows?: number;
  maxRows?: number;
  onValueChange?: (_value: string) => void;
  onSend?: (
    _message: string,
    _options?: { shortcut?: ShortcutInterface; systemPrompt?: string; model?: string },
  ) => void;
  onKeyDown?: (_e: React.KeyboardEvent<HTMLTextAreaElement>) => void;

  // 控制组件显示
  showShortcutDropdown?: boolean;
  showSystemPromptDropdown?: boolean;
  showModelSelector?: boolean;

  // 移除控制组件状态 - dropdown 内部管理

  // 控制组件回调
  onShortcutDropdownStatusChange?: (_open: boolean) => void;
  onSystemPromptDropdownStatusChange?: (_open: boolean) => void;
  onModelDropdownStatusChange?: (_open: boolean) => void;

  // 快捷键选择回调
  onShortcutSelect?: (_shortcut: ShortcutInterface, _withCommand?: boolean) => void;
  onSystemPromptSelect?: (_preset: SystemPresetInterface, _withCommand?: boolean) => void;
  onModelSelect?: (_model: string, _withCommand?: boolean) => void;

  // 按钮布局配置
  buttonLayout?: 'inline' | 'stacked';
  buttonAlignment?: 'left' | 'right' | 'center' | 'space-between';
}

export interface PrismInputRef {
  focus: () => void;
  blur: () => void;
  getValue: () => string;
  setValue: (_value: string) => void;
  clear: () => void;
}

export const PrismInput = React.memo(
  React.forwardRef<PrismInputRef, PrismInputProps>(
    (
      {
        className = '',
        value = '',
        placeholder = '输入消息...',
        minRows = 1,
        maxRows = 5,
        onValueChange = () => {},
        onSend = () => {},
        onKeyDown = () => {},

        // 控制组件显示 - 默认全部显示
        showShortcutDropdown = true,
        showSystemPromptDropdown = true,
        showModelSelector = true,

        // 控制组件回调
        onShortcutDropdownStatusChange = () => {},
        onSystemPromptDropdownStatusChange = () => {},
        onModelDropdownStatusChange = () => {},

        // 快捷键选择回调
        onShortcutSelect = () => {},
        onSystemPromptSelect = () => {},
        onModelSelect = () => {},

        // 按钮布局配置
        buttonLayout = 'inline',
        buttonAlignment = 'left',
      },
      ref,
    ) => {
      // 渲染跟踪 - 简化版本

      const textareaRef = useRef<HTMLTextAreaElement>(null);

      // 暴露给父组件的方法
      useImperativeHandle(ref, () => ({
        focus: () => textareaRef.current?.focus(),
        blur: () => textareaRef.current?.blur(),
        getValue: () => value,
        setValue: (newValue: string) => onValueChange(newValue),
        clear: () => onValueChange(''),
      }));

      const handleKeyDown = useCallback(
        (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
          // 处理Enter键发送
          if (e.key === 'Enter' && !e.shiftKey && !e.ctrlKey && !e.altKey) {
            // 检查是否是输入法组合状态
            if (e.nativeEvent instanceof KeyboardEvent && e.nativeEvent.isComposing) {
              return; // 输入法组合中，等待完成
            }

            // dropdown现在自主管理状态，无需检查

            e.preventDefault();
            e.stopPropagation();

            // 获取 textarea 的当前实际值，而不是依赖 React state
            const currentValue = textareaRef.current?.value || value;

            if (currentValue.trim()) {
              onSend(currentValue.trim());
              onValueChange('');
            }
            return;
          }

          // 调用外部的键盘事件处理器
          onKeyDown(e);
        },
        [value, onSend, onValueChange, onKeyDown],
      );

      const handleChange = useCallback(
        (e: React.ChangeEvent<HTMLTextAreaElement>) => {
          onValueChange(e.target.value);
        },
        [onValueChange],
      );

      const handleCompositionEnd = useCallback(
        (e: React.CompositionEvent<HTMLTextAreaElement>) => {
          // 输入法组合结束，更新值
          onValueChange(e.currentTarget.value);
        },
        [onValueChange],
      );

      const getButtonLayoutClasses = () => {
        const baseClasses = 'flex gap-2';

        if (buttonLayout === 'stacked') {
          return `${baseClasses} flex-col`;
        }

        // inline布局
        switch (buttonAlignment) {
          case 'right':
            return `${baseClasses} justify-end`;
          case 'center':
            return `${baseClasses} justify-center`;
          case 'space-between':
            return `${baseClasses} justify-between`;
          case 'left':
          default:
            return `${baseClasses} justify-start`;
        }
      };

      return (
        <div className={`prism-input ${className}`}>
          {/* 输入区域 - 包含内置工具条 */}
          <div className="input-container relative border border-gray-300 rounded-lg">
            <TextareaAutosize
              ref={textareaRef}
              value={value}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              onCompositionEnd={handleCompositionEnd}
              placeholder={placeholder}
              minRows={minRows}
              maxRows={maxRows}
              className="w-full px-3 py-2 resize-none focus:outline-none bg-transparent text-sm"
            />

            {/* 内置控制按钮区域 - 位于输入框底部 */}
            {(showShortcutDropdown || showSystemPromptDropdown || showModelSelector) && (
              <div className={`controls-container px-3 pb-2 ${getButtonLayoutClasses()}`}>
                {/* 左侧组：System Prompt 和 Model - 优先显示 */}
                <div className="flex gap-2 flex-shrink-0 min-w-0">
                  {showSystemPromptDropdown && (
                    <SystemPromptDropdown
                      className="flex-shrink-0"
                      statusListener={onSystemPromptDropdownStatusChange}
                      onItemClick={onSystemPromptSelect}
                    />
                  )}

                  {showModelSelector && (
                    <ModelSelector
                      className="flex-shrink-0"
                      statusListener={onModelDropdownStatusChange}
                      onItemClick={onModelSelect}
                      initOpen={false}
                    />
                  )}
                </div>

                {/* 右侧组：Tool Dropdown (发送按钮) - 小屏幕时隐藏避免重叠 */}
                {showShortcutDropdown && (
                  <div className="hidden lg:block">
                    <ShortcutSender
                      className="flex-shrink-0"
                      statusListener={onShortcutDropdownStatusChange}
                      onItemClick={(shortcut: Record<string, unknown>, withCommand?: boolean) => {
                        // Convert Record<string, unknown> to ShortcutInterface
                        const shortcutInterface: ShortcutInterface = {
                          id: shortcut.id as string,
                          name: shortcut.name as string,
                          hbs: shortcut.hbs as string,
                          template: shortcut.template as unknown,
                        };
                        onShortcutSelect(shortcutInterface, withCommand);
                      }}
                      buttonDisplay="➔"
                      initOpen={false}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      );
    },
  ),
  (prevProps, nextProps) => {
    // 记录props变化
    const changes = [];

    if (prevProps.value !== nextProps.value) changes.push('value');
    if (prevProps.onSystemPromptDropdownStatusChange !== nextProps.onSystemPromptDropdownStatusChange)
      changes.push('onSystemPromptDropdownStatusChange');
    if (prevProps.onModelDropdownStatusChange !== nextProps.onModelDropdownStatusChange)
      changes.push('onModelDropdownStatusChange');
    if (prevProps.onShortcutDropdownStatusChange !== nextProps.onShortcutDropdownStatusChange)
      changes.push('onShortcutDropdownStatusChange');

    if (changes.length > 0) {
      return false; // 重新渲染
    }

    return true; // 跳过渲染
  },
);

PrismInput.displayName = 'PrismInput';

export default PrismInput;
