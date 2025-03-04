import React, { useState } from 'react';
import classNames from 'classnames';

export interface CopyButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** 要复制的文本内容 */
  text: string;
  /** 复制成功的回调 */
  onCopied?: () => void;
  /** 复制失败的回调 */
  onCopyFailed?: (_error: Error) => void;
  /** 按钮的样式类名 */
  className?: string;
  /** 成功图标的样式类名 */
  successIconClassName?: string;
  /** 复制图标的样式类名 */
  copyIconClassName?: string;
  /** 复制成功后的显示时间（毫秒） */
  successDuration?: number;
}

export const useCopyButton = (showTrigger = true) => {
  const [isVisible, setIsVisible] = useState(false);

  const handlers = {
    onMouseEnter: () => showTrigger && setIsVisible(true),
    onMouseLeave: () => showTrigger && setIsVisible(false),
  };

  return {
    isVisible,
    setIsVisible,
    handlers,
  };
};

export function CopyButton({
  text,
  onCopied,
  onCopyFailed,
  className = '',
  successIconClassName = 'text-sky-600',
  copyIconClassName = '',
  successDuration = 2000,
  ...props
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      onCopied?.();
      setTimeout(() => setCopied(false), successDuration);
    } catch (err) {
      console.error('Failed to copy text:', err);
      onCopyFailed?.(err instanceof Error ? err : new Error('Copy failed'));
    }
  };

  return (
    <button
      onClick={handleCopy}
      className={classNames(
        'absolute p-2 rounded transition-all duration-300 z-10',
        'opacity-70 hover:opacity-100',
        className,
      )}
      aria-label={copied ? 'Copied' : 'Copy content'}
      type="button"
      {...props}>
      {copied ? (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={classNames('h-5 w-5', successIconClassName)}
          viewBox="0 0 20 20"
          fill="currentColor">
          <path
            fillRule="evenodd"
            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
            clipRule="evenodd"
          />
        </svg>
      ) : (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={classNames('h-5 w-5', copyIconClassName)}
          viewBox="0 0 20 20"
          fill="currentColor">
          <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
          <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
        </svg>
      )}
    </button>
  );
}

export default CopyButton;
