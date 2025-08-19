import React from 'react';

interface DialogTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  visible?: boolean;
  primary?: boolean;
}

export function DialogTrigger({ visible = true, primary = false, className, children, ...props }: DialogTriggerProps) {
  if (!visible) {
    return null;
  }

  const baseClasses =
    'px-3 py-2 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors';
  const primaryClasses = primary
    ? 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500'
    : 'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500';

  const combinedClasses = `${baseClasses} ${primaryClasses} ${className || ''}`.trim();

  return (
    <button className={combinedClasses} {...props}>
      {children}
    </button>
  );
}

export default DialogTrigger;
