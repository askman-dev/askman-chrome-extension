import React, { useEffect, useRef } from 'react';

/**
 * Props for the ToolPreview component
 */
interface ToolPreviewProps {
  /** Content to display in the preview */
  content: string;
  /** X coordinate for positioning */
  x: number;
  /** Y coordinate for positioning */
  y: number;
}

/**
 * ToolPreview component displays a tooltip-like preview with provided content at specified coordinates.
 * Used primarily by dropdown components to show previews of tools and system prompts.
 */
export function ToolPreview({ content, x, y }: ToolPreviewProps) {
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (tooltipRef.current) {
      // Position the tooltip at the specified coordinates
      const finalX = x;
      const finalY = y;

      // Apply the positioning to the tooltip element
      tooltipRef.current.style.right = `${finalX}px`;
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
}

// Export for backwards compatibility
export default ToolPreview;
