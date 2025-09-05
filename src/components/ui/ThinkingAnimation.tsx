/**
 * 调用方：ChatColumn 在等待AI响应时显示思考动画
 * 依赖：React, Tailwind CSS
 */

import React from 'react';

interface ThinkingAnimationProps {
  className?: string;
}

export const ThinkingAnimation: React.FC<ThinkingAnimationProps> = ({ className = '' }) => {
  return (
    <div className={`flex items-center space-x-1 text-gray-500 dark:text-gray-400 ${className}`}>
      <div className="flex space-x-1">
        <div
          className="w-2 h-2 bg-current rounded-full animate-pulse"
          style={{ animationDelay: '0ms', animationDuration: '1.4s' }}
        />
        <div
          className="w-2 h-2 bg-current rounded-full animate-pulse"
          style={{ animationDelay: '200ms', animationDuration: '1.4s' }}
        />
        <div
          className="w-2 h-2 bg-current rounded-full animate-pulse"
          style={{ animationDelay: '400ms', animationDuration: '1.4s' }}
        />
      </div>
      <span className="text-sm italic ml-2">thinking...</span>
    </div>
  );
};
