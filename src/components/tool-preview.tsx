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

      let finalX = x + 5;
      let finalY = y + 5;

      if (finalX + rect.width > viewportWidth) {
        finalX = x - rect.width - 5;
      }

      if (finalY + rect.height > viewportHeight) {
        finalY = y - rect.height - 5;
      }

      tooltipRef.current.style.left = `${finalX}px`;
      tooltipRef.current.style.top = `${finalY}px`;
    }
  }, [x, y]);

  return (
    <div
      ref={tooltipRef}
      className="absolute z-50 p-2 bg-black text-white text-sm text-left rounded shadow-lg max-w-md whitespace-pre-wrap">
      {content}
    </div>
  );
};
