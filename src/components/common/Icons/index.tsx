import React from 'react';

interface KeyBindingProps {
  text: string;
  className?: string;
  onClick?: () => void;
  children?: React.ReactNode;
}

export function KeyBinding({ text, className = '', onClick, children }: KeyBindingProps) {
  return (
    <b
      className={`bg-gray-100 rounded-md py-1 px-2 font-medium text-sm text-black text-opacity-50 ${className}`}
      onClick={onClick}>
      {text}
      {children}
    </b>
  );
}

export default KeyBinding;
