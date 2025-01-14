import React, { useEffect, useRef } from 'react';

interface ToolPreviewProps {
  content: string;
  x: number;
  y: number;
}

export const ToolPreview: React.FC<ToolPreviewProps> = ({ content, x, y }) => {
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    console.log('tool preview', x, y);
    if (tooltipRef.current) {
      console.log('tool preview 2');
      // const rect = tooltipRef.current.getBoundingClientRect();
      // const viewportWidth = window.innerWidth;

      // 水平位置：在右侧显示，与菜单保持一定距离
      let finalX = x + 10;

      // 垂直位置：与菜单项垂直居中对齐，增加偏移量
      let finalY = y; // 增加偏移量以更好对齐

      // 如果右侧空间不足，则显示在左侧
      // TODO fix 这里计算有错误
      // if (finalX + rect.width > viewportWidth - 20) {
      //   finalX = x - rect.width - 10;
      // }

      tooltipRef.current.style.left = `${finalX}px`;
      tooltipRef.current.style.top = `${finalY}px`;
      console.log('finalX = ', finalX, 'finalY = ', finalY);
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
