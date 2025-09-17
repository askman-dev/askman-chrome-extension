import React from 'react';

interface ModeToggleProps {
  value: boolean; // true = Agent mode, false = Chat mode
  onChange: (_value: boolean) => void;
  className?: string;
}

export function ModeToggle({ value, onChange, className = '' }: ModeToggleProps) {
  return (
    <div className="relative group">
      <button
        type="button"
        onClick={() => onChange(!value)}
        className={`inline-flex items-center justify-center h-5 px-2 text-[10px] font-normal bg-gray-100 text-gray-600 rounded hover:bg-black hover:text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-1 ${className}`}
        aria-label={value ? 'Switch to Chat mode' : 'Switch to Agent mode'}
        aria-pressed={value}>
        {value ? 'Agent' : 'Chat'}
      </button>

      {/* Tooltip */}
      <div className="absolute left-1/2 -translate-x-1/2 -top-8 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50">
        {value ? 'Agent Mode - Click to switch to Chat Mode' : 'Chat Mode - Click to switch to Agent Mode'}
      </div>
    </div>
  );
}
