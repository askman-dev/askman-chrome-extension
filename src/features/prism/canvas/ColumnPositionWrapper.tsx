/**
 * 调用方：MultiColumnCanvas用来替代Flexbox布局，支持绝对定位
 * 依赖：React forwardRef，CSS absolute positioning
 */

import React, { forwardRef } from 'react';

export interface ColumnPositionWrapperProps {
  /** 列的位置坐标 */
  position: { x: number; y: number };
  /** 列的宽度（vw单位） */
  width: number;
  /** 子组件 */
  children: React.ReactNode;
  /** 额外的CSS类名 */
  className?: string;
  /** 是否启用调试模式显示位置信息 */
  debug?: boolean;
}

/**
 * 列位置包装器组件
 * 将Flexbox布局转换为绝对定位布局，支持Y轴精确定位
 */
const ColumnPositionWrapper = forwardRef<HTMLDivElement, ColumnPositionWrapperProps>(
  ({ position, width, children, className = '', debug = false }, ref) => {
    const wrapperClasses = ['absolute', 'transition-all duration-300 ease-in-out', className].filter(Boolean).join(' ');

    const wrapperStyle: React.CSSProperties = {
      left: `${position.x}px`, // 使用像素定位
      top: `${position.y}px`,
      width: `${width}vw`, // 宽度仍使用vw
      // 确保列不会因为内容高度导致布局问题
      minHeight: '200px',
    };

    return (
      <div ref={ref} className={wrapperClasses} style={wrapperStyle}>
        {/* 调试信息 */}
        {debug && (
          <div className="absolute top-0 left-0 z-50 bg-red-500 text-white text-xs px-2 py-1 rounded-br">
            x:{Math.round(position.x)}px y:{Math.round(position.y)}px
          </div>
        )}

        {children}
      </div>
    );
  },
);

ColumnPositionWrapper.displayName = 'ColumnPositionWrapper';

export default ColumnPositionWrapper;
