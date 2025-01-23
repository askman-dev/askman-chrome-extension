import { useState } from 'react';

export function useToolPreview() {
  const [showPreview, setShowPreview] = useState(false);
  const [previewPos, setPreviewPos] = useState({ x: 0, y: 0 });
  const [previewContent, setPreviewContent] = useState('');

  const showToolPreview = (
    menuItem: HTMLElement,
    menuButton: HTMLElement,
    align: 'left' | 'right',
    content: string,
  ) => {
    const menuItemRect = menuItem.getBoundingClientRect();
    const menuButtonRect = menuButton.getBoundingClientRect();

    // Calculate the relative position between the menu item and dropdown
    const relativeY = menuItemRect.top - menuButtonRect.top;

    console.log('menuItemRect-width', menuItemRect.width, 'menuButtonRect-width', menuButtonRect.width);

    if (align === 'right') {
      setPreviewPos({
        x: menuItemRect.width,
        y: relativeY,
      });
    } else {
      setPreviewPos({
        x: menuButtonRect.width,
        y: relativeY,
      });
    }

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
