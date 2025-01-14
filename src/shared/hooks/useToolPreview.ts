import { useState } from 'react';

export function useToolPreview() {
  const [showPreview, setShowPreview] = useState(false);
  const [previewPos, setPreviewPos] = useState({ x: 0, y: 0 });
  const [previewContent, setPreviewContent] = useState('');

  const showToolPreview = (element: HTMLElement, content: string) => {
    const buttonRect = element.getBoundingClientRect();
    const parentRect = element.parentElement?.getBoundingClientRect() || { left: 0, top: 0 };
    console.log('buttonRect.top = ', buttonRect.top, 'parentRect.top = ', parentRect.top);

    setPreviewPos({
      x: buttonRect.left - parentRect.left + buttonRect.width,
      y: buttonRect.top - buttonRect.height,
    });
    setPreviewContent(content);
    setShowPreview(true);
  };

  const hideToolPreview = () => {
    setShowPreview(false);
  };

  return {
    showPreview,
    previewPos,
    previewContent,
    showToolPreview,
    hideToolPreview,
  };
}
