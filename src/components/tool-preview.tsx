import React, { useEffect, useRef } from 'react';

interface ToolPreviewProps {
  content: string;
  x: number;
  y: number;
}

export const ToolPreview: React.FC<ToolPreviewProps> = ({ content, x, y }) => {
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 确保提示框不会超出视窗
    if (tooltipRef.current) {
      const rect = tooltipRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      // 向右显示，与光标保持距离
      let finalX = x + 10; // 增加与光标的水平距离
      let finalY = y - rect.height / 2; // 垂直居中对齐

      // 如果右侧空间不足，则显示在左侧
      if (finalX + rect.width > viewportWidth - 20) {
        finalX = x - rect.width - 10;
      }

      // 确保不会超出顶部和底部
      if (finalY < 10) {
        finalY = 10;
      } else if (finalY + rect.height > viewportHeight - 10) {
        finalY = viewportHeight - rect.height - 10;
      }

      tooltipRef.current.style.left = `${finalX}px`;
      tooltipRef.current.style.top = `${finalY}px`;
    }
  }, [x, y]);

  return (
    <div
      ref={tooltipRef}
      className="absolute z-50 p-2 bg-black text-white text-sm text-left rounded shadow-lg min-w-[200px] max-w-[300px] max-h-[200px] overflow-hidden">
      <pre className="text-xs whitespace-pre-wrap line-clamp-[12]">{content}</pre>
    </div>
  );
};
