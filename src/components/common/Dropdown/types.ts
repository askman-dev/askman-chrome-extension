import React from 'react';

export interface DropdownItem {
  id: string;
  name: string;
  shortName?: string;
  [key: string]: any;
}

export interface DropdownProps {
  displayName: string;
  className?: string;
  onItemClick: (_item: any, _isCommandPressed: boolean) => void;
  statusListener: (_status: boolean) => void;
  initOpen: boolean;
  items: Array<DropdownItem>;
  shortcutKey?: string;
  renderItem?: (_item: any, _index: number, _active: boolean, _isSelected?: boolean) => React.ReactElement;
  selectedId?: string;
  showShortcut?: boolean;
  align?: 'left' | 'right';
  buttonDisplay?: string;
  onMainButtonClick?: (_e: React.MouseEvent) => void;
}

// 为了向后兼容
export interface BaseDropdownProps extends DropdownProps {} 