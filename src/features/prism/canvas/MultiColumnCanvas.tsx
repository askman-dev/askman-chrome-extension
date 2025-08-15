/**
 * @ac-document MultiColumnCanvas.acceptance.md
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { TransformWrapper, TransformComponent, ReactZoomPanPinchRef } from 'react-zoom-pan-pinch';
import ChatColumn from '@src/features/prism/conversation/PrismColumn';
import ColumnPositionWrapper from './ColumnPositionWrapper';
// import { calculateColumnY } from './ColumnYCalculator';
import { LayoutCalculator } from './LayoutCalculator';
import CanvasControlPanel from './CanvasControlPanel';
import type { MultiColumnCanvasProps, ChatColumn as ChatColumnType, Column } from './types';

// 列布局配置常量
const COLUMN_LAYOUT = {
  WIDTH: 40, // 列宽度 (vw)
  COLUMN_GAP: 16, // 列之间的实际间距 (px)
} as const;

const MultiColumnCanvas: React.FC<MultiColumnCanvasProps> = ({
  columns = [],
  onColumnCreate: _onColumnCreate,
  onColumnUpdate: _onColumnUpdate,
  onColumnDelete: _onColumnDelete,
  onBranchCreate,
  onMessageCreate,
  className = '',
  style = {},
}) => {
  // 原始列数据（不含position和width）
  const [rawColumns, setRawColumns] = useState<ChatColumnType[]>(columns);

  useEffect(() => {
    setRawColumns(columns);
  }, [columns]);

  // 带位置信息的处理后列数据
  const [processedColumns, setProcessedColumns] = useState<
    Array<ChatColumnType & { position: { x: number; y: number }; width: number }>
  >([]);

  // 使用单一状态管理：null = 普通模式，string = Focus 模式 + 焦点列
  const [focusedColumnId, setFocusedColumnId] = useState<string | null>(null);
  const [highlightedMessageId, setHighlightedMessageId] = useState<string | null>(null);

  // 派生状态
  const isFocused = focusedColumnId !== null;
  const dragStartRef = useRef<{ x: number; y: number; isOnColumn?: boolean } | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const transformRef = useRef<ReactZoomPanPinchRef | null>(null);

  // 字体缩放补偿系统
  const SCALE_THRESHOLD = 1.1; // 超过1.1倍开始补偿

  // 列DOM引用映射，用于Y位置计算
  const columnRefs = useRef<Map<string, React.RefObject<HTMLDivElement>>>(new Map());

  // 获取或创建列的DOM引用
  const getColumnRef = useCallback((columnId: string) => {
    const existing = columnRefs.current.get(columnId);
    if (existing) return existing;

    const newRef = { current: null as HTMLDivElement | null };
    columnRefs.current.set(columnId, newRef);
    return newRef;
  }, []);

  // 字体缩放补偿函数
  // 缓存上次的补偿值，避免重复的 DOM 操作
  const lastCompensationRef = useRef<number>(1.0);
  const compensationTimeoutRef = useRef<number | null>(null);

  const applyFontCompensation = useCallback(
    (scale: number) => {
      let compensation = 1.0;
      if (scale > SCALE_THRESHOLD) {
        // 放大时：字体保持在14px，不要变大
        // 由于CSS基础是14px，当scale > 1时，我们要抵消放大效果
        compensation = 1.0 / scale;
      } else {
        // 缩小时：允许字体正常缩小
        compensation = 1.0;
      }

      // 避免重复设置相同的值，减少 DOM 操作
      const roundedCompensation = Math.round(compensation * 100) / 100; // 精确到小数点后2位，更粗粒度
      if (Math.abs(roundedCompensation - lastCompensationRef.current) < 0.01) {
        return; // 值没有显著变化，跳过 DOM 操作 (提高阈值到0.01)
      }

      // 清除之前的防抖定时器
      if (compensationTimeoutRef.current) {
        clearTimeout(compensationTimeoutRef.current);
      }

      // 防抖：延迟执行 DOM 操作，避免频繁更新
      compensationTimeoutRef.current = window.setTimeout(() => {
        requestAnimationFrame(() => {
          const columns = document.querySelectorAll('.ChatColumn');
          columns.forEach(column => {
            (column as HTMLElement).style.setProperty('--font-compensation', roundedCompensation.toString());
          });
          lastCompensationRef.current = roundedCompensation;
        });
      }, 100); // 增加延迟到100ms，减少频繁触发
    },
    [SCALE_THRESHOLD],
  );

  // 清理定时器防止内存泄漏
  useEffect(() => {
    return () => {
      if (compensationTimeoutRef.current) {
        clearTimeout(compensationTimeoutRef.current);
      }
    };
  }, []);

  // 计算所有列的位置（使用新的网格布局算法）
  const calculateColumnPositions = useCallback(
    (columnsToProcess: ChatColumnType[], currentViewportWidth: number = window.innerWidth) => {
      const processedColumns: Array<ChatColumnType & { position: { x: number; y: number }; width: number }> = [];

      // 计算实际的列宽度（px）
      const viewportWidth = currentViewportWidth;
      const columnWidthPx = (viewportWidth * COLUMN_LAYOUT.WIDTH) / 100; // 40vw转为px

      // 转换为网格算法需要的Column格式
      const gridColumns: Column[] = columnsToProcess.map(col => ({
        id: col.id,
        messages: col.messages,
        parentColumnId: col.parentColumnId,
        branchPoint: col.branchPoint,
        metadata: col.metadata,
      }));

      // 使用网格布局算法计算位置
      const gridData = LayoutCalculator.calculateGridLayout(gridColumns);

      // 网格布局常量
      const GRID_CELL_HEIGHT = 700; // 每个网格单元格的高度
      const GRID_ROW_GAP = 50; // 行之间的间距

      // 将网格坐标转换为像素坐标
      for (const column of columnsToProcess) {
        const gridPosition = gridData.positions.get(column.id);

        if (gridPosition) {
          // 网格坐标 -> 像素坐标
          const pixelX = gridPosition.col * (columnWidthPx + COLUMN_LAYOUT.COLUMN_GAP);
          const pixelY = gridPosition.row * (GRID_CELL_HEIGHT + GRID_ROW_GAP);

          const adjustedY = pixelY;

          processedColumns.push({
            ...column,
            position: { x: pixelX, y: adjustedY },
            width: COLUMN_LAYOUT.WIDTH,
          });
        } else {
          console.warn(`No grid position found for column ${column.id}`);
        }
      }

      return processedColumns;
    },
    [],
  );

  // 窗口尺寸状态
  const [viewportSize, setViewportSize] = useState({ width: window.innerWidth, height: window.innerHeight });

  // 监听窗口尺寸变化
  useEffect(() => {
    const handleResize = () => {
      setViewportSize({ width: window.innerWidth, height: window.innerHeight });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 当原始列数据或窗口尺寸变化时，重新计算位置
  useEffect(() => {
    const newProcessedColumns = calculateColumnPositions(rawColumns, viewportSize.width);
    setProcessedColumns(newProcessedColumns);
  }, [rawColumns, calculateColumnPositions, viewportSize.width, viewportSize.height]);

  // 计算初始居中位置
  const getInitialCenterPosition = useCallback(() => {
    const viewportWidth = viewportSize.width;
    const viewportHeight = viewportSize.height;
    const contentWidth = viewportWidth * (COLUMN_LAYOUT.WIDTH / 100); // Use the actual column width (40vw)
    const contentHeight = viewportHeight * 0.8; // 80vh, matching ChatColumn's h-[80vh]

    const PADDING_TOP_PX = 32; // p-8 = 2rem = 32px

    const centerX = (viewportWidth - contentWidth) / 2;
    const centerY = (viewportHeight - contentHeight) / 2 - PADDING_TOP_PX; // Account for the container's top padding

    return { centerX, centerY };
  }, [viewportSize.width, viewportSize.height]);

  const initialPosition = getInitialCenterPosition();

  const zoomToColumn = useCallback((columnId: string) => {
    const transformInstance = transformRef.current;
    if (!transformInstance) {
      return;
    }

    const columnRef = columnRefs.current.get(columnId);
    if (!columnRef?.current) {
      return;
    }

    const { scale, positionX, positionY } = transformInstance.instance.transformState;

    const columnRect = columnRef.current.getBoundingClientRect();
    const viewportHeight = window.innerHeight;

    const currentScale = scale;
    const realColumnHeight = columnRect.height / currentScale;

    const targetScale = (viewportHeight * 0.9) / realColumnHeight;

    const columnWorldX = (columnRect.left - positionX) / scale;
    const columnWorldY = (columnRect.top - positionY) / scale;

    const realColumnWidth = columnRect.width / currentScale;

    const scaledColumnWidth = realColumnWidth * targetScale;
    const viewportWidth = window.innerWidth;

    const margin = Math.min(scaledColumnWidth * 0.05, 50);
    const leftBoundary = margin;
    const rightBoundary = viewportWidth - scaledColumnWidth - margin;

    const currentLeft = columnRect.left;

    let targetScreenLeft;
    if (currentLeft < leftBoundary) {
      targetScreenLeft = leftBoundary;
    } else if (currentLeft + scaledColumnWidth > viewportWidth - margin) {
      targetScreenLeft = rightBoundary;
    } else {
      targetScreenLeft = currentLeft;
    }

    const targetX = targetScreenLeft - columnWorldX * targetScale;

    const targetY = viewportHeight / 2 - (columnWorldY + realColumnHeight / 2) * targetScale;

    transformInstance.setTransform(targetX, targetY, targetScale, 300, 'easeOut');

    setFocusedColumnId(columnId);
  }, []);

  const panToColumn = useCallback((columnId: string) => {
    setFocusedColumnId(columnId);
  }, []);

  const switchToColumn = useCallback((newColumnId: string) => {
    setFocusedColumnId(newColumnId);
  }, []);

  const handleColumnClick = useCallback(
    (columnId: string) => {
      if (!isFocused) {
        panToColumn(columnId);
      } else if (focusedColumnId !== columnId) {
        switchToColumn(columnId);
      }

      const clickedColumn = rawColumns.find(col => col.id === columnId);
      if (clickedColumn?.branchPoint) {
        setHighlightedMessageId(clickedColumn.branchPoint);
      } else {
        setHighlightedMessageId(null);
      }
    },
    [isFocused, focusedColumnId, panToColumn, switchToColumn, rawColumns],
  );

  const exitFocusMode = useCallback(() => {
    const transformInstance = transformRef.current;
    if (!transformInstance) return;

    setFocusedColumnId(null);
    dragStartRef.current = null;
  }, []);

  useEffect(() => {
    const transformInstance = transformRef.current;

    const handleWheel = (event: WheelEvent) => {
      if (!transformInstance) return;

      const isPinchGesture = event.ctrlKey;

      if (isPinchGesture) {
        event.preventDefault();
        handleZooming(event, transformInstance);
        return;
      }

      const isTouchpad = Math.abs(event.deltaX) > 0 || (Math.abs(event.deltaY) < 50 && event.deltaMode === 0);

      const isAltPressed = event.altKey;

      if (isAltPressed) {
        event.preventDefault();
        handleZooming(event, transformInstance);
        return;
      }

      if (isFocused) {
        handleFocusModeWheel(event, transformInstance, isTouchpad);
      } else {
        handleNormalModeWheel(event, transformInstance, isTouchpad);
      }
    };

    const handleFocusModeWheel = (event: WheelEvent, transformInstance: ReactZoomPanPinchRef, isTouchpad: boolean) => {
      const target = event.target as Element;
      const columnElement = target.closest('[data-column-id]') as HTMLElement;
      const scrollableContainer = target.closest('.overflow-y-auto') as HTMLElement;

      const isInFocusedColumn = columnElement && columnElement.getAttribute('data-column-id') === focusedColumnId;

      if (scrollableContainer && isInFocusedColumn) {
        const { scrollTop, scrollHeight, clientHeight } = scrollableContainer;
        const isAtTop = scrollTop <= 1;
        const isAtBottom = Math.abs(scrollTop + clientHeight - scrollHeight) <= 1;

        const isScrollingUp = event.deltaY < 0;
        const isScrollingDown = event.deltaY > 0;

        if ((isScrollingUp && !isAtTop) || (isScrollingDown && !isAtBottom)) {
          return;
        } else {
          event.preventDefault();
          return;
        }
      } else {
        event.preventDefault();
        handleCanvasPanning(event, transformInstance, isTouchpad);
        return;
      }
    };

    const handleNormalModeWheel = (event: WheelEvent, transformInstance: ReactZoomPanPinchRef, isTouchpad: boolean) => {
      event.preventDefault();
      handleCanvasPanning(event, transformInstance, isTouchpad);
    };

    const handleCanvasPanning = (event: WheelEvent, transformInstance: ReactZoomPanPinchRef, isTouchpad: boolean) => {
      const panSensitivity = isTouchpad ? 1 : 25;
      const deltaX = event.deltaX * panSensitivity;
      const deltaY = event.deltaY * panSensitivity;
      const currentState = transformInstance.instance.transformState;

      const maxMove = 200;
      const clampedDeltaX = Math.max(-maxMove, Math.min(maxMove, deltaX));
      const clampedDeltaY = Math.max(-maxMove, Math.min(maxMove, deltaY));

      transformInstance.setTransform(
        currentState.positionX - clampedDeltaX,
        currentState.positionY - clampedDeltaY,
        currentState.scale,
        0,
      );
    };

    const handleZooming = (event: WheelEvent, transformInstance: ReactZoomPanPinchRef) => {
      const rect = transformInstance.instance.wrapperComponent.getBoundingClientRect();
      const mouseX = event.clientX - rect.left;
      const mouseY = event.clientY - rect.top;

      const isPinchGesture = event.ctrlKey;
      const zoomStep = isPinchGesture ? 0.05 : 0.225;

      const currentScale = transformInstance.instance.transformState.scale;
      const newScale =
        event.deltaY < 0 ? Math.min(1.2, currentScale + zoomStep) : Math.max(0.5, currentScale - zoomStep);

      const scaleDiff = newScale - currentScale;
      const currentState = transformInstance.instance.transformState;
      const newX = currentState.positionX - (mouseX - currentState.positionX) * (scaleDiff / currentScale);
      const newY = currentState.positionY - (mouseY - currentState.positionY) * (scaleDiff / currentScale);

      transformInstance.setTransform(newX, newY, newScale, isPinchGesture ? 0 : 100, 'easeOut');
    };

    const timer = setTimeout(() => {
      const container = transformInstance?.instance?.wrapperComponent;
      if (container) {
        container.addEventListener('wheel', handleWheel, { passive: false });
      }
    }, 100);

    return () => {
      clearTimeout(timer);
      const container = transformInstance?.instance?.wrapperComponent;
      if (container) {
        container.removeEventListener('wheel', handleWheel);
      }
    };
  }, [isFocused, focusedColumnId]);

  const handleBranchCreate = useCallback(
    (fromColumnId: string, fromMessageId: string) => {
      if (onBranchCreate) {
        return onBranchCreate(fromColumnId, fromMessageId);
      }

      const sourceColumn = rawColumns.find(col => col.id === fromColumnId);
      if (!sourceColumn) return '';

      const branchPointIndex = sourceColumn.messages.findIndex(msg => msg.id === fromMessageId);
      if (branchPointIndex === -1) return '';

      const branchMessages = sourceColumn.messages.slice(0, branchPointIndex + 1);

      const newColumn: ChatColumnType = {
        id: `col_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        messages: branchMessages,
        parentColumnId: fromColumnId,
        branchPoint: fromMessageId,
        isActive: false,
        metadata: {
          title: `Branch from ${sourceColumn.metadata.title || 'Column'}`,
          createdAt: new Date(),
          lastActivity: new Date(),
        },
      };

      setRawColumns(prev => [...prev, newColumn]);
      return newColumn.id;
    },
    [rawColumns, onBranchCreate],
  );

  const containerClasses = ['w-full h-full bg-gray-50 dark:bg-slate-900', className].filter(Boolean).join(' ');

  return (
    <div className={containerClasses} style={style}>
      <CanvasControlPanel
        columns={rawColumns}
        activeColumnId={focusedColumnId}
        isFocused={isFocused}
        onFocusColumn={zoomToColumn}
      />

      <TransformWrapper
        ref={transformRef}
        initialScale={1}
        minScale={0.5}
        maxScale={1.2}
        centerOnInit={false}
        centerZoomedOut={false}
        limitToBounds={false}
        doubleClick={{ disabled: true }}
        smooth={false}
        velocityAnimation={{ disabled: true }}
        alignmentAnimation={{ disabled: true }}
        wheel={{
          disabled: true,
        }}
        pinch={{ disabled: false }}
        panning={{ disabled: false, velocityDisabled: true, excluded: ['nodrag'] }}
        onPanningStart={(ref, event) => {
          const target = event.target as Element;
          const columnElement = target.closest('.ChatColumn');

          if (isFocused) {
            if (columnElement) {
              const columnId = columnElement.closest('[data-column-id]')?.getAttribute('data-column-id');
              if (columnId === focusedColumnId) {
                return false;
              }
            } else {
              exitFocusMode();
              return false;
            }
          }
          return undefined;
        }}
        initialPositionX={initialPosition.centerX}
        initialPositionY={initialPosition.centerY}
        onInit={() => {}}
        onTransformed={(ref, state) => {
          // 监听缩放变化，应用字体补偿
          // 只有在 transform 事件结束后才应用补偿，避免频繁更新
          applyFontCompensation(state.scale);
        }}>
        <TransformComponent
          wrapperClass="!w-full !h-full"
          contentClass="!w-full !h-full !overflow-visible"
          wrapperStyle={{
            width: '100%',
            height: '100%',
          }}>
          <div
            className="fixed inset-0 opacity-20 pointer-events-none"
            style={{
              backgroundImage: `
                radial-gradient(circle at 20px 20px, rgba(0,0,0,0.15) 1px, transparent 0)
              `,
              backgroundSize: '40px 40px',
            }}
          />

          <div
            className="relative p-8"
            style={{
              width: (() => {
                if (processedColumns.length === 0) return '100vw';
                const minX = Math.min(...processedColumns.map(col => col.position.x));
                const maxX = Math.max(...processedColumns.map(col => col.position.x));
                const containerWidth = maxX - minX + (viewportSize.width * COLUMN_LAYOUT.WIDTH) / 100;
                return `${(containerWidth / viewportSize.width) * 100}vw`;
              })(),
              minWidth: (() => {
                if (processedColumns.length === 0) return '100vw';
                const minX = Math.min(...processedColumns.map(col => col.position.x));
                const maxX = Math.max(...processedColumns.map(col => col.position.x));
                const containerWidth = maxX - minX + (viewportSize.width * COLUMN_LAYOUT.WIDTH) / 100;
                return `${(containerWidth / viewportSize.width) * 100}vw`;
              })(),
              minHeight: '100vh',
              marginLeft: (() => {
                if (processedColumns.length === 0) return '0px';
                const minX = Math.min(...processedColumns.map(col => col.position.x));
                return minX < 0 ? `${Math.abs(minX)}px` : '0px';
              })(),
            }}>
            {processedColumns.length === 0 ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <p className="text-gray-500 dark:text-gray-400">Empty Canvas</p>
              </div>
            ) : (
              processedColumns.map(column => (
                <ColumnPositionWrapper key={column.id} position={column.position} width={column.width} debug={false}>
                  <div data-column-id={column.id}>
                    <ChatColumn
                      ref={getColumnRef(column.id)}
                      column={column}
                      isActive={column.id === focusedColumnId}
                      isFocused={isFocused && column.id === focusedColumnId}
                      onSelect={columnId => handleColumnClick(columnId)}
                      onDoubleClick={() => zoomToColumn(column.id)}
                      onBranch={messageId => handleBranchCreate(column.id, messageId)}
                      onMessageCreate={(content, parentId, options) =>
                        onMessageCreate?.(column.id, content, parentId, options)
                      }
                      onExitFocus={exitFocusMode}
                      width={COLUMN_LAYOUT.WIDTH}
                      highlightedMessageId={highlightedMessageId}
                    />
                  </div>
                </ColumnPositionWrapper>
              ))
            )}
          </div>
        </TransformComponent>
      </TransformWrapper>

      <div className="absolute bottom-4 left-4 z-20">
        <div className="bg-black/10 dark:bg-white/10 rounded-lg px-3 py-2">
          <div className="text-xs text-gray-600 dark:text-gray-400">
            {processedColumns.length} column{processedColumns.length !== 1 ? 's' : ''}
            {isFocused &&
              focusedColumnId &&
              ` • Focus: ${
                processedColumns.find(col => col.id === focusedColumnId)?.metadata?.title || focusedColumnId.slice(-8)
              }`}
          </div>
        </div>
      </div>

      {isFocused && (
        <div className="absolute bottom-4 right-4 z-10">
          <div className="bg-black/5 dark:bg-white/5 rounded px-2 py-1 text-xs text-gray-500 dark:text-gray-400">
            <span>
              <kbd className="px-1.5 py-0.5 text-xs font-semibold text-gray-800 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded">
                ESC
              </kbd>{' '}
              to unpin
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default MultiColumnCanvas;
