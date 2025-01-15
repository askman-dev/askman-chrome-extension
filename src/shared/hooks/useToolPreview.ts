import { useState } from 'react';

export function useToolPreview() {
  const [showPreview, setShowPreview] = useState(false);
  const [previewPos, setPreviewPos] = useState({ x: 0, y: 0 });
  const [previewContent, setPreviewContent] = useState('');

  const showToolPreview = (element: HTMLElement, baseDropdownElement: HTMLElement, content: string) => {
    const buttonRect = element.getBoundingClientRect();
    const dropdownRect = baseDropdownElement.getBoundingClientRect();

    // Calculate the relative position between the menu item and dropdown
    const relativeY = buttonRect.top - dropdownRect.top;

    console.log('buttonRect', buttonRect, 'dropdownRect', dropdownRect);

    setPreviewPos({
      x: dropdownRect.width,
      y: relativeY,
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
