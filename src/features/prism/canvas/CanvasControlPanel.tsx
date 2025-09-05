/**
 * @ac-document CanvasControlPanel.acceptance.md
 */

import React, { useState, useEffect, useCallback } from 'react';
import type { ChatColumn as ChatColumnType } from './types';

interface CanvasControlPanelProps {
  className?: string;
  style?: React.CSSProperties;
  // 画布状态
  columns: ChatColumnType[];
  activeColumnId?: string;
  isFocused: boolean;
  // 聚焦功能
  onFocusColumn: (_columnId: string) => void;
}

const CanvasControlPanel: React.FC<CanvasControlPanelProps> = ({
  className = '',
  style = {},
  columns = [],
  activeColumnId = '',
  isFocused = false,
  onFocusColumn,
}) => {
  // UI状态管理
  const [hoveredButton, setHoveredButton] = useState<string | null>(null);
  const [clickedButton, setClickedButton] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // 监听全屏状态变化
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // 计算按钮状态
  const hasColumns = columns.length > 0;
  const hasData = columns.length > 0;
  const isFocusDisabled = !hasColumns;
  const isExportDisabled = !hasData || isExporting;

  // 获取目标列ID（活跃列或第一列）
  const getTargetColumnId = useCallback(() => {
    if (!hasColumns) return null;

    // 如果有活跃列，使用活跃列
    if (activeColumnId && columns.some(col => col.id === activeColumnId)) {
      return activeColumnId;
    }

    // 否则使用第一列
    return columns[0].id;
  }, [hasColumns, activeColumnId, columns]);

  // Focus Button 处理
  const handleFocusClick = useCallback(async () => {
    if (isFocusDisabled) return;
    if (columns.length === 0) return; // 空画布检查

    const targetColumnId = getTargetColumnId();
    if (!targetColumnId) return;

    try {
      console.log('CanvasControlPanel: Focusing column', { targetColumnId, activeColumnId });
      await onFocusColumn(targetColumnId);
    } catch (error) {
      console.error('CanvasControlPanel: Focus operation failed:', error);
      // 不显示错误给用户，保持静默失败
    }
  }, [isFocusDisabled, columns.length, getTargetColumnId, onFocusColumn, activeColumnId]);

  // Fullscreen Button 处理
  const handleFullscreenClick = useCallback(async () => {
    try {
      if (!document.fullscreenElement) {
        // 进入全屏
        const element = document.documentElement;
        if (element.requestFullscreen) {
          await element.requestFullscreen();
        } else if (
          (element as typeof element & { webkitRequestFullscreen?: () => Promise<void> }).webkitRequestFullscreen
        ) {
          await (
            element as typeof element & { webkitRequestFullscreen: () => Promise<void> }
          ).webkitRequestFullscreen();
        } else if ((element as typeof element & { mozRequestFullScreen?: () => Promise<void> }).mozRequestFullScreen) {
          await (element as typeof element & { mozRequestFullScreen: () => Promise<void> }).mozRequestFullScreen();
        } else if ((element as typeof element & { msRequestFullscreen?: () => Promise<void> }).msRequestFullscreen) {
          await (element as typeof element & { msRequestFullscreen: () => Promise<void> }).msRequestFullscreen();
        }
      } else {
        // 退出全屏
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if (
          (document as typeof document & { webkitExitFullscreen?: () => Promise<void> }).webkitExitFullscreen
        ) {
          await (document as typeof document & { webkitExitFullscreen: () => Promise<void> }).webkitExitFullscreen();
        } else if ((document as typeof document & { mozCancelFullScreen?: () => Promise<void> }).mozCancelFullScreen) {
          await (document as typeof document & { mozCancelFullScreen: () => Promise<void> }).mozCancelFullScreen();
        } else if ((document as typeof document & { msExitFullscreen?: () => Promise<void> }).msExitFullscreen) {
          await (document as typeof document & { msExitFullscreen: () => Promise<void> }).msExitFullscreen();
        }
      }
    } catch (error) {
      console.error('CanvasControlPanel: Fullscreen operation failed:', error);
      // 静默处理全屏API限制，不显示错误
    }
  }, []);

  // Export Button 处理
  const handleExportClick = useCallback(async () => {
    if (isExportDisabled) return;

    setIsExporting(true);
    try {
      const exportData = {
        columns: columns.map(col => ({
          id: col.id,
          title: col.metadata?.title || 'Untitled',
          messages: col.messages,
          createdAt: col.metadata?.createdAt,
          lastActivity: col.metadata?.lastActivity,
          parentColumnId: col.parentColumnId,
          branchPoint: col.branchPoint,
        })),
        exportTime: new Date().toISOString(),
        version: '1.0',
        metadata: {
          totalColumns: columns.length,
          totalMessages: columns.reduce((sum, col) => sum + col.messages.length, 0),
          activeColumnId: activeColumnId,
          isFocused: isFocused,
        },
      };

      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      const now = new Date();
      const timestamp = now.toISOString().replace(/T/, '-').replace(/:/g, '-').split('.')[0];
      link.download = `chat-canvas-${timestamp}.json`;
      link.click();
      URL.revokeObjectURL(url);

      console.log('Export completed successfully', {
        columnsExported: columns.length,
        filename: link.download,
      });
    } catch (error) {
      console.error('CanvasControlPanel: Export operation failed:', error);
    } finally {
      setIsExporting(false);
    }
  }, [isExportDisabled, columns, activeColumnId, isFocused]);

  // 按钮提示文本
  const getFocusButtonTooltip = () => {
    if (isFocusDisabled) return 'No columns to focus';
    const targetColumnId = getTargetColumnId();
    const targetColumn = targetColumnId ? columns.find(col => col.id === targetColumnId) : null;
    const columnName = targetColumn?.metadata?.title || targetColumnId?.slice(-8) || 'unknown';
    return `Focus: ${columnName}`;
  };

  const getFullscreenButtonTooltip = () => {
    return isFullscreen ? 'Exit fullscreen (ESC)' : 'Zen Mode (Fullscreen)';
  };

  const getExportButtonTooltip = () => {
    if (isExportDisabled) return 'No data to export';
    return isExporting ? 'Exporting...' : 'Export as JSON';
  };

  // 合并className
  const containerClasses = ['absolute top-4 right-4 z-20 flex flex-col gap-2', className].filter(Boolean).join(' ');

  return (
    <div className={containerClasses} style={style}>
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-gray-200 dark:border-slate-600 p-2">
        <div className="flex flex-col gap-1">
          {/* Focus Button */}
          <button
            className={`
              w-8 h-8 flex items-center justify-center rounded transition-all duration-200
              ${
                isFocusDisabled
                  ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-slate-700'
              }
              ${hoveredButton === 'focus' && !isFocusDisabled ? 'bg-gray-100 dark:bg-slate-700 scale-105' : ''}
              ${clickedButton === 'focus' ? 'scale-95' : ''}
            `}
            title={getFocusButtonTooltip()}
            disabled={isFocusDisabled}
            onClick={handleFocusClick}
            onMouseEnter={() => setHoveredButton('focus')}
            onMouseLeave={() => setHoveredButton(null)}
            onMouseDown={() => setClickedButton('focus')}
            onMouseUp={() => setClickedButton(null)}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 2L12 6M12 18L12 22M22 12L18 12M6 12L2 12M17.66 6.34L15.54 8.46M8.46 15.54L6.34 17.66M17.66 17.66L15.54 15.54M8.46 8.46L6.34 6.34"
              />
              <circle cx="12" cy="12" r="3" strokeWidth={2} />
            </svg>
          </button>

          {/* Fullscreen Button */}
          <button
            className={`
              w-8 h-8 flex items-center justify-center rounded transition-all duration-200
              text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-slate-700
              ${hoveredButton === 'fullscreen' ? 'bg-gray-100 dark:bg-slate-700 scale-105' : ''}
              ${clickedButton === 'fullscreen' ? 'scale-95' : ''}
            `}
            title={getFullscreenButtonTooltip()}
            onClick={handleFullscreenClick}
            onMouseEnter={() => setHoveredButton('fullscreen')}
            onMouseLeave={() => setHoveredButton(null)}
            onMouseDown={() => setClickedButton('fullscreen')}
            onMouseUp={() => setClickedButton(null)}>
            {isFullscreen ? (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M9 15H4.5M9 15V19.5M9 15L3.75 20.25M15 9H19.5M15 9V4.5M15 9L20.25 3.75M15 15H19.5M15 15V19.5M15 15L20.25 20.25"
                />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
                />
              </svg>
            )}
          </button>

          {/* Export Button */}
          <button
            className={`
              w-8 h-8 flex items-center justify-center rounded transition-all duration-200
              ${
                isExportDisabled
                  ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-slate-700'
              }
              ${hoveredButton === 'export' && !isExportDisabled ? 'bg-gray-100 dark:bg-slate-700 scale-105' : ''}
              ${clickedButton === 'export' ? 'scale-95' : ''}
              ${isExporting ? 'animate-pulse' : ''}
            `}
            title={getExportButtonTooltip()}
            disabled={isExportDisabled}
            onClick={handleExportClick}
            onMouseEnter={() => setHoveredButton('export')}
            onMouseLeave={() => setHoveredButton(null)}
            onMouseDown={() => setClickedButton('export')}
            onMouseUp={() => setClickedButton(null)}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CanvasControlPanel;
